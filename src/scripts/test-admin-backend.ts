import { connectToDatabase } from '@/lib/mongodb';
import UserModel from '@/models/User';
import { Product } from '@/models/Product';
import { Order } from '@/models/Order';
import {
  hashPassword,
  createSessionToken,
  requireAdmin,
  authenticateUser,
  ACTIVE_USER_WINDOW_MINUTES,
  LOW_STOCK_THRESHOLD,
} from '@/lib/auth';

// Import route handlers directly to test end-to-end logic in server environment
import { GET as getDashboard } from '@/app/api/admin/dashboard/route';
import { GET as getAnalytics } from '@/app/api/admin/analytics/route';
import { GET as getAdminUsers } from '@/app/api/admin/users/route';
import { GET as getAdminUserDetail } from '@/app/api/admin/users/[id]/route';
import { PATCH as updateAdminUserRole } from '@/app/api/admin/users/[id]/role/route';
import { PATCH as updateAdminUserStatus } from '@/app/api/admin/users/[id]/status/route';
import { GET as getAdminProducts, POST as createAdminProduct } from '@/app/api/admin/products/route';
import {
  GET as getAdminProductDetail,
  PATCH as updateAdminProduct,
  DELETE as deleteAdminProduct,
} from '@/app/api/admin/products/[slug]/route';
import { GET as getAdminOrders } from '@/app/api/admin/orders/route';
import {
  GET as getAdminOrderDetail,
  PATCH as updateAdminOrder,
} from '@/app/api/admin/orders/[orderId]/route';
import { PATCH as updateAdminOrderStatus } from '@/app/api/admin/orders/[orderId]/status/route';
import { POST as heartbeat } from '@/app/api/users/heartbeat/route';

