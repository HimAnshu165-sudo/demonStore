'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Eye, Navigation as Track } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { adminApi } from '@/services/adminApi';
import { AdminOrder, OrderStatus, PaymentStatus } from '@/types/admin';
import shared from '../shared.module.css';
import styles from './Orders.module.css';

function getOrderStatusClass(status: OrderStatus) {
  const map: Record<OrderStatus, string> = {
    processing: shared.statusProcessing,
    confirmed: shared.statusConfirmed,
    shipped: shared.statusShipped,
    delivered: shared.statusDelivered,
    cancelled: shared.statusCancelled,
  };
  return map[status] || '';
}

function getPaymentClass(status: PaymentStatus) {
  if (status === 'paid') return shared.paymentPaid;
  if (status === 'failed') return shared.paymentFailed;
  return shared.paymentPending;
}

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    adminApi.getOrdersByCustomerId(user.id).then((data) => {
      setOrders(data);
      setIsLoading(false);
    });
  }, [user]);

  return (
    <div>
      <div className={shared.pageHeader}>
        <div className={shared.pageTagline}>
          <span className={shared.taglineDot} />
          INFINITY CASTLE // ORDER LEDGER
        </div>
        <h1 className={shared.pageTitle}>ORDERS</h1>
        <p className={shared.pageSubtitle}>Your acquisition history within the archive.</p>
      </div>

      {isLoading ? (
        <div className={styles.skeletonList}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={`${shared.skeleton}`} style={{ height: 20, width: '30%', marginBottom: 12 }} />
              <div className={`${shared.skeleton}`} style={{ height: 14, width: '60%' }} />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className={shared.emptyState}>
          <div className={shared.emptyIcon}><Package size={48} /></div>
          <h2 className={shared.emptyTitle}>NO ORDERS IN THE LEDGER</h2>
          <p className={shared.emptySubtitle}>
            Your acquisition history will appear here once you complete a purchase.
          </p>
          <Link href="/shop" className={shared.btnPrimary}>SHOP THE COLLECTION</Link>
        </div>
      ) : (
        <div className={styles.orderList}>
          {orders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              {/* Header row */}
              <div className={styles.orderHeader}>
                <div>
                  <div className={styles.orderNumber}>ORDER #{order.orderNumber}</div>
                  <div className={styles.orderDate}>
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </div>
                </div>
                <div className={styles.statusGroup}>
                  <span className={`${shared.statusPill} ${getPaymentClass(order.paymentStatus)}`}>
                    {order.paymentStatus.toUpperCase()}
                  </span>
                  <span className={`${shared.statusPill} ${getOrderStatusClass(order.orderStatus)}`}>
                    {order.orderStatus.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Items preview */}
              <div className={styles.itemsRow}>
                {order.items.slice(0, 3).map((item, idx) => (
                  <div key={idx} className={styles.itemThumbWrapper}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={56}
                      height={70}
                      className={styles.itemThumb}
                    />
                  </div>
                ))}
                {order.items.length > 3 && (
                  <div className={styles.moreItems}>+{order.items.length - 3}</div>
                )}
                <div className={styles.orderSummary}>
                  <div className={styles.orderItemCount}>
                    {order.items.length} PIECE{order.items.length > 1 ? 'S' : ''}
                  </div>
                  <div className={styles.orderTotal}>
                    ₹{order.totalAmount.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className={styles.orderActions}>
                <Link
                  href={`/account/orders/${order.id}`}
                  className={shared.btnSecondary}
                  style={{ fontSize: '0.65rem' }}
                >
                  <Eye size={13} />
                  VIEW ORDER
                </Link>
                <Link
                  href={`/account/orders/${order.id}/tracking`}
                  className={shared.btnSecondary}
                  style={{ fontSize: '0.65rem' }}
                >
                  <Track size={13} />
                  TRACK ORDER
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
