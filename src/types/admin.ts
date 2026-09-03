import { Product, ProductCategory } from './index';

export type UserRole = 'admin' | 'customer' | 'moderator';
export type UserStatus = 'active' | 'suspended' | 'pending';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  japaneseTitle?: string;
  createdAt: string;
  lastActive: string;
  lastSeen?: string;
  isOnline: boolean;
  ordersCount: number;
  totalSpent: number;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

export interface SavedAddress {
  id: string;
  label: string; // e.g. 'HOME', 'OFFICE'
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export type ProductStockStatus = 'in_stock' | 'low_stock' | 'out_of_stock';

export interface AdminProduct extends Product {
  discount?: number;
  stockStatus: ProductStockStatus;
  createdAt: string;
  updatedAt: string;
  salesCount?: number;
}

export type PaymentStatus = 'paid' | 'pending' | 'failed' | 'refunded';
export type OrderStatus = 'processing' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  slug: string;
  category: ProductCategory;
  image: string;
  size: string;
  quantity: number;
  unitPrice: number;
  total: number;
  gsm?: number;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  tax: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shippingAddress: {
    name: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone?: string;
  };
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  completedOrders: number;
  lowStockProducts: number;
  userGrowthPercentage: number;
  orderGrowthPercentage: number;
  revenueGrowthPercentage: number;
}

export interface RevenueTimeSeriesPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface CategorySalesData {
  category: ProductCategory;
  count: number;
  revenue: number;
  percentage: number;
}

export interface TopProductSalesData {
  id: string;
  name: string;
  slug: string;
  image: string;
  category: ProductCategory;
  price: number;
  salesCount: number;
  revenue: number;
}

export interface UserGrowthPoint {
  date: string;
  newUsers: number;
  activeUsers: number;
}

export interface AnalyticsData {
  period: '7d' | '30d' | '90d' | '1y';
  revenueTotal: number;
  revenueComparisonPercentage: number;
  ordersTotal: number;
  ordersComparisonPercentage: number;
  averageOrderValue: number;
  revenueSeries: RevenueTimeSeriesPoint[];
  categorySales: CategorySalesData[];
  topProducts: TopProductSalesData[];
  userGrowthSeries: UserGrowthPoint[];
}

export interface AdminSettings {
  storeName: string;
  storeTagline: string;
  supportEmail: string;
  currency: string;
  currencySymbol: string;
  lowStockThreshold: number;
  taxRate: number; // percentage
  freeShippingThreshold: number;
  orderNotificationEmail: boolean;
  inventoryAlerts: boolean;
  maintenanceMode: boolean;
  sessionTimeoutMinutes: number;
  corsAllowedOrigins: string;
  webhookUrl?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface UserFilterParams extends PaginationParams {
  role?: UserRole | 'all';
  status?: UserStatus | 'all';
}

export interface ProductFilterParams extends PaginationParams {
  category?: ProductCategory | 'all';
  stockStatus?: ProductStockStatus | 'all';
}

export interface OrderFilterParams extends PaginationParams {
  orderStatus?: OrderStatus | 'all';
  paymentStatus?: PaymentStatus | 'all';
  startDate?: string;
  endDate?: string;
}
