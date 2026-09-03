'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, RefreshCw, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import { AdminOrder, OrderStatus, PaymentStatus } from '@/types/admin';
import { TableSkeleton } from '@/components/admin/AdminSkeletons';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminErrorState } from '@/components/admin/AdminErrorState';
import { OrderDetailsModal } from '@/components/admin/modals/OrderDetailsModal';
import styles from './Orders.module.css';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal inspection
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrders = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    setError(null);

    try {
      const res = await adminApi.getOrders({
        page: currentPage,
        limit: 8,
        search: searchQuery,
        orderStatus: orderStatusFilter,
        paymentStatus: paymentStatusFilter,
      });

      setOrders(res.data);
      setTotalOrders(res.total);
      setTotalPages(res.totalPages);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to synchronize citadel orders ledger';
      setError(message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [currentPage, searchQuery, orderStatusFilter, paymentStatusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (id: string, status: OrderStatus) => {
    await adminApi.updateOrderStatus(id, status);
    fetchOrders(true);
  };

  const getStatusBadgeClass = (status: OrderStatus) => {
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

  const getPaymentClass = (status: PaymentStatus) => {
    switch (status) {
      case 'paid':
        return styles.paymentPaid;
      case 'pending':
        return styles.paymentPending;
      default:
        return styles.paymentFailed;
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Controls Bar */}
      <div className={styles.controlsBar}>
        <div className={styles.searchWrapper}>
          <Search size={15} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search orders by code, patron name, or email..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filtersGroup}>
          <select
            value={orderStatusFilter}
            onChange={(e) => {
              setOrderStatusFilter(e.target.value as OrderStatus | 'all');
              setCurrentPage(1);
            }}
            className={styles.select}
          >
            <option value="all">All Order Statuses</option>
            <option value="processing">Processing</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={paymentStatusFilter}
            onChange={(e) => {
              setPaymentStatusFilter(e.target.value as PaymentStatus | 'all');
              setCurrentPage(1);
            }}
            className={styles.select}
          >
            <option value="all">All Payment Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>

          <button
            onClick={() => fetchOrders(true)}
            disabled={isRefreshing}
            className={styles.refreshBtn}
            title="Refresh order ledger"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
            <span>SYNC</span>
          </button>
        </div>
      </div>

      {/* Main Table or Loading/Empty States */}
      {isLoading ? (
        <TableSkeleton rows={7} columns={8} />
      ) : error ? (
        <AdminErrorState message={error} onRetry={() => fetchOrders()} isRetrying={isRefreshing} />
      ) : orders.length === 0 ? (
        <AdminEmptyState
          title="NO ORDERS FOUND"
          description="No orders match your active filter specifications."
          kanji="無注文"
          actionLabel="RESET ORDER FILTERS"
          onAction={() => {
            setSearchQuery('');
            setOrderStatusFilter('all');
            setPaymentStatusFilter('all');
          }}
        />
      ) : (
        <div className={styles.tableCard}>
          <div className={styles.tableWrapper}>
            <table className={styles.ordersTable}>
              <thead>
                <tr>
                  <th>ORDER ID</th>
                  <th>PATRON</th>
                  <th>ITEMS</th>
                  <th>AMOUNT</th>
                  <th>PAYMENT</th>
                  <th>FULFILLMENT</th>
                  <th>DATE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className={styles.orderNumber}>#{o.orderNumber}</td>

                    <td>
                      <div className={styles.customerInfo}>
                        <span className={styles.customerName}>{o.customer.name}</span>
                        <span className={styles.customerEmail}>{o.customer.email}</span>
                      </div>
                    </td>

                    <td>
                      {o.items.length} {o.items.length === 1 ? 'piece' : 'pieces'}
                    </td>

                    <td style={{ color: '#ffffff', fontFamily: 'Cinzel, serif', fontWeight: 600 }}>
                      ₹{o.totalAmount.toLocaleString('en-IN')}
                    </td>

                    <td>
                      <span className={getPaymentClass(o.paymentStatus)}>{o.paymentStatus}</span>
                    </td>

                    <td>
                      <span className={`${styles.statusBadge} ${getStatusBadgeClass(o.orderStatus)}`}>
                        {o.orderStatus}
                      </span>
                    </td>

                    <td style={{ color: '#8a8594', fontSize: '0.74rem' }}>
                      {new Date(o.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    <td>
                      <button
                        onClick={() => {
                          setSelectedOrder(o);
                          setIsModalOpen(true);
                        }}
                        className={styles.inspectBtn}
                        title="View order invoice & tracking"
                      >
                        <Eye size={12} />
                        <span>DETAILS</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className={styles.paginationBar}>
            <div>
              Showing {orders.length} of {totalOrders} recorded orders
            </div>

            <div className={styles.pageControls}>
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className={styles.pageBtn}
              >
                <ChevronLeft size={14} />
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className={styles.pageBtn}
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedOrder(null);
        }}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
}
