import { connectToDatabase } from '@/lib/mongodb';
import UserModel from '@/models/User';
import { Product } from '@/models/Product';
import { Order } from '@/models/Order';
import { createSessionToken } from '@/lib/auth';
import { POST as signup } from '@/app/api/auth/signup/route';
import { POST as login } from '@/app/api/auth/login/route';
import { GET as getMe } from '@/app/api/auth/me/route';
import { POST as logout } from '@/app/api/auth/logout/route';
import { GET as getProfile, PATCH as updateProfile } from '@/app/api/account/profile/route';
import { GET as getAccountOrders } from '@/app/api/account/orders/route';
import { GET as getProducts } from '@/app/api/products/route';
import { GET as getProductBySlug } from '@/app/api/products/[slug]/route';
import { POST as createOrder, GET as getOrders } from '@/app/api/orders/route';
import { GET as getOrderById } from '@/app/api/orders/[orderId]/route';
import { POST as heartbeat } from '@/app/api/users/heartbeat/route';

async function runFullStackTests() {
  console.log('==================================================');
  console.log('DEMONSTORE FULL-STACK END-TO-END VERIFICATION');
  console.log('==================================================\n');

  await connectToDatabase();
  const ts = Date.now();
  const testEmail = `e2e_user_${ts}@demonstore.test`;
  const testPassword = 'Password123!';
  let passed = 0;
  let failed = 0;

  function assert(cond: boolean, name: string, info?: any) {
    if (cond) {
      passed++;
      console.log(`  ✓ PASS: ${name}`);
    } else {
      failed++;
      console.error(`  ❌ FAIL: ${name}`, info || '');
    }
  }

  try {
    console.log('--- 1. Testing Customer Registration & Auth Flow ---');
    const signupReq = new Request('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Tanjiro Kamado',
        email: testEmail,
        password: testPassword,
      }),
    });
    const signupRes = await signup(signupReq);
    const signupJson = await signupRes.json();
    assert(signupRes.status === 201 && signupJson.success, 'POST /api/auth/signup creates account');

    const createdUser = await UserModel.findOne({ email: testEmail });
    assert(Boolean(createdUser), 'User saved to MongoDB collection');

    const token = await createSessionToken({
      userId: createdUser!._id.toString(),
      email: createdUser!.email,
      name: createdUser!.name,
    });
    assert(Boolean(token), 'Generated valid session token');

    const loginReq = new Request('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    const loginRes = await login(loginReq);
    const loginJson = await loginRes.json();
    assert(
      loginRes.status === 200 && loginJson.success && loginJson.user.email === testEmail,
      'POST /api/auth/login succeeds with correct credentials'
    );

    const meReq = new Request('http://localhost:3000/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const meRes = await getMe(meReq);
    const meJson = await meRes.json();
    assert(
      meRes.status === 200 && meJson.user && meJson.user.email === testEmail,
      'GET /api/auth/me returns authenticated user'
    );

    console.log('\n--- 2. Testing Customer Profile & Heartbeat ---');
    const profileReq = new Request('http://localhost:3000/api/account/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const profileRes = await getProfile(profileReq);
    const profileJson = await profileRes.json();
    assert(
      profileRes.status === 200 && profileJson.user.email === testEmail,
      'GET /api/account/profile returns profile'
    );

    const updateProfReq = new Request('http://localhost:3000/api/account/profile', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: 'Tanjiro Kamado [Sun]' }),
    });
    const updateProfRes = await updateProfile(updateProfReq);
    const updateProfJson = await updateProfRes.json();
    assert(
      updateProfRes.status === 200 && updateProfJson.user.name === 'Tanjiro Kamado [Sun]',
      'PATCH /api/account/profile updates name'
    );

    const hbReq = new Request('http://localhost:3000/api/users/heartbeat', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });
    const hbRes = await heartbeat(hbReq);
    const hbJson = await hbRes.json();
    assert(hbRes.status === 200 && hbJson.success, 'POST /api/users/heartbeat records user activity');

    console.log('\n--- 3. Testing Product Catalog & Single Product APIs ---');
    const prodsRes = await getProducts();
    const prodsJson = await prodsRes.json();
    assert(
      prodsRes.status === 200 && prodsJson.products.length === 28,
      'GET /api/products returns all 28 canonical items'
    );

    const sampleSlug = prodsJson.products[0].slug;
    const singleProdReq = new Request(`http://localhost:3000/api/products/${sampleSlug}`);
    const singleProdRes = await getProductBySlug(singleProdReq, {
      params: Promise.resolve({ slug: sampleSlug }),
    });
    const singleProdJson = await singleProdRes.json();
    assert(
      singleProdRes.status === 200 && singleProdJson.product.slug === sampleSlug,
      'GET /api/products/:slug returns product details'
    );

    console.log('\n--- 4. Testing Order Creation & Order Lookup ---');
    const orderReq = new Request('http://localhost:3000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        customer: {
          firstName: 'Tanjiro',
          lastName: 'Kamado',
          email: testEmail,
        },
        shippingAddress: {
          streetAddress: '77 Hinokami Ridge',
          city: 'Tokyo',
          postalCode: '100-0001',
          country: 'Japan',
        },
        items: [{ slug: sampleSlug, selectedSize: 'L', quantity: 1 }],
      }),
    });
    const orderRes = await createOrder(orderReq);
    const orderJson = await orderRes.json();
    assert(
      orderRes.status === 201 && orderJson.success && orderJson.order.orderId,
      'POST /api/orders creates order successfully'
    );

    const createdOrderId = orderJson.order.orderId;
    const getOrderReq = new Request(`http://localhost:3000/api/orders/${createdOrderId}`);
    const getOrderRes = await getOrderById(getOrderReq, {
      params: Promise.resolve({ orderId: createdOrderId }),
    });
    const getOrderJson = await getOrderRes.json();
    assert(
      getOrderRes.status === 200 && getOrderJson.order.orderId === createdOrderId,
      'GET /api/orders/:orderId retrieves created order'
    );

    // Update created order with userId for account order history check
    await Order.updateOne({ orderId: createdOrderId }, { $set: { userId: createdUser!._id.toString() } });

    const accOrdersReq = new Request('http://localhost:3000/api/account/orders', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const accOrdersRes = await getAccountOrders(accOrdersReq);
    const accOrdersJson = await accOrdersRes.json();
    assert(
      accOrdersRes.status === 200 && accOrdersJson.orders.length >= 1,
      'GET /api/account/orders retrieves user order history'
    );

    console.log('\n--- 5. Cleanup Test Data ---');
    await UserModel.deleteOne({ email: testEmail });
    await Order.deleteOne({ orderId: createdOrderId });
    // Restore stock for sample product
    await Product.updateOne({ slug: sampleSlug }, { $inc: { stock: 1 } });
    console.log('✓ Cleaned up test user and order');

    console.log('\n==================================================');
    console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('==================================================');

    process.exit(failed === 0 ? 0 : 1);
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runFullStackTests();