// Customer route handlers for regression verification
import { GET as getPublicProducts } from '@/app/api/products/route';
import { GET as getPublicProductSlug } from '@/app/api/products/[slug]/route';
import { GET as getPublicOrders } from '@/app/api/orders/route';
import { GET as getPublicOrderById } from '@/app/api/orders/[orderId]/route';

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: any) {
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${testName}`, detail || '');
  }
}

function mockRequest(
  url: string,
  options: {
    method?: string;
    token?: string;
    body?: any;
  } = {}
): Request {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (options.token) {
    headers['Authorization'] = `Bearer ${options.token}`;
  }

  const reqInit: RequestInit = {
    method: options.method || 'GET',
    headers,
  };

  if (options.body) {
    reqInit.body = JSON.stringify(options.body);
  }

  return new Request(url, reqInit);
}

async function runVerification() {
  console.log('\n======================================================');
  console.log('  DEMONSTORE ADMIN BACKEND VERIFICATION SUITE');
  console.log('======================================================\n');

  const mongoose = await connectToDatabase();
  console.log(`✓ Connected to Database: "${mongoose.connection.name}"\n`);

  // Test setup: Create temporary test accounts
  const timestamp = Date.now();
  const testAdminEmail = `test_admin_${timestamp}@demoncorps.test`;
  const testUserEmail = `test_user_${timestamp}@demoncorps.test`;
  const testDisabledEmail = `test_disabled_${timestamp}@demoncorps.test`;
  const testPass = 'Password123!';
  const passwordHash = await hashPassword(testPass);

  console.log('--- 1. Setting up Isolated Test Accounts ---');

  const testAdmin = await UserModel.create({
    name: 'Test Administrator',
    email: testAdminEmail,
    passwordHash,
    role: 'admin',
    status: 'active',
    lastSeen: new Date(),
  });

  const testUser = await UserModel.create({
    name: 'Test Normal User',
    email: testUserEmail,
    passwordHash,
    role: 'user',
    status: 'active',
    lastSeen: new Date(),
  });

  const testDisabledUser = await UserModel.create({
    name: 'Test Disabled User',
    email: testDisabledEmail,
    passwordHash,
    role: 'user',
    status: 'disabled',
    lastSeen: new Date(),
  });

  const adminToken = await createSessionToken({
    userId: testAdmin._id.toString(),
    email: testAdmin.email,
    name: testAdmin.name,
  });

  const userToken = await createSessionToken({
    userId: testUser._id.toString(),
    email: testUser.email,
    name: testUser.name,
  });

  const disabledToken = await createSessionToken({
    userId: testDisabledUser._id.toString(),
    email: testDisabledUser.email,
    name: testDisabledUser.name,
  });

  console.log('✓ Created Admin, Regular User, and Disabled User fixtures\n');

  try {
    // -------------------------------------------------------------
    console.log('--- 2. Testing Authentication & Authorization Middleware ---');
    // -------------------------------------------------------------
    // Unauthenticated
    const anonReq = mockRequest('http://localhost:3000/api/admin/dashboard');
    const anonRes = await getDashboard(anonReq);
    assert(anonRes.status === 401, 'Anonymous request to /api/admin/dashboard returns 401 Unauthorized');

    // Normal User
    const userReq = mockRequest('http://localhost:3000/api/admin/dashboard', { token: userToken });
    const userRes = await getDashboard(userReq);
    assert(userRes.status === 403, 'Normal user request to /api/admin/dashboard returns 403 Forbidden');

    // Disabled User
    const disabledReq = mockRequest('http://localhost:3000/api/admin/dashboard', { token: disabledToken });
    const disabledRes = await getDashboard(disabledReq);
    assert(disabledRes.status === 403, 'Disabled user request to /api/admin/dashboard returns 403 Forbidden');

    // Admin User
    const adminReq = mockRequest('http://localhost:3000/api/admin/dashboard', { token: adminToken });
    const adminRes = await getDashboard(adminReq);
    const adminJson = await adminRes.json();
    assert(adminRes.status === 200 && adminJson.success === true, 'Admin request to /api/admin/dashboard returns 200 OK with success: true');

    // -------------------------------------------------------------
    console.log('\n--- 3. Testing Active User Tracking & Heartbeat ---');
    // -------------------------------------------------------------
    const hbAnonReq = mockRequest('http://localhost:3000/api/users/heartbeat', { method: 'POST' });
    const hbAnonRes = await heartbeat(hbAnonReq);
    assert(hbAnonRes.status === 401, 'Anonymous POST /api/users/heartbeat returns 401');

    const hbUserReq = mockRequest('http://localhost:3000/api/users/heartbeat', { method: 'POST', token: userToken });
    const hbUserRes = await heartbeat(hbUserReq);
    const hbUserJson = await hbUserRes.json();
    assert(hbUserRes.status === 200 && hbUserJson.success === true && hbUserJson.lastSeen, 'Authenticated user POST /api/users/heartbeat updates lastSeen (200 OK)');

    // -------------------------------------------------------------
    console.log('\n--- 4. Testing Admin Dashboard Metrics ---');
    // -------------------------------------------------------------
    assert(typeof adminJson.stats.totalUsers === 'number', 'Dashboard returns numeric totalUsers');
    assert(typeof adminJson.stats.activeUsers === 'number', 'Dashboard returns numeric activeUsers');
    assert(typeof adminJson.stats.totalProducts === 'number', 'Dashboard returns numeric totalProducts');
    assert(typeof adminJson.stats.totalOrders === 'number', 'Dashboard returns numeric totalOrders');
    assert(typeof adminJson.stats.totalRevenue === 'number', 'Dashboard returns numeric totalRevenue');
    assert(typeof adminJson.stats.lowStockProducts === 'number', 'Dashboard returns numeric lowStockProducts');

    // -------------------------------------------------------------
    console.log('\n--- 5. Testing Admin Analytics API ---');
    // -------------------------------------------------------------
    const analyticsReq = mockRequest('http://localhost:3000/api/admin/analytics?range=30d', { token: adminToken });
    const analyticsRes = await getAnalytics(analyticsReq);
    const analyticsJson = await analyticsRes.json();
    assert(analyticsRes.status === 200 && analyticsJson.success === true, 'GET /api/admin/analytics?range=30d returns 200 OK');
    assert(Array.isArray(analyticsJson.revenue.timeline), 'Analytics returns revenue timeline array');
    assert(Array.isArray(analyticsJson.orders.statusDistribution), 'Analytics returns orders status distribution array');
    assert(Array.isArray(analyticsJson.users.timeline), 'Analytics returns user registrations timeline array');
    assert(Array.isArray(analyticsJson.products.bestSellers), 'Analytics returns bestSellers array');
    assert(Array.isArray(analyticsJson.products.categoryPerformance), 'Analytics returns categoryPerformance array');

    // -------------------------------------------------------------
    console.log('\n--- 6. Testing Admin User Management APIs ---');
    // -------------------------------------------------------------
    // List with pagination and search
    const usersReq = mockRequest(`http://localhost:3000/api/admin/users?page=1&limit=10&search=${testAdminEmail}`, { token: adminToken });
    const usersRes = await getAdminUsers(usersReq);
    const usersJson = await usersRes.json();
    assert(usersRes.status === 200 && usersJson.users.length === 1, 'GET /api/admin/users finds user by search query');
    assert(usersJson.pagination.page === 1 && usersJson.pagination.limit === 10, 'GET /api/admin/users includes valid pagination metadata');
    assert(!usersJson.users[0].passwordHash, 'User list NEVER includes passwordHash');

    // User details
    const userDetailReq = mockRequest(`http://localhost:3000/api/admin/users/${testUser._id}`, { token: adminToken });
    const userDetailRes = await getAdminUserDetail(userDetailReq, { params: Promise.resolve({ id: testUser._id.toString() }) });
    const userDetailJson = await userDetailRes.json();
    assert(userDetailRes.status === 200 && userDetailJson.user.email === testUserEmail, 'GET /api/admin/users/:id returns user details');
    assert(typeof userDetailJson.user.stats.totalOrders === 'number', 'User details includes aggregated order statistics');

    // Update Role
    const roleReq = mockRequest(`http://localhost:3000/api/admin/users/${testUser._id}/role`, {
      method: 'PATCH',
      token: adminToken,
      body: { role: 'admin' },
    });
    const roleRes = await updateAdminUserRole(roleReq, { params: Promise.resolve({ id: testUser._id.toString() }) });
    const roleJson = await roleRes.json();
    assert(roleRes.status === 200 && roleJson.user.role === 'admin', 'PATCH /api/admin/users/:id/role updates user role to admin');

    // Revert role
    const revertRoleReq = mockRequest(`http://localhost:3000/api/admin/users/${testUser._id}/role`, {
      method: 'PATCH',
      token: adminToken,
      body: { role: 'user' },
    });
    const revertRoleRes = await updateAdminUserRole(revertRoleReq, { params: Promise.resolve({ id: testUser._id.toString() }) });
    assert(revertRoleRes.status === 200, 'Reverted promoted user back to regular user');

    // Update Status
    const statusReq = mockRequest(`http://localhost:3000/api/admin/users/${testUser._id}/status`, {
      method: 'PATCH',
      token: adminToken,
      body: { status: 'disabled' },
    });
    const statusRes = await updateAdminUserStatus(statusReq, { params: Promise.resolve({ id: testUser._id.toString() }) });
    const statusJson = await statusRes.json();
    assert(statusRes.status === 200 && statusJson.user.status === 'disabled', 'PATCH /api/admin/users/:id/status disables user');

    // Re-enable status
    const reenableReq = mockRequest(`http://localhost:3000/api/admin/users/${testUser._id}/status`, {
      method: 'PATCH',
      token: adminToken,
      body: { status: 'active' },
    });
    const reenableRes = await updateAdminUserStatus(reenableReq, { params: Promise.resolve({ id: testUser._id.toString() }) });
    assert(reenableRes.status === 200, 'Re-enabled user account');

    // -------------------------------------------------------------
    console.log('\n--- 7. Testing Admin Product Management APIs ---');
    // -------------------------------------------------------------
    const testProductSlug = `test-hoodie-${timestamp}`;
    const createProdReq = mockRequest('http://localhost:3000/api/admin/products', {
      method: 'POST',
      token: adminToken,
      body: {
        id: `prod-test-${timestamp}`,
        slug: testProductSlug,
        name: 'Test Prototype Demon Slayer Hoodie',
        category: 'Hoodies',
        price: 3999,
        description: 'Test description for admin backend verification.',
        character: 'Demon Slayer Corps',
        collection: 'PROTOTYPE',
        stock: 12,
        sizes: ['M', 'L'],
        featured: true,
      },
    });
    const createProdRes = await createAdminProduct(createProdReq);
    const createProdJson = await createProdRes.json();
    assert(createProdRes.status === 201 && createProdJson.product.slug === testProductSlug, 'POST /api/admin/products creates a new product (201 Created)');

    // Product list with pagination & search
    const prodListReq = mockRequest(`http://localhost:3000/api/admin/products?search=${testProductSlug}`, { token: adminToken });
    const prodListRes = await getAdminProducts(prodListReq);
    const prodListJson = await prodListRes.json();
    assert(prodListRes.status === 200 && prodListJson.products.length === 1, 'GET /api/admin/products filters and finds created product');

    // Product detail
    const prodDetailReq = mockRequest(`http://localhost:3000/api/admin/products/${testProductSlug}`, { token: adminToken });
    const prodDetailRes = await getAdminProductDetail(prodDetailReq, { params: Promise.resolve({ slug: testProductSlug }) });
    const prodDetailJson = await prodDetailRes.json();
    assert(prodDetailRes.status === 200 && prodDetailJson.product.slug === testProductSlug, 'GET /api/admin/products/:id retrieves single product');

    // Product update
    const prodUpdateReq = mockRequest(`http://localhost:3000/api/admin/products/${testProductSlug}`, {
      method: 'PATCH',
      token: adminToken,
      body: { price: 4499, stock: 20 },
    });
    const prodUpdateRes = await updateAdminProduct(prodUpdateReq, { params: Promise.resolve({ slug: testProductSlug }) });
    const prodUpdateJson = await prodUpdateRes.json();
    assert(prodUpdateRes.status === 200 && prodUpdateJson.product.price === 4499 && prodUpdateJson.product.stock === 20, 'PATCH /api/admin/products/:id updates price and stock');

    // Product delete
    const prodDelReq = mockRequest(`http://localhost:3000/api/admin/products/${testProductSlug}`, {
      method: 'DELETE',
      token: adminToken,
    });
    const prodDelRes = await deleteAdminProduct(prodDelReq, { params: Promise.resolve({ slug: testProductSlug }) });
    assert(prodDelRes.status === 200, 'DELETE /api/admin/products/:id deletes product');

    // -------------------------------------------------------------
    console.log('\n--- 8. Testing Admin Order Management APIs ---');
    // -------------------------------------------------------------
    // Create a temporary test order
    const testOrderId = `ORD-TEST-${timestamp}`;
    const testOrder = await Order.create({
      orderId: testOrderId,
      userId: testUser._id.toString(),
      customer: {
        firstName: 'Test',
        lastName: 'Customer',
        email: testUserEmail,
      },
      shippingAddress: {
        streetAddress: '123 Hashira Way',
        city: 'Tokyo',
        postalCode: '100-0001',
        country: 'Japan',
      },
      items: [
        {
          productId: 'prod-dummy',
          slug: 'dummy-hoodie',
          name: 'Dummy Hoodie',
          selectedSize: 'L',
          quantity: 1,
          price: 2999,
        },
      ],
      subtotal: 2999,
      shippingCost: 0,
      total: 2999,
      currency: 'INR',
      status: 'pending',
    });

    // List orders with search
    const ordersReq = mockRequest(`http://localhost:3000/api/admin/orders?search=${testOrderId}`, { token: adminToken });
    const ordersRes = await getAdminOrders(ordersReq);
    const ordersJson = await ordersRes.json();
    assert(ordersRes.status === 200 && ordersJson.orders.length === 1, 'GET /api/admin/orders finds order with search and pagination');

    // Get order detail
    const orderDetailReq = mockRequest(`http://localhost:3000/api/admin/orders/${testOrderId}`, { token: adminToken });
    const orderDetailRes = await getAdminOrderDetail(orderDetailReq, { params: Promise.resolve({ orderId: testOrderId }) });
    const orderDetailJson = await orderDetailRes.json();
    assert(orderDetailRes.status === 200 && orderDetailJson.order.orderId === testOrderId, 'GET /api/admin/orders/:id returns order details');

    // Update order status via PATCH /api/admin/orders/:id
    const orderPatchReq = mockRequest(`http://localhost:3000/api/admin/orders/${testOrderId}`, {
      method: 'PATCH',
      token: adminToken,
      body: { status: 'confirmed' },
    });
    const orderPatchRes = await updateAdminOrder(orderPatchReq, { params: Promise.resolve({ orderId: testOrderId }) });
    const orderPatchJson = await orderPatchRes.json();
    assert(orderPatchRes.status === 200 && orderPatchJson.order.status === 'confirmed', 'PATCH /api/admin/orders/:id updates order status to confirmed');

    // Update order status via dedicated PATCH /api/admin/orders/:id/status
    const orderStatusReq = mockRequest(`http://localhost:3000/api/admin/orders/${testOrderId}/status`, {
      method: 'PATCH',
      token: adminToken,
      body: { status: 'shipped' },
    });
    const orderStatusRes = await updateAdminOrderStatus(orderStatusReq, { params: Promise.resolve({ orderId: testOrderId }) });
    const orderStatusJson = await orderStatusRes.json();
    assert(orderStatusRes.status === 200 && orderStatusJson.order.status === 'shipped', 'PATCH /api/admin/orders/:id/status updates order status to shipped');

    // -------------------------------------------------------------
    console.log('\n--- 9. Regression Testing on Existing Customer APIs ---');
    // -------------------------------------------------------------
    const pubProductsRes = await getPublicProducts();
    const pubProductsJson = await pubProductsRes.json();
    assert(pubProductsRes.status === 200 && Array.isArray(pubProductsJson.products), 'Public GET /api/products returns products array (zero regression)');

    const pubOrdersRes = await getPublicOrders(new Request('http://localhost:3000/api/orders'));
    const pubOrdersJson = await pubOrdersRes.json();
    assert(pubOrdersRes.status === 200 && Array.isArray(pubOrdersJson.orders), 'Public GET /api/orders returns orders array (zero regression)');

    // -------------------------------------------------------------
    console.log('\n--- 10. Cleaning up Test Fixtures ---');
    // -------------------------------------------------------------
    await UserModel.deleteMany({ email: { $in: [testAdminEmail, testUserEmail, testDisabledEmail] } });
    await Order.deleteOne({ orderId: testOrderId });
    await Product.deleteOne({ slug: testProductSlug });
    console.log('✓ Cleaned up test database fixtures.');

  } catch (err) {
    console.error('❌ Exception during verification test execution:', err);
    failedTests++;
  } finally {
    await mongoose.disconnect();
    console.log('✓ MongoDB connection closed cleanly.\n');
  }

  console.log('======================================================');
  console.log(`  VERIFICATION RESULTS: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('======================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Fatal verification runner error:', err);
  process.exit(1);
});
