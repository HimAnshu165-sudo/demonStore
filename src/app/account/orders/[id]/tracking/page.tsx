'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, Circle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { adminApi } from '@/services/adminApi';
import { AdminOrder, OrderStatus } from '@/types/admin';
import shared from '../../../shared.module.css';
import styles from './Tracking.module.css';

const TRACKING_STEPS: { key: OrderStatus | 'placed'; label: string; kanji: string }[] = [
  { key: 'placed', label: 'ORDER PLACED', kanji: '注文完了' },
  { key: 'confirmed', label: 'CONFIRMED', kanji: '確認済み' },
  { key: 'processing', label: 'PROCESSING', kanji: '処理中' },
  { key: 'shipped', label: 'SHIPPED', kanji: '発送済み' },
  { key: 'delivered', label: 'DELIVERED', kanji: '配達完了' },
];

function getStepIndex(status: OrderStatus): number {
  const order: (OrderStatus | 'placed')[] = ['placed', 'confirmed', 'processing', 'shipped', 'delivered'];
  const idx = order.indexOf(status);
  // 'placed' doesn't exist as a real status, treat any non-cancelled order as at least placed
  return idx === -1 ? 0 : idx;
}

export default function TrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  useEffect(() => {
    if (!user || !id) return;
    adminApi.getOrder(id).then((o) => {
      if (!o || o.customer.id !== user.id) {
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
    return <div className={shared.skeleton} style={{ height: 300, marginTop: '2rem' }} />;
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

  const isCancelled = order.orderStatus === 'cancelled';
  const activeStep = isCancelled ? -1 : getStepIndex(order.orderStatus);

  return (
    <div>
      <Link href={`/account/orders/${order.id}`} className={styles.backLink}>
        <ArrowLeft size={13} /> BACK TO ORDER #{order.orderNumber}
      </Link>

      <div className={shared.pageHeader}>
        <div className={shared.pageTagline}>
          <span className={shared.taglineDot} />
          INFINITY CASTLE // SHIPMENT CHRONICLE
        </div>
        <h1 className={shared.pageTitle}>ORDER TRACKING</h1>
        <p className={shared.pageSubtitle}>
          #{order.orderNumber}
          {order.trackingNumber && (
            <> &mdash; <span style={{ color: '#e71d36', fontFamily: 'Courier New, monospace' }}>{order.trackingNumber}</span></>
          )}
        </p>
      </div>

      {isCancelled ? (
        <div className={shared.errorBanner}>
          This order has been cancelled and is no longer being tracked.
        </div>
      ) : (
        <div className={styles.trackingCard}>
          <div className={styles.timeline}>
            {TRACKING_STEPS.map((step, idx) => {
              const isCompleted = idx <= activeStep;
              const isCurrent = idx === activeStep;

              return (
                <div key={step.key} className={styles.timelineStep}>
                  {/* Connector line above (except first) */}
                  {idx > 0 && (
                    <div
                      className={`${styles.connector} ${isCompleted ? styles.connectorActive : ''}`}
                    />
                  )}

                  <div className={`${styles.stepRow} ${isCurrent ? styles.stepRowCurrent : ''}`}>
                    {/* Indicator */}
                    <div className={`${styles.stepIndicator} ${isCompleted ? styles.stepIndicatorDone : ''} ${isCurrent ? styles.stepIndicatorCurrent : ''}`}>
                      {isCompleted && !isCurrent ? (
                        <CheckCircle size={18} />
                      ) : isCurrent ? (
                        <div className={styles.currentPulse} />
                      ) : (
                        <Circle size={18} />
                      )}
                    </div>

                    {/* Labels */}
                    <div className={styles.stepContent}>
                      <div className={`${styles.stepLabel} ${isCompleted ? styles.stepLabelActive : ''}`}>
                        {step.label}
                      </div>
                      <div className={styles.stepKanji}>{step.kanji}</div>
                      {isCurrent && (
                        <div className={styles.stepCurrentBadge}>CURRENT STATUS</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className={styles.trackingSummary}>
            <div className={styles.summaryRow}>
              <span>ORDER DATE</span>
              <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>CURRENT STATUS</span>
              <span style={{ color: '#f5f5f7', textTransform: 'uppercase' }}>{order.orderStatus}</span>
            </div>
            {order.shippingAddress && (
              <div className={styles.summaryRow}>
                <span>DELIVERING TO</span>
                <span>{order.shippingAddress.city}, {order.shippingAddress.state}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
