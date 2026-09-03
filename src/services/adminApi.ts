import { PRODUCTS as initialCatalog } from '@/data/products';
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

// ============================================================================
// INITIAL SEED DATA FOR DEMONSTORE ADMIN CITADEL
// ============================================================================

const SEED_USERS: AdminUser[] = [
  {
    id: 'usr_001',
    name: 'Muzan Kibutsuji',
    email: 'admin@demonstore.luxury',
    role: 'admin',
    status: 'active',
    avatar: '/assets/castle/01-entrance.png',
    japaneseTitle: '鬼舞辻無惨 // LORD OF INFINITY',
    createdAt: '2025-01-01T00:00:00.000Z',
    lastActive: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    lastSeen: '2m ago',
    isOnline: true,
    ordersCount: 52,
    totalSpent: 512000,
    shippingAddress: {
      street: 'Infinity Castle Chamber 01',
      city: 'Tokyo',
      state: 'Tokyo',
      postalCode: '100-0001',
      country: 'Japan',
    },
  },
  {
    id: 'usr_002',
    name: 'Kokushibo',
    email: 'kokushibo@twelvekizuki.jp',
    role: 'admin',
    status: 'active',
    avatar: '/assets/castle/02-hall.png',
    japaneseTitle: '黒死牟 // UPPER RANK ONE',
    createdAt: '2025-01-12T14:20:00.000Z',
    lastActive: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    lastSeen: '5m ago',
    isOnline: true,
    ordersCount: 28,
    totalSpent: 340000,
    shippingAddress: {
      street: 'Moonlight Sanctum Floor 12',
      city: 'Kyoto',
      state: 'Kyoto',
      postalCode: '600-8001',
      country: 'Japan',
    },
  },
  {
    id: 'usr_003',
    name: 'Akaza',
    email: 'akaza@destructivestyle.org',
    role: 'customer',
    status: 'active',
    avatar: '/assets/castle/03-staircase.png',
    japaneseTitle: '猗窩座 // COMPASS NEEDLE',
    createdAt: '2025-02-04T09:15:00.000Z',
    lastActive: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    lastSeen: '18m ago',
    isOnline: true,
    ordersCount: 14,
    totalSpent: 168000,
    shippingAddress: {
      street: 'Martial Dojo 44',
      city: 'Osaka',
      state: 'Osaka',
      postalCode: '530-0001',
      country: 'Japan',
    },
  },
  {
    id: 'usr_004',
    name: 'Doma',
    email: 'doma@eternalparadise.com',
    role: 'customer',
    status: 'active',
    avatar: '/assets/castle/04-shrine.png',
    japaneseTitle: '童磨 // LOTUS CULT',
    createdAt: '2025-02-18T16:45:00.000Z',
    lastActive: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    lastSeen: '45m ago',
    isOnline: false,
    ordersCount: 9,
    totalSpent: 112500,
    shippingAddress: {
      street: 'Frost Temple Pavilion 3',
      city: 'Sapporo',
      state: 'Hokkaido',
      postalCode: '060-0001',
      country: 'Japan',
    },
  },
  {
    id: 'usr_005',
    name: 'Tanjiro Kamado',
    email: 'tanjiro@slayercorps.org',
    role: 'customer',
    status: 'active',
    avatar: '/assets/castle/05-bridge.png',
    japaneseTitle: '竈門炭治郎 // SUN BREATHING',
    createdAt: '2025-03-01T11:00:00.000Z',
    lastActive: new Date(Date.now() - 1000 * 60 * 70).toISOString(),
    lastSeen: '1h ago',
    isOnline: false,
    ordersCount: 6,
    totalSpent: 59400,
    shippingAddress: {
      street: 'Mount Kumotori Trail 7',
      city: 'Tokyo',
      state: 'Tokyo',
      postalCode: '198-0211',
      country: 'Japan',
    },
  },
  {
    id: 'usr_006',
    name: 'Zenitsu Agatsuma',
    email: 'zenitsu@thunderclap.net',
    role: 'customer',
    status: 'active',
    avatar: '/assets/castle/06-zenitsu.png',
    japaneseTitle: '我妻善逸 // GOD SPEED',
    createdAt: '2025-03-14T08:30:00.000Z',
    lastActive: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    lastSeen: '12m ago',
    isOnline: true,
    ordersCount: 11,
    totalSpent: 125400,
    shippingAddress: {
      street: 'Peach Orchard 19',
      city: 'Nagano',
      state: 'Nagano',
      postalCode: '380-0801',
      country: 'Japan',
    },
  },
  {
    id: 'usr_007',
    name: 'Kyojuro Rengoku',
    email: 'rengoku@setyourheartablaze.org',
    role: 'customer',
    status: 'active',
    avatar: '/assets/castle/01-entrance.png',
    japaneseTitle: '煉獄杏寿郎 // FLAME PILLAR',
    createdAt: '2025-03-20T17:15:00.000Z',
    lastActive: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    lastSeen: '3h ago',
    isOnline: false,
    ordersCount: 8,
    totalSpent: 92000,
    shippingAddress: {
      street: 'Flame Estate Gate 2',
      city: 'Tokyo',
      state: 'Tokyo',
      postalCode: '150-0001',
      country: 'Japan',
    },
  },
  {
    id: 'usr_008',
    name: 'Enmu',
    email: 'enmu@dreamtrain.jp',
    role: 'customer',
    status: 'suspended',
    avatar: '/assets/castle/02-hall.png',
    japaneseTitle: '魘夢 // LOWER RANK ONE',
    createdAt: '2025-04-02T13:10:00.000Z',
    lastActive: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    lastSeen: '2d ago',
    isOnline: false,
    ordersCount: 2,
    totalSpent: 17800,
    shippingAddress: {
      street: 'Mugen Railway Siding 8',
      city: 'Yokohama',
      state: 'Kanagawa',
      postalCode: '220-0001',
      country: 'Japan',
    },
  },
];

