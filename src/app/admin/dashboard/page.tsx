'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Users,
  Activity,
  Package,
  ShoppingBag,
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import { DashboardStats, AdminOrder, AdminUser, AdminProduct } from '@/types/admin';
import { KPICard } from '@/components/admin/KPICard';
import { CardSkeleton, TableSkeleton } from '@/components/admin/AdminSkeletons';
import { AdminErrorState } from '@/components/admin/AdminErrorState';
import { ProductFormModal } from '@/components/admin/modals/ProductFormModal';
import styles from './Dashboard.module.css';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<AdminOrder[]>([]);
  const [activeUsers, setActiveUsers] = useState<AdminUser[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<AdminProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);

  const fetchDashboardData = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const [statsData, ordersRes, usersRes, productsRes] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getOrders({ limit: 5 }),
        adminApi.getUsers({ limit: 6 }),
        adminApi.getProducts({ stockStatus: 'low_stock', limit: 4 }),
      ]);

      setStats(statsData);
      setRecentOrders(ordersRes.data);
      setActiveUsers(usersRes.data);
      setLowStockProducts(productsRes.data);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Telemetry sync failed';
      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    // Subtle 45s heartbeat polling for real-time presence/order telemetry
    const interval = setInterval(() => {
      fetchDashboardData(true);
    }, 45000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleCreateProduct = async (data: Partial<AdminProduct>) => {
    await adminApi.createProduct(data);
    fetchDashboardData(true);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'delivered':
        return styles.statusDelivered;
      case 'shipped':
        return styles.statusShipped;
      case 'processing':
        return styles.statusProcessing;
      default:
        return styles.statusCancelled;
    }
  };

  if (isLoading) {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.kpiGrid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <TableSkeleton rows={5} columns={5} />
      </div>
    );
  }

  if (error) {
    return <AdminErrorState message={error} onRetry={() => fetchDashboardData()} isRetrying={isRefreshing} />;
  }

  return (
    <div className={styles.dashboardContainer}>
      {/* Top Banner & Quick Actions */}
      <div className={styles.topBar}>
        <div>
          <h2 className={styles.welcomeHeading}>CITADEL COMMAND TELEMETRY</h2>
          <p className={styles.welcomeSub}>Real-time inventory, financial settlement, and disciple presence.</p>
        </div>

        <div className={styles.actionButtons}>
          <button
            onClick={() => fetchDashboardData(true)}
            disabled={isRefreshing}
            className={styles.secondaryActionBtn}
            title="Refresh citadel metrics"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'SYNCHRONIZING...' : 'REFRESH'}</span>
          </button>

          <button
            onClick={() => setIsAddProductOpen(true)}
            className={styles.primaryActionBtn}
          >
            <Plus size={15} />
            <span>ENSCRIBE GARMENT</span>
          </button>
        </div>
      </div>

      {/* 8 Primary KPI Cards */}
      <div className={styles.kpiGrid}>
        <KPICard
          title="TOTAL REGISTERED USERS"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          changePercentage={stats?.userGrowthPercentage}
          changeLabel="disciples enscribed"
        />

        <KPICard
          title="ACTIVE PRESENCE"
          value={stats?.activeUsers ?? 0}
          icon={Activity}
          subtext="Currently roaming citadel"
        />

        <KPICard
          title="ARCHIVE GARMENTS"
          value={stats?.totalProducts ?? 0}
          icon={Package}
          subtext="Active catalog items"
        />

        <KPICard
          title="TOTAL ORDERS"
          value={stats?.totalOrders ?? 0}
          icon={ShoppingBag}
          changePercentage={stats?.orderGrowthPercentage}
          changeLabel="lifetime dispatches"
        />

        <KPICard
          title="GROSS REVENUE"
          value={`₹${(stats?.totalRevenue ?? 0).toLocaleString('en-IN')}`}
          icon={IndianRupee}
          changePercentage={stats?.revenueGrowthPercentage}
          changeLabel="completed settlements"
        />

        <KPICard
          title="PENDING DISPATCH"
          value={stats?.pendingOrders ?? 0}
          icon={Clock}
          subtext="Awaiting cedar vault packing"
        />

        <KPICard
          title="COMPLETED ORDERS"
          value={stats?.completedOrders ?? 0}
          icon={CheckCircle2}
          subtext="Delivered to patrons"
        />

        <KPICard
          title="LOW INVENTORY ALERT"
          value={stats?.lowStockProducts ?? 0}
          icon={AlertTriangle}
          subtext="Garments below safe reserve"
          isAlert={(stats?.lowStockProducts ?? 0) > 0}
        />
      </div>

      {/* Main Two-Column Split */}
      <div className={styles.dashboardMainGrid}>
        {/* Recent Orders Ledger */}
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <div className={styles.panelTitle}>
              <ShoppingBag size={16} color="#e71d36" />
              <span>RECENT CITADEL ORDERS</span>
            </div>
            <Link href="/admin/orders" className={styles.panelLink}>
              <span>VIEW ALL ORDERS</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className={styles.tableWrapper}>
            <table className={styles.adminTable}>
              <thead>
                <tr>
                  <th>ORDER CODE</th>
                  <th>PATRON</th>
                  <th>ITEMS</th>
                  <th>SETTLEMENT</th>
                  <th>FULFILLMENT</th>
                  <th>DATE</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: '#ffffff' }}>
                      #{order.orderNumber}
                    </td>
                    <td>{order.customer.name}</td>
                    <td>{order.items.length} pieces</td>
                    <td style={{ color: '#ffffff', fontWeight: 600 }}>
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </td>
                    <td>
                      <span className={`${styles.statusBadge} ${getStatusBadgeClass(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td style={{ color: '#8a8594', fontSize: '0.74rem' }}>
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Side Column: Active Presence & Low Stock Alerts */}
        <div className={styles.sideColumn}>
          {/* Active Disciples Panel */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitle}>
                <ShieldCheck size={16} color="#2ecc71" />
                <span>ACTIVE CITADEL PRESENCE</span>
              </div>
              <Link href="/admin/users" className={styles.panelLink}>
                <span>USERS</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className={styles.presenceList}>
              {activeUsers.slice(0, 5).map((user) => (
                <div key={user.id} className={styles.presenceItem}>
                  <Image
                    src={user.avatar || '/assets/castle/01-entrance.png'}
                    alt={user.name}
                    width={34}
                    height={34}
                    className={styles.presenceAvatar}
                  />
                  <div className={styles.presenceInfo}>
                    <div className={styles.presenceName}>{user.name}</div>
                    <div className={styles.presenceSub}>
                      {user.role === 'admin' ? 'Supreme Authority' : user.japaneseTitle || 'Disciple'}
                    </div>
                  </div>
                  <div
                    className={`${styles.presenceDot} ${user.isOnline ? styles.dotOnline : styles.dotOffline}`}
                    title={user.isOnline ? 'Online' : user.lastSeen}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Warning Panel */}
          <div className={styles.panel}>
            <div className={styles.panelHeader}>
              <div className={styles.panelTitle}>
                <AlertTriangle size={16} color="#ff2a55" />
                <span>INVENTORY RESERVE ALERTS</span>
              </div>
              <Link href="/admin/products" className={styles.panelLink}>
                <span>RESTOCK</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            <div className={styles.stockAlertList}>
              {lowStockProducts.length === 0 ? (
                <div style={{ fontSize: '0.8rem', color: '#8a8594', padding: '0.5rem 0' }}>
                  All garment reserves are adequately provisioned.
                </div>
              ) : (
                lowStockProducts.map((p) => (
                  <div key={p.id} className={styles.stockAlertItem}>
                    <div>
                      <div className={styles.stockAlertName}>{p.name}</div>
                      <div className={styles.stockAlertMeta}>
                        {p.category} // {p.formattedPrice}
                      </div>
                    </div>
                    <span className={styles.stockBadge}>{p.stock} LEFT</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      <ProductFormModal
        isOpen={isAddProductOpen}
        onClose={() => setIsAddProductOpen(false)}
        onSubmit={handleCreateProduct}
      />
    </div>
  );
}
