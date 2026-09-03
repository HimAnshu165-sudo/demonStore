'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Navigation as Track } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { adminApi } from '@/services/adminApi';
import { AdminOrder, OrderStatus, PaymentStatus } from '@/types/admin';
import shared from '../../shared.module.css';
import styles from '../Orders.module.css';

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

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  // Next.js 15: use React.use() to unwrap params in client components
  const { id } = use(params);
  const { user } = useAuth();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  useEffect(() => {
    if (!user || !id) return;
    adminApi.getOrder(id).then((o) => {
      if (!o) {
        setIsUnauthorized(true);
      } else if (o.customer.id !== user.id) {
        // Ownership check — do not expose other users' orders
        setIsUnauthorized(true);
      } else {
        setOrder(o);
      }
      setIsLoading(false);
    }).catch(() => {
      setIsUnauthorized(true);
      setIsLoading(false);
    });
  }, [user, id]);

  if (isLoading) {
    return (
      <div style={{ padding: '2rem 0' }}>
        <div className={shared.skeleton} style={{ height: 20, width: '40%', marginBottom: 16 }} />
        <div className={shared.skeleton} style={{ height: 14, width: '60%' }} />
      </div>
    );
  }

  if (isUnauthorized || !order) {
    return (
      <div>
        <Link href="/account/orders" className={styles.backLink}>
          <ArrowLeft size={13} /> BACK TO ORDERS
        </Link>
        <div className={shared.errorBanner} style={{ marginTop: '1rem' }}>
          This order does not exist or you do not have access to view it.
        </div>
      </div>
    );
  }

  return (
    <div>
      <Link href="/account/orders" className={styles.backLink}>
        <ArrowLeft size={13} /> BACK TO ORDERS
      </Link>

      {/* Header */}
      <div className={shared.pageHeader}>
        <div className={shared.pageTagline}>
          <span className={shared.taglineDot} />
          INFINITY CASTLE // ORDER RECORD
        </div>
        <h1 className={shared.pageTitle}>#{order.orderNumber}</h1>
        <p className={shared.pageSubtitle}>
          Placed on{' '}
          {new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric',
          })}
        </p>
      </div>

      <div className={styles.detailGrid}>
        {/* Items + Address */}
        <div>
          <div className={shared.card}>
            <div className={styles.itemsList}>
              {order.items.map((item, idx) => (
                <div key={idx} className={styles.orderItem}>
                  <Image
                    src={item.image || '/assets/products/hoodie_01.png'}
                    alt={item.name}
                    width={64}
                    height={80}
                    className={styles.orderItemImage}
                  />
                  <div className={styles.orderItemInfo}>
                    <div className={styles.orderItemName}>{item.name}</div>
                    <div className={styles.orderItemMeta}>
                      SIZE: {item.size} // QTY: {item.quantity} // {item.gsm}GSM
                    </div>
                    <div className={styles.orderItemMeta} style={{ marginTop: '0.2rem' }}>
                      ₹{item.unitPrice.toLocaleString('en-IN')} each
                    </div>
                  </div>
                  <div className={styles.orderItemTotal}>
                    ₹{item.total.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            {/* Shipping address */}
            <div className={styles.shippingBlock}>
              <div className={styles.shippingTitle}>DELIVERY ADDRESS</div>
              <div className={styles.shippingAddr}>
                {order.shippingAddress.name}<br />
                {order.shippingAddress.street}<br />
                {order.shippingAddress.city}, {order.shippingAddress.state} — {order.shippingAddress.postalCode}<br />
                {order.shippingAddress.country}
                {order.shippingAddress.phone && <><br />{order.shippingAddress.phone}</>}
              </div>
              {order.trackingNumber && (
                <div className={styles.trackingNum}>
                  TRACKING: <span className={styles.trackingNumValue}>{order.trackingNumber}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cost Summary + Status */}
        <div>
          <div className={styles.costBreakdown}>
            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className={`${shared.statusPill} ${getPaymentClass(order.paymentStatus)}`}>
                {order.paymentStatus.toUpperCase()}
              </span>
              <span className={`${shared.statusPill} ${getOrderStatusClass(order.orderStatus)}`}>
                {order.orderStatus.toUpperCase()}
              </span>
            </div>

            <div className={styles.costRow}>
              <span>SUBTOTAL</span>
              <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className={styles.costRow}>
              <span>SHIPPING</span>
              <span>{order.shippingFee === 0 ? 'COMPLIMENTARY' : `₹${order.shippingFee.toLocaleString('en-IN')}`}</span>
            </div>
            <div className={styles.costRow}>
              <span>TAX</span>
              <span>₹{order.tax.toLocaleString('en-IN')}</span>
            </div>
            <div className={styles.totalRow}>
              <span>TOTAL</span>
              <span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <Link
              href={`/account/orders/${order.id}/tracking`}
              className={shared.btnPrimary}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Track size={14} />
              TRACK THIS ORDER
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