// Initialize Admin Products from initialCatalog
const SEED_PRODUCTS: AdminProduct[] = initialCatalog.map((p, idx) => {
  const stock = p.stock !== undefined ? p.stock : (idx % 4 === 0 ? 3 : idx % 5 === 0 ? 0 : 25 + idx);
  const stockStatus: ProductStockStatus =
    stock <= 0 ? 'out_of_stock' : stock <= 5 ? 'low_stock' : 'in_stock';

  return {
    ...p,
    stock,
    stockStatus,
    discount: idx % 3 === 0 ? 15 : 0,
    salesCount: 42 + idx * 8,
    createdAt: new Date(Date.now() - (idx + 1) * 86400000 * 4).toISOString(),
    updatedAt: new Date().toISOString(),
  };
});

// Initialize Orders
const SEED_ORDERS: AdminOrder[] = [
  {
    id: 'ord_1001',
    orderNumber: 'DC-90421',
    customer: {
      id: 'usr_003',
      name: 'Akaza',
      email: 'akaza@destructivestyle.org',
    },
    items: [
      {
        productId: SEED_PRODUCTS[0]?.id || 'prod_001',
        name: SEED_PRODUCTS[0]?.name || 'Zenitsu Thunder Clap Heavyweight Hoodie',
        slug: SEED_PRODUCTS[0]?.slug || 'zenitsu-thunder-clap-hoodie',
        category: SEED_PRODUCTS[0]?.category || 'Hoodies',
        image: SEED_PRODUCTS[0]?.images[0] || '/assets/castle/06-zenitsu.png',
        size: 'L',
        quantity: 1,
        unitPrice: 12400,
        total: 12400,
        gsm: 600,
      },
      {
        productId: SEED_PRODUCTS[1]?.id || 'prod_002',
        name: SEED_PRODUCTS[1]?.name || 'Kokushibo Moon Breathing Cargo Pants',
        slug: SEED_PRODUCTS[1]?.slug || 'kokushibo-cargo-pants',
        category: 'Cargos',
        image: SEED_PRODUCTS[1]?.images[0] || '/assets/castle/02-hall.png',
        size: 'M',
        quantity: 1,
        unitPrice: 9800,
        total: 9800,
        gsm: 480,
      },
    ],
    subtotal: 22200,
    shippingFee: 0,
    tax: 2220,
    totalAmount: 24420,
    paymentStatus: 'paid',
    orderStatus: 'delivered',
    shippingAddress: {
      name: 'Akaza',
      street: 'Martial Dojo 44',
      city: 'Osaka',
      state: 'Osaka',
      postalCode: '530-0001',
      country: 'Japan',
      phone: '+81 90-1234-5678',
    },
    trackingNumber: 'JP-EX-99881023',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: 'ord_1002',
    orderNumber: 'DC-90422',
    customer: {
      id: 'usr_006',
      name: 'Zenitsu Agatsuma',
      email: 'zenitsu@thunderclap.net',
    },
    items: [
      {
        productId: SEED_PRODUCTS[0]?.id || 'prod_001',
        name: SEED_PRODUCTS[0]?.name || 'Zenitsu Thunder Clap Heavyweight Hoodie',
        slug: SEED_PRODUCTS[0]?.slug || 'zenitsu-thunder-clap-hoodie',
        category: 'Hoodies',
        image: SEED_PRODUCTS[0]?.images[0] || '/assets/castle/06-zenitsu.png',
        size: 'XL',
        quantity: 2,
        unitPrice: 12400,
        total: 24800,
        gsm: 600,
      },
    ],
    subtotal: 24800,
    shippingFee: 0,
    tax: 2480,
    totalAmount: 27280,
    paymentStatus: 'paid',
    orderStatus: 'shipped',
    shippingAddress: {
      name: 'Zenitsu Agatsuma',
      street: 'Peach Orchard 19',
      city: 'Nagano',
      state: 'Nagano',
      postalCode: '380-0801',
      country: 'Japan',
      phone: '+81 90-8765-4321',
    },
    trackingNumber: 'JP-EX-99881099',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: 'ord_1003',
    orderNumber: 'DC-90423',
    customer: {
      id: 'usr_005',
      name: 'Tanjiro Kamado',
      email: 'tanjiro@slayercorps.org',
    },
    items: [
      {
        productId: SEED_PRODUCTS[2]?.id || 'prod_003',
        name: 'Hinokami Sun Breathing Kimono Jacket',
        slug: 'hinokami-kimono-jacket',
        category: 'Jackets',
        image: SEED_PRODUCTS[2]?.images[0] || '/assets/castle/05-bridge.png',
        size: 'L',
        quantity: 1,
        unitPrice: 16500,
        total: 16500,
        gsm: 520,
      },
    ],
    subtotal: 16500,
    shippingFee: 500,
    tax: 1650,
    totalAmount: 18650,
    paymentStatus: 'paid',
    orderStatus: 'processing',
    shippingAddress: {
      name: 'Tanjiro Kamado',
      street: 'Mount Kumotori Trail 7',
      city: 'Tokyo',
      state: 'Tokyo',
      postalCode: '198-0211',
      country: 'Japan',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'ord_1004',
    orderNumber: 'DC-90424',
    customer: {
      id: 'usr_004',
      name: 'Doma',
      email: 'doma@eternalparadise.com',
    },
    items: [
      {
        productId: SEED_PRODUCTS[3]?.id || 'prod_004',
        name: 'Lotus Cult Heavyweight Oversized Tee',
        slug: 'lotus-cult-tee',
        category: 'T-Shirts',
        image: SEED_PRODUCTS[3]?.images[0] || '/assets/castle/04-shrine.png',
        size: 'M',
        quantity: 2,
        unitPrice: 6200,
        total: 12400,
        gsm: 420,
      },
    ],
    subtotal: 12400,
    shippingFee: 0,
    tax: 1240,
    totalAmount: 13640,
    paymentStatus: 'pending',
    orderStatus: 'processing',
    shippingAddress: {
      name: 'Doma',
      street: 'Frost Temple Pavilion 3',
      city: 'Sapporo',
      state: 'Hokkaido',
      postalCode: '060-0001',
      country: 'Japan',
    },
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
];

const SEED_SETTINGS: AdminSettings = {
  storeName: 'INFINITY CASTLE // 無限城',
  storeTagline: 'Cinematic Japanese Gothic Streetwear Universe',
  supportEmail: 'concierge@demonstore.luxury',
  currency: 'INR',
  currencySymbol: '₹',
  lowStockThreshold: 5,
  taxRate: 10,
  freeShippingThreshold: 15000,
  orderNotificationEmail: true,
  inventoryAlerts: true,
  maintenanceMode: false,
  sessionTimeoutMinutes: 120,
  corsAllowedOrigins: 'https://demonstore.luxury',
  webhookUrl: 'https://api.demonstore.luxury/webhooks/orders',
};

// ============================================================================
// PERSISTENT LOCAL MEMORY STORE (FALLBACK LAYER FOR RESILIENCE)
// ============================================================================

class LocalStore {
  private users: AdminUser[] = [];
  private products: AdminProduct[] = [];
  private orders: AdminOrder[] = [];
  private settings: AdminSettings = SEED_SETTINGS;
  private isInitialized = false;

  public init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    try {
      const storedUsers = localStorage.getItem('demonstore_admin_users');
      this.users = storedUsers ? JSON.parse(storedUsers) : SEED_USERS;

      const storedProducts = localStorage.getItem('demonstore_admin_products');
      this.products = storedProducts ? JSON.parse(storedProducts) : SEED_PRODUCTS;

      const storedOrders = localStorage.getItem('demonstore_admin_orders');
      this.orders = storedOrders ? JSON.parse(storedOrders) : SEED_ORDERS;

      const storedSettings = localStorage.getItem('demonstore_admin_settings');
      this.settings = storedSettings ? JSON.parse(storedSettings) : SEED_SETTINGS;

      this.isInitialized = true;
    } catch {
      this.users = SEED_USERS;
      this.products = SEED_PRODUCTS;
      this.orders = SEED_ORDERS;
      this.settings = SEED_SETTINGS;
      this.isInitialized = true;
    }
  }

  private saveUsers() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('demonstore_admin_users', JSON.stringify(this.users));
    }
  }

  private saveProducts() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('demonstore_admin_products', JSON.stringify(this.products));
    }
  }

  private saveOrders() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('demonstore_admin_orders', JSON.stringify(this.orders));
    }
  }

  private saveSettings() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('demonstore_admin_settings', JSON.stringify(this.settings));
    }
  }

  // Users
  getUsers(params?: UserFilterParams): PaginatedResult<AdminUser> {
    this.init();
    let list = [...this.users];

    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          (u.japaneseTitle && u.japaneseTitle.toLowerCase().includes(q))
      );
    }

    if (params?.role && params.role !== 'all') {
      list = list.filter((u) => u.role === params.role);
    }

    if (params?.status && params.status !== 'all') {
      list = list.filter((u) => u.status === params.status);
    }

    const page = params?.page || 1;
    const pageSize = params?.limit || 10;
    const total = list.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const data = list.slice((page - 1) * pageSize, page * pageSize);

    return { data, total, page, pageSize, totalPages };
  }

  getUser(id: string): AdminUser | undefined {
    this.init();
    return this.users.find((u) => u.id === id);
  }

  getUserByEmail(email: string): AdminUser | undefined {
    this.init();
    const clean = email.trim().toLowerCase();
    return this.users.find((u) => u.email.toLowerCase() === clean);
  }

  registerCustomer(data: { name: string; email: string; avatar?: string; japaneseTitle?: string }): AdminUser {
    this.init();
    const cleanEmail = data.email.trim().toLowerCase();
    const existing = this.getUserByEmail(cleanEmail);
    if (existing) {
      throw new Error('A disciple with this email address already exists in the Citadel registry.');
    }

    const newUser: AdminUser = {
      id: `usr_cust_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: data.name.trim(),
      email: cleanEmail,
      role: 'customer',
      status: 'active',
      avatar: data.avatar || '/assets/castle/05-bridge.png',
      japaneseTitle: data.japaneseTitle || '門弟 // NEW DISCIPLE',
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      lastSeen: 'Active now',
      isOnline: true,
      ordersCount: 0,
      totalSpent: 0,
    };

    this.users.unshift(newUser);
    this.saveUsers();
    return newUser;
  }

  updateUserPresence(id: string, isOnline: boolean): void {
    this.init();
    const user = this.users.find((u) => u.id === id);
    if (user) {
      user.isOnline = isOnline;
      user.lastActive = new Date().toISOString();
      user.lastSeen = isOnline ? 'Active now' : 'Just left';
      this.saveUsers();
    }
  }

  updateUserRole(id: string, role: UserRole): AdminUser {
    this.init();
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new Error(`User ${id} not found`);
    user.role = role;
    this.saveUsers();
    return user;
  }

  updateUserStatus(id: string, status: UserStatus): AdminUser {
    this.init();
    const user = this.users.find((u) => u.id === id);
    if (!user) throw new Error(`User ${id} not found`);
    user.status = status;
    this.saveUsers();
    return user;
  }

  // Products
  getProducts(params?: ProductFilterParams): PaginatedResult<AdminProduct> {
    this.init();
    let list = [...this.products];

    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.character && p.character.toLowerCase().includes(q))
      );
    }

    if (params?.category && params.category !== 'all') {
      list = list.filter((p) => p.category === params.category);
    }

    if (params?.stockStatus && params.stockStatus !== 'all') {
      list = list.filter((p) => p.stockStatus === params.stockStatus);
    }

    const page = params?.page || 1;
    const pageSize = params?.limit || 10;
    const total = list.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const data = list.slice((page - 1) * pageSize, page * pageSize);

    return { data, total, page, pageSize, totalPages };
  }

  getProduct(id: string): AdminProduct | undefined {
    this.init();
    return this.products.find((p) => p.id === id);
  }

  createProduct(data: Partial<AdminProduct>): AdminProduct {
    this.init();
    const stock = Number(data.stock ?? 10);
    const stockStatus: ProductStockStatus =
      stock <= 0 ? 'out_of_stock' : stock <= 5 ? 'low_stock' : 'in_stock';

    const newProduct: AdminProduct = {
      id: `prod_${Date.now()}`,
      slug: data.slug || data.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `product-${Date.now()}`,
      name: data.name || 'New Infinity Garment',
      category: data.category || 'Hoodies',
      imagePath: data.imagePath || data.images?.[0] || '/assets/castle/01-entrance.png',
      japaneseTitle: data.japaneseTitle || '無限 // UNTITLED',
      character: data.character || 'Citadel Archival',
      rank: data.rank || 'Upper Rank',
      collection: data.collection || 'Drop 001',
      price: Number(data.price) || 9900,
      currency: 'INR',
      formattedPrice: `₹${(Number(data.price) || 9900).toLocaleString('en-IN')}`,
      description: data.description || 'Custom crafted heavy streetwear garment.',
      details: data.details || ['Heavyweight custom knit', 'DemonStore laser crest'],
      material: data.material || '100% Ring-Spun Combed Cotton',
      gsm: Number(data.gsm) || 500,
      fit: data.fit || 'Oversized Boxy Silhouette',
      color: data.color || 'Onyx Black',
      sizes: data.sizes || ['S', 'M', 'L', 'XL'],
      images: data.images?.length ? data.images : ['/assets/castle/01-entrance.png'],
      lookbookImages: data.lookbookImages || [],
      stock,
      stockStatus,
      tags: data.tags || ['Archival', 'Drop 001'],
      discount: Number(data.discount) || 0,
      salesCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.products.unshift(newProduct);
    this.saveProducts();
    return newProduct;
  }

  updateProduct(id: string, data: Partial<AdminProduct>): AdminProduct {
    this.init();
    const index = this.products.findIndex((p) => p.id === id);
    if (index === -1) throw new Error(`Product ${id} not found`);

    const existing = this.products[index];
    const stock = data.stock !== undefined ? Number(data.stock) : existing.stock;
    const stockStatus: ProductStockStatus =
      stock <= 0 ? 'out_of_stock' : stock <= 5 ? 'low_stock' : 'in_stock';

    const updated: AdminProduct = {
      ...existing,
      ...data,
      stock,
      stockStatus,
      updatedAt: new Date().toISOString(),
      formattedPrice: data.price ? `₹${Number(data.price).toLocaleString('en-IN')}` : existing.formattedPrice,
    };

    this.products[index] = updated;
    this.saveProducts();
    return updated;
  }

  deleteProduct(id: string): boolean {
    this.init();
    const initialLength = this.products.length;
    this.products = this.products.filter((p) => p.id !== id);
    const deleted = this.products.length < initialLength;
    if (deleted) this.saveProducts();
    return deleted;
  }

  // Orders
  getOrders(params?: OrderFilterParams): PaginatedResult<AdminOrder> {
    this.init();
    let list = [...this.orders];

    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.customer.name.toLowerCase().includes(q) ||
          o.customer.email.toLowerCase().includes(q)
      );
    }

    if (params?.orderStatus && params.orderStatus !== 'all') {
      list = list.filter((o) => o.orderStatus === params.orderStatus);
    }

    if (params?.paymentStatus && params.paymentStatus !== 'all') {
      list = list.filter((o) => o.paymentStatus === params.paymentStatus);
    }

    const page = params?.page || 1;
    const pageSize = params?.limit || 10;
    const total = list.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const data = list.slice((page - 1) * pageSize, page * pageSize);

    return { data, total, page, pageSize, totalPages };
  }

  getOrder(id: string): AdminOrder | undefined {
    this.init();
    return this.orders.find((o) => o.id === id || o.orderNumber === id);
  }

  updateOrderStatus(id: string, status: OrderStatus): AdminOrder {
    this.init();
    const order = this.orders.find((o) => o.id === id || o.orderNumber === id);
    if (!order) throw new Error(`Order ${id} not found`);
    order.orderStatus = status;
    order.updatedAt = new Date().toISOString();
    this.saveOrders();
    return order;
  }

  createOrder(order: AdminOrder): AdminOrder {
    this.init();
    this.orders.unshift(order);
    this.saveOrders();

    if (order.customer?.id || order.customer?.email) {
      const user = this.users.find(
        (u) => u.id === order.customer.id || u.email.toLowerCase() === order.customer.email.toLowerCase()
      );
      if (user) {
        user.ordersCount = (user.ordersCount || 0) + 1;
        user.totalSpent = (user.totalSpent || 0) + order.totalAmount;
        this.saveUsers();
      }
    }
    return order;
  }

  // Dashboard Stats
  getDashboardStats(): DashboardStats {
    this.init();
    const totalUsers = this.users.length;
    const activeUsers = this.users.filter((u) => u.isOnline).length;
    const totalProducts = this.products.length;
    const totalOrders = this.orders.length;
    const totalRevenue = this.orders
      .filter((o) => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.totalAmount, 0);
    const pendingOrders = this.orders.filter((o) => o.orderStatus === 'processing').length;
    const completedOrders = this.orders.filter((o) => o.orderStatus === 'delivered').length;
    const lowStockProducts = this.products.filter(
      (p) => p.stockStatus === 'low_stock' || p.stockStatus === 'out_of_stock'
    ).length;

    return {
      totalUsers,
      activeUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
      lowStockProducts,
      userGrowthPercentage: 14.8,
      orderGrowthPercentage: 23.4,
      revenueGrowthPercentage: 19.6,
    };
  }

  // Analytics
  getAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d'): AnalyticsData {
    this.init();

    // Dynamically generate realistic daily curve
    const days = period === '7d' ? 7 : period === '30d' ? 14 : period === '90d' ? 12 : 12;
    const revenueSeries = Array.from({ length: days }).map((_, i) => {
      const date = new Date(Date.now() - (days - 1 - i) * 86400000);
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const baseRev = 28000 + (i * 3200) % 24000 + Math.sin(i) * 9000;
      return {
        date: label,
        revenue: Math.round(baseRev),
        orders: Math.round(baseRev / 9500),
      };
    });

    const totalRev = revenueSeries.reduce((acc, p) => acc + p.revenue, 0);
    const totalOrds = revenueSeries.reduce((acc, p) => acc + p.orders, 0);

    const categorySales = [
      { category: 'Hoodies' as const, count: 184, revenue: 2281600, percentage: 48 },
      { category: 'Jackets' as const, count: 96, revenue: 1584000, percentage: 33 },
      { category: 'Cargos' as const, count: 62, revenue: 607600, percentage: 13 },
      { category: 'T-Shirts' as const, count: 48, revenue: 297600, percentage: 6 },
    ];

    const topProducts = this.products.slice(0, 5).map((p, idx) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      image: p.images[0] || '/assets/castle/01-entrance.png',
      category: p.category,
      price: p.price,
      salesCount: 85 - idx * 14,
      revenue: (85 - idx * 14) * p.price,
    }));

    const userGrowthSeries = revenueSeries.map((s) => ({
      date: s.date,
      newUsers: Math.max(1, Math.round(s.orders * 0.75)),
      activeUsers: Math.round(s.orders * 2.2),
    }));

    return {
      period,
      revenueTotal: totalRev,
      revenueComparisonPercentage: 21.8,
      ordersTotal: totalOrds,
      ordersComparisonPercentage: 18.2,
      averageOrderValue: Math.round(totalRev / (totalOrds || 1)),
      revenueSeries,
      categorySales,
      topProducts,
      userGrowthSeries,
    };
  }

  // Settings
  getSettings(): AdminSettings {
    this.init();
    return { ...this.settings };
  }

  updateSettings(data: Partial<AdminSettings>): AdminSettings {
    this.init();
    this.settings = { ...this.settings, ...data };
    this.saveSettings();
    return { ...this.settings };
  }
}

const localStore = new LocalStore();

// ============================================================================
// ADMIN API CLIENT IMPLEMENTATION (CONNECTS TO BACKEND, FAILS OVER SAFELY)
// ============================================================================

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
  // If no remote backend URL is configured, immediately resolve via localStore (0ms)
  // preventing 30-second fetch hanging against non-existent /api routes in development.
  if (!API_BASE_URL) {
    return null;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const token = typeof window !== 'undefined' ? localStorage.getItem('demonstore_auth_token') : null;
    const res = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }
    return await res.json();
  } catch {
    // Network or backend unavailable -> returns null for instant fallback
    return null;
  }
}

export const adminApi = {
  // 1. Dashboard Overview
  async getDashboardStats(): Promise<DashboardStats> {
    const remote = await apiFetch<DashboardStats>('/admin/dashboard');
    if (remote) return remote;
    return localStore.getDashboardStats();
  },

  // 2. Users Management
  async getUsers(params?: UserFilterParams): Promise<PaginatedResult<AdminUser>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.role && params.role !== 'all') searchParams.set('role', params.role);
    if (params?.status && params.status !== 'all') searchParams.set('status', params.status);

    const remote = await apiFetch<PaginatedResult<AdminUser>>(`/admin/users?${searchParams.toString()}`);
    if (remote) return remote;
    return localStore.getUsers(params);
  },

  async getUser(id: string): Promise<AdminUser> {
    const remote = await apiFetch<AdminUser>(`/admin/users/${id}`);
    if (remote) return remote;
    const local = localStore.getUser(id);
    if (!local) throw new Error(`User with ID ${id} not found`);
    return local;
  },

  async getUserByEmail(email: string): Promise<AdminUser | undefined> {
    return localStore.getUserByEmail(email);
  },

  async registerCustomer(data: { name: string; email: string; avatar?: string; japaneseTitle?: string }): Promise<AdminUser> {
    return localStore.registerCustomer(data);
  },

  async updateUserPresence(id: string, isOnline: boolean): Promise<void> {
    localStore.updateUserPresence(id, isOnline);
  },

  async updateUserRole(id: string, role: UserRole): Promise<AdminUser> {
    const remote = await apiFetch<AdminUser>(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
    if (remote) return remote;
    return localStore.updateUserRole(id, role);
  },

  async updateUserStatus(id: string, status: UserStatus): Promise<AdminUser> {
    const remote = await apiFetch<AdminUser>(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    if (remote) return remote;
    return localStore.updateUserStatus(id, status);
  },

  // 3. Products Management
  async getProducts(params?: ProductFilterParams): Promise<PaginatedResult<AdminProduct>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.category && params.category !== 'all') searchParams.set('category', params.category);
    if (params?.stockStatus && params.stockStatus !== 'all') searchParams.set('stockStatus', params.stockStatus);

    const remote = await apiFetch<PaginatedResult<AdminProduct>>(`/admin/products?${searchParams.toString()}`);
    if (remote) return remote;
    return localStore.getProducts(params);
  },

  async getProduct(id: string): Promise<AdminProduct> {
    const remote = await apiFetch<AdminProduct>(`/admin/products/${id}`);
    if (remote) return remote;
    const local = localStore.getProduct(id);
    if (!local) throw new Error(`Product with ID ${id} not found`);
    return local;
  },

  async createProduct(data: Partial<AdminProduct>): Promise<AdminProduct> {
    const remote = await apiFetch<AdminProduct>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (remote) return remote;
    return localStore.createProduct(data);
  },

  async updateProduct(id: string, data: Partial<AdminProduct>): Promise<AdminProduct> {
    const remote = await apiFetch<AdminProduct>(`/admin/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (remote) return remote;
    return localStore.updateProduct(id, data);
  },

  async deleteProduct(id: string): Promise<boolean> {
    const remote = await apiFetch<{ success: boolean }>(`/admin/products/${id}`, {
      method: 'DELETE',
    });
    if (remote) return remote.success;
    return localStore.deleteProduct(id);
  },

  async updateProductStock(id: string, stock: number): Promise<AdminProduct> {
    const remote = await apiFetch<AdminProduct>(`/admin/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ stock }),
    });
    if (remote) return remote;
    return localStore.updateProduct(id, { stock });
  },

  // 4. Orders Management
  async getOrders(params?: OrderFilterParams): Promise<PaginatedResult<AdminOrder>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', String(params.page));
    if (params?.limit) searchParams.set('limit', String(params.limit));
    if (params?.search) searchParams.set('search', params.search);
    if (params?.orderStatus && params.orderStatus !== 'all') searchParams.set('orderStatus', params.orderStatus);
    if (params?.paymentStatus && params.paymentStatus !== 'all') searchParams.set('paymentStatus', params.paymentStatus);

    const remote = await apiFetch<PaginatedResult<AdminOrder>>(`/admin/orders?${searchParams.toString()}`);
    if (remote) return remote;
    return localStore.getOrders(params);
  },

  async getOrder(id: string): Promise<AdminOrder> {
    const remote = await apiFetch<AdminOrder>(`/admin/orders/${id}`);
    if (remote) return remote;
    const local = localStore.getOrder(id);
    if (!local) throw new Error(`Order ${id} not found`);
    return local;
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<AdminOrder> {
    const remote = await apiFetch<AdminOrder>(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    if (remote) return remote;
    return localStore.updateOrderStatus(id, status);
  },

  async createOrder(order: AdminOrder): Promise<AdminOrder> {
    const remote = await apiFetch<AdminOrder>('/admin/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
    if (remote) return remote;
    return localStore.createOrder(order);
  },

  // 5. Analytics
  async getAnalytics(period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<AnalyticsData> {
    const remote = await apiFetch<AnalyticsData>(`/admin/analytics?period=${period}`);
    if (remote) return remote;
    return localStore.getAnalytics(period);
  },

  // 6. Settings
  async getSettings(): Promise<AdminSettings> {
    const remote = await apiFetch<AdminSettings>('/admin/settings');
    if (remote) return remote;
    return localStore.getSettings();
  },

  async updateSettings(data: Partial<AdminSettings>): Promise<AdminSettings> {
    const remote = await apiFetch<AdminSettings>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (remote) return remote;
    return localStore.updateSettings(data);
  },
};
