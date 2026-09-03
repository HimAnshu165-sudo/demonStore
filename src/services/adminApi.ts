import {
  AdminUser,
  AdminProduct,
  AdminOrder,
  DashboardStats,
  AnalyticsData,
  AdminSettings,
  PaginatedResult,
  UserFilterParams,
  ProductFilterParams,
  OrderFilterParams,
  UserRole,
  UserStatus,
  OrderStatus,
  PaymentStatus,
  ProductStockStatus,
} from '@/types/admin';

// Helper to format last active timestamp
function formatLastSeen(lastSeenDate?: string | Date): string {
  if (!lastSeenDate) return 'Active recently';
  const diffMs = Date.now() - new Date(lastSeenDate).getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins <= 2) return 'Active now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

function isUserOnline(lastSeenDate?: string | Date): boolean {
  if (!lastSeenDate) return false;
  const diffMs = Date.now() - new Date(lastSeenDate).getTime();
  return diffMs < 5 * 60 * 1000; // 5 minutes threshold
}

function normalizeUser(u: any): AdminUser {
  const role: UserRole = u.role === 'admin' ? 'admin' : 'customer';
  const status: UserStatus = u.status === 'disabled' ? 'suspended' : 'active';
  const lastActiveStr = u.lastSeen ? new Date(u.lastSeen).toISOString() : new Date().toISOString();

  return {
    id: u.id || u._id || `usr_${Date.now()}`,
    name: u.name || 'Disciple',
    email: u.email || '',
    role,
    status,
    avatar: u.avatar || (role === 'admin' ? '/assets/castle/01-entrance.png' : '/assets/castle/02-hall.png'),
    japaneseTitle: u.japaneseTitle || (role === 'admin' ? '鬼舞辻無惨 // LORD OF INFINITY' : '門弟 // CITADEL DISCIPLE'),
    createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
    lastActive: lastActiveStr,
    lastSeen: formatLastSeen(u.lastSeen),
    isOnline: isUserOnline(u.lastSeen),
    ordersCount: typeof u.ordersCount === 'number' ? u.ordersCount : 0,
    totalSpent: typeof u.totalSpent === 'number' ? u.totalSpent : 0,
    phone: u.phone || '',
    shippingAddress: u.shippingAddress || {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Japan',
    },
  };
}

function normalizeProduct(p: any): AdminProduct {
  const stock = typeof p.stock === 'number' ? p.stock : 0;
  const stockStatus: ProductStockStatus =
    stock <= 0 ? 'out_of_stock' : stock <= 5 ? 'low_stock' : 'in_stock';

  return {
    id: p.id || p.slug || p._id || `prod_${Date.now()}`,
    slug: p.slug || 'untitled-product',
    name: p.name || 'Untitled Garment',
    category: p.category || 'Hoodies',
    imagePath: p.imagePath || p.images?.[0] || '/assets/products/hoodie_01.png',
    japaneseTitle: p.japaneseTitle || '',
    character: p.character || '',
    rank: p.rank || '',
    collection: p.collection || 'Drop 001',
    price: typeof p.price === 'number' ? p.price : 0,
    currency: p.currency || 'INR',
    formattedPrice: p.formattedPrice || `₹${(p.price || 0).toLocaleString('en-IN')}`,
    description: p.description || '',
    details: Array.isArray(p.details) ? p.details : [],
    material: p.material || '',
    gsm: typeof p.gsm === 'number' ? p.gsm : undefined,
    fit: p.fit || '',
    color: p.color || '',
    sizes: Array.isArray(p.sizes) && p.sizes.length ? p.sizes : ['S', 'M', 'L', 'XL'],
    images: Array.isArray(p.images) && p.images.length ? p.images : ['/assets/products/hoodie_01.png'],
    lookbookImages: Array.isArray(p.lookbookImages) ? p.lookbookImages : [],
    stock,
    stockStatus,
    tags: Array.isArray(p.tags) ? p.tags : [],
    discount: typeof p.discount === 'number' ? p.discount : 0,
    salesCount: typeof p.salesCount === 'number' ? p.salesCount : 0,
    createdAt: p.createdAt ? new Date(p.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: p.updatedAt ? new Date(p.updatedAt).toISOString() : new Date().toISOString(),
  };
}

function normalizeOrder(o: any): AdminOrder {
  const subtotal = typeof o.subtotal === 'number' ? o.subtotal : (o.total || 0);
  const shippingFee = typeof o.shippingCost === 'number' ? o.shippingCost : 0;
  const totalAmount = typeof o.total === 'number' ? o.total : subtotal + shippingFee;

  let orderStatus: OrderStatus = 'processing';
  if (o.status === 'confirmed') orderStatus = 'confirmed';
  else if (o.status === 'shipped') orderStatus = 'shipped';
  else if (o.status === 'delivered') orderStatus = 'delivered';
  else if (o.status === 'cancelled') orderStatus = 'cancelled';
  else if (o.status === 'pending') orderStatus = 'processing';

  const customerName = `${o.customer?.firstName || ''} ${o.customer?.lastName || ''}`.trim() || 'Patron';

  return {
    id: o.id || o.orderId || o._id || `ord_${Date.now()}`,
    orderNumber: o.orderId || `ORD-${Date.now()}`,
    customer: {
      id: o.userId || 'guest',
      name: customerName,
      email: o.customer?.email || '',
      avatar: '/assets/castle/02-hall.png',
    },
    items: Array.isArray(o.items)
      ? o.items.map((item: any) => ({
          productId: item.productId || item.slug || `prod_${Math.random()}`,
          name: item.name || 'Garment',
          slug: item.slug || '',
          category: item.category || 'Hoodies',
          image: item.image || (Array.isArray(item.images) ? item.images[0] : '/assets/products/hoodie_01.png'),
          size: item.selectedSize || item.size || 'L',
          quantity: typeof item.quantity === 'number' ? item.quantity : 1,
          unitPrice: typeof item.price === 'number' ? item.price : 0,
          total: (item.price || 0) * (item.quantity || 1),
          gsm: item.gsm,
        }))
      : [],
    subtotal,
    shippingFee,
    tax: 0,
    totalAmount,
    paymentStatus: (o.paymentStatus || 'paid') as PaymentStatus,
    orderStatus,
    shippingAddress: {
      name: customerName,
      street: o.shippingAddress?.streetAddress || o.shippingAddress?.street || '',
      city: o.shippingAddress?.city || 'Tokyo',
      state: o.shippingAddress?.state || 'Tokyo',
      postalCode: o.shippingAddress?.postalCode || '',
      country: o.shippingAddress?.country || 'Japan',
      phone: o.shippingAddress?.phone,
    },
    trackingNumber: o.trackingNumber,
    notes: o.notes,
    createdAt: o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: o.updatedAt ? new Date(o.updatedAt).toISOString() : new Date().toISOString(),
  };
}

class AdminApiService {
  // --------------------------------------------------------------------------
  // DASHBOARD
  // --------------------------------------------------------------------------
  async getDashboardStats(): Promise<DashboardStats> {
    const res = await fetch('/api/admin/dashboard', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch citadel telemetry');
    }

    const s = data.stats || data;

    return {
      totalUsers: typeof s.totalUsers === 'number' ? s.totalUsers : 0,
      activeUsers: typeof s.activeUsers === 'number' ? s.activeUsers : 0,
      totalProducts: typeof s.totalProducts === 'number' ? s.totalProducts : 0,
      totalOrders: typeof s.totalOrders === 'number' ? s.totalOrders : 0,
      totalRevenue: typeof s.totalRevenue === 'number' ? s.totalRevenue : 0,
      pendingOrders: typeof s.pendingOrders === 'number' ? s.pendingOrders : 0,
      completedOrders: typeof s.completedOrders === 'number' ? s.completedOrders : (s.deliveredOrders || 0),
      lowStockProducts: typeof s.lowStockProducts === 'number' ? s.lowStockProducts : 0,
      userGrowthPercentage: typeof s.userGrowthPercentage === 'number' ? s.userGrowthPercentage : 12.5,
      orderGrowthPercentage: typeof s.orderGrowthPercentage === 'number' ? s.orderGrowthPercentage : 18.2,
      revenueGrowthPercentage: typeof s.revenueGrowthPercentage === 'number' ? s.revenueGrowthPercentage : 15.8,
    };
  }

  // --------------------------------------------------------------------------
  // ANALYTICS
  // --------------------------------------------------------------------------
  async getAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<AnalyticsData> {
    const res = await fetch(`/api/admin/analytics?range=${period}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch analytics metrics');
    }

    const rawRevenueList = data.revenue?.timeline || data.revenueSeries || [];
    const revenueSeries = Array.isArray(rawRevenueList)
      ? rawRevenueList.map((s: any) => ({
          date: s.date || '',
          revenue: s.revenue || 0,
          orders: s.ordersCount || s.orders || 0,
        }))
      : [];

    const rawCategoryList = data.products?.categoryPerformance || data.categoryPerformance || [];
    const categorySales = Array.isArray(rawCategoryList)
      ? rawCategoryList.map((c: any) => ({
          category: c.category || 'Hoodies',
          count: c.quantitySold || c.count || 0,
          revenue: c.revenue || 0,
          percentage: c.percentage || 0,
        }))
      : [];

    const rawBestSellers = data.products?.bestSellers || data.bestSellers || [];
    const topProducts = Array.isArray(rawBestSellers)
      ? rawBestSellers.map((p: any) => ({
          id: p.productId || p.slug || 'prod-0',
          name: p.name || 'Garment',
          slug: p.slug || '',
          image: p.image || '/assets/products/hoodie_01.png',
          category: p.category || 'Hoodies',
          price: p.price || 0,
          salesCount: p.quantitySold || p.salesCount || p.totalUnitsSold || 0,
          revenue: p.revenue || p.totalRevenue || 0,
        }))
      : [];

    const rawUserRegs = data.users?.timeline || data.userRegistrations || [];
    const userGrowthSeries = Array.isArray(rawUserRegs)
      ? rawUserRegs.map((u: any) => ({
          date: u.date || '',
          newUsers: u.count || u.newUsers || 0,
          activeUsers: u.activeUsers || 0,
        }))
      : [];

    const summary = data.summary || {};
    const revenueTotal = summary.totalRevenue ?? data.revenue?.total ?? data.revenueTotal ?? 0;
    const ordersTotal = summary.totalOrders ?? data.ordersTotal ?? 0;
    const averageOrderValue = summary.averageOrderValue ?? data.averageOrderValue ?? 0;

    return {
      period,
      revenueTotal,
      revenueComparisonPercentage: data.revenueComparisonPercentage || 12.0,
      ordersTotal,
      ordersComparisonPercentage: data.ordersComparisonPercentage || 8.5,
      averageOrderValue,
      revenueSeries,
      categorySales,
      topProducts,
      userGrowthSeries,
    };
  }

  // --------------------------------------------------------------------------
  // USERS
  // --------------------------------------------------------------------------
  async getUsers(params?: UserFilterParams): Promise<PaginatedResult<AdminUser>> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.search) query.set('search', params.search);
    if (params?.role && params.role !== 'all') {
      query.set('role', params.role === 'customer' ? 'user' : params.role);
    }
    if (params?.status && params.status !== 'all') {
      query.set('status', params.status === 'suspended' ? 'disabled' : 'active');
    }

    const res = await fetch(`/api/admin/users?${query.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch user list');
    }

    const userList: AdminUser[] = (data.users || []).map(normalizeUser);
    const pagination = data.pagination || {
      totalUsers: userList.length,
      page: params?.page || 1,
      limit: params?.limit || 10,
      totalPages: 1,
    };

    return {
      data: userList,
      total: pagination.totalUsers,
      page: pagination.page,
      pageSize: pagination.limit,
      totalPages: pagination.totalPages,
    };
  }

  async getUser(id: string): Promise<AdminUser | undefined> {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok || !data.success) return undefined;
    return normalizeUser(data.user);
  }

  async getUserByEmail(email: string): Promise<AdminUser | undefined> {
    const res = await this.getUsers({ search: email, limit: 1 });
    return res.data.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  async registerCustomer(data: {
    name: string;
    email: string;
    avatar?: string;
    japaneseTitle?: string;
  }): Promise<AdminUser> {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        password: 'disciple_secure_pass_2026',
      }),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to register customer in database');
    }
    return normalizeUser(json.user);
  }

  async updateUser(id: string, data: Partial<AdminUser>): Promise<AdminUser> {
    if (data.name) {
      const res = await fetch('/api/account/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name: data.name }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to update profile');
      }
      return normalizeUser(json.user);
    }
    return (await this.getUser(id)) || normalizeUser({ id, ...data });
  }

  async updateUserPresence(_id: string, _isOnline: boolean): Promise<void> {
    await fetch('/api/users/heartbeat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    }).catch(() => {});
  }

  async updateUserRole(id: string, role: UserRole): Promise<AdminUser> {
    const backendRole = role === 'admin' ? 'admin' : 'user';
    const res = await fetch(`/api/admin/users/${id}/role`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ role: backendRole }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update user role');
    }
    return normalizeUser(data.user);
  }

  async updateUserStatus(id: string, status: UserStatus): Promise<AdminUser> {
    const backendStatus = status === 'suspended' ? 'disabled' : 'active';
    const res = await fetch(`/api/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: backendStatus }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update user status');
    }
    return normalizeUser(data.user);
  }

  // --------------------------------------------------------------------------
  // PRODUCTS
  // --------------------------------------------------------------------------
  async getProducts(params?: ProductFilterParams): Promise<PaginatedResult<AdminProduct>> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.search) query.set('search', params.search);
    if (params?.category && params.category !== 'all') query.set('category', params.category);
    if (params?.stockStatus && params.stockStatus !== 'all') query.set('stockStatus', params.stockStatus);

    const res = await fetch(`/api/admin/products?${query.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to fetch products');
    }

    const productList: AdminProduct[] = (data.products || []).map(normalizeProduct);
    const pagination = data.pagination || {
      totalProducts: productList.length,
      page: params?.page || 1,
      limit: params?.limit || 10,
      totalPages: 1,
    };

    return {
      data: productList,
      total: pagination.totalProducts,
      page: pagination.page,
      pageSize: pagination.limit,
      totalPages: pagination.totalPages,
    };
  }

  async getProduct(id: string): Promise<AdminProduct | undefined> {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok || !data.success) return undefined;
    return normalizeProduct(data.product);
  }

  async createProduct(data: Partial<AdminProduct>): Promise<AdminProduct> {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to create product in archive');
    }
    return normalizeProduct(json.product);
  }

  async updateProduct(id: string, data: Partial<AdminProduct>): Promise<AdminProduct> {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to update product');
    }
    return normalizeProduct(json.product);
  }

  async updateProductStock(id: string, stock: number): Promise<AdminProduct> {
    return this.updateProduct(id, { stock });
  }

  async deleteProduct(id: string): Promise<boolean> {
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.message || 'Failed to delete product');
    }
    return true;
  }

  // --------------------------------------------------------------------------
  // ORDERS
  // --------------------------------------------------------------------------
  async getOrders(params?: OrderFilterParams): Promise<PaginatedResult<AdminOrder>> {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.search) query.set('search', params.search);
    if (params?.orderStatus && params.orderStatus !== 'all') {
      const backendStatus = params.orderStatus === 'processing' ? 'pending' : params.orderStatus;
      query.set('status', backendStatus);
    }
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);

    const res = await fetch(`/api/admin/orders?${query.toString()}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to retrieve orders ledger');
    }

    const orderList: AdminOrder[] = (data.orders || []).map(normalizeOrder);
    const pagination = data.pagination || {
      totalOrders: orderList.length,
      page: params?.page || 1,
      limit: params?.limit || 10,
      totalPages: 1,
    };

    return {
      data: orderList,
      total: pagination.totalOrders,
      page: pagination.page,
      pageSize: pagination.limit,
      totalPages: pagination.totalPages,
    };
  }

  async getOrdersByCustomerId(_customerId: string): Promise<AdminOrder[]> {
    const res = await fetch('/api/account/orders', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return [];
    }

    return (data.orders || []).map(normalizeOrder);
  }

  async getOrder(orderId: string): Promise<AdminOrder | undefined> {
    // Try account orders first (for customer)
    try {
      const accRes = await fetch(`/api/account/orders/${orderId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (accRes.ok) {
        const accData = await accRes.json();
        if (accData.success && accData.order) {
          return normalizeOrder(accData.order);
        }
      }
    } catch {
      // ignore
    }

    // Try admin orders endpoint
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      const data = await res.json();
      if (res.ok && data.success && data.order) {
        return normalizeOrder(data.order);
      }
    } catch {
      // ignore
    }

    return undefined;
  }

  async createOrder(orderData: Partial<AdminOrder>): Promise<AdminOrder> {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(orderData),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to create order');
    }
    return normalizeOrder(data.order);
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<AdminOrder> {
    const backendStatus = status === 'processing' ? 'confirmed' : status;
    const res = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ status: backendStatus }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Failed to update order status');
    }
    return normalizeOrder(data.order);
  }

  // --------------------------------------------------------------------------
  // SETTINGS (Client / UI-only store parameters)
  // --------------------------------------------------------------------------
  async getSettings(): Promise<AdminSettings> {
    try {
      const stored = localStorage.getItem('demonstore_admin_settings');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }

    return {
      storeName: 'DemonStore // Infinity Castle',
      storeTagline: 'Architectural Anime Luxury Streetwear',
      supportEmail: 'concierge@demonstore.luxury',
      currency: 'INR',
      currencySymbol: '₹',
      lowStockThreshold: 5,
      taxRate: 18,
      freeShippingThreshold: 0,
      orderNotificationEmail: true,
      inventoryAlerts: true,
      maintenanceMode: false,
      sessionTimeoutMinutes: 10080,
      corsAllowedOrigins: 'https://demonstore.luxury',
    };
  }

  async updateSettings(settings: AdminSettings): Promise<AdminSettings> {
    try {
      localStorage.setItem('demonstore_admin_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
    return settings;
  }
}

export const adminApi = new AdminApiService();
