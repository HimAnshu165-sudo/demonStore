import React, { useState } from 'react';
import Image from 'next/image';
import { X, Check, MapPin, Truck, CreditCard } from 'lucide-react';
import { AdminOrder, OrderStatus } from '@/types/admin';
import styles from './Modals.module.css';

interface OrderDetailsModalProps {
  order: AdminOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: OrderStatus) => Promise<void>;
}

export function OrderDetailsModal({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
}: OrderDetailsModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(order?.orderStatus || 'processing');
  const [isUpdating, setIsUpdating] = useState(false);

  React.useEffect(() => {
    if (order) {
      setSelectedStatus(order.orderStatus);
    }
  }, [order]);

  if (!isOpen || !order) return null;

  const handleStatusSave = async () => {
    if (selectedStatus === order.orderStatus) {
      onClose();
      return;
    }
    setIsUpdating(true);
    try {
      await onUpdateStatus(order.id, selectedStatus);
      onClose();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleWrapper}>
            <h2 className={styles.modalTitle}>ORDER #{order.orderNumber}</h2>
            <span className={styles.modalSubtitle}>
              ENSCRIBED {new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalContent}>
          {/* Customer & Fulfillment Status */}
          <div className={styles.detailSection}>
            <div className={styles.sectionHeading}>ORDER OVERVIEW & RECIPIENT</div>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>PATRON NAME</span>
                <span className={styles.detailValue}>{order.customer.name}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>CONTACT EMAIL</span>
                <span className={styles.detailValue}>{order.customer.email}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>PAYMENT STATUS</span>
                <span
                  className={styles.detailValue}
                  style={{
                    color:
                      order.paymentStatus === 'paid'
                        ? '#2ecc71'
                        : order.paymentStatus === 'pending'
                        ? '#ff9f43'
                        : '#e71d36',
                    textTransform: 'uppercase',
                    fontSize: '0.8rem',
                    letterSpacing: '0.08em',
                  }}
                >
                  <CreditCard size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  {order.paymentStatus}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>TRACKING CODE</span>
                <span className={styles.detailValue} style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                  {order.trackingNumber || 'Pending Generation'}
                </span>
              </div>
            </div>
          </div>

          {/* Garment Items List */}
          <div className={styles.detailSection}>
            <div className={styles.sectionHeading}>ARCHIVED PIECES ({order.items.length})</div>
            <div className={styles.orderItemsList}>
              {order.items.map((item, idx) => (
                <div key={`${item.productId}-${idx}`} className={styles.orderItemRow}>
                  <Image
                    src={item.image || '/assets/castle/01-entrance.png'}
                    alt={item.name}
                    width={48}
                    height={58}
                    className={styles.orderItemThumb}
                  />
                  <div className={styles.orderItemMeta}>
                    <div className={styles.orderItemName}>{item.name}</div>
                    <div className={styles.orderItemSub}>
                      SIZE: {item.size} // QTY: {item.quantity} // {item.gsm || 500} GSM
                    </div>
                  </div>
                  <div className={styles.orderItemPrice}>
                    ₹{item.total.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Breakdown */}
          <div className={styles.detailSection}>
            <div className={styles.sectionHeading}>CITADEL FINANCIAL SETTLEMENT</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8a8594' }}>
                <span>Subtotal</span>
                <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8a8594' }}>
                <span>Courier Dispatch</span>
                <span>{order.shippingFee === 0 ? 'FREE COMPLIMENTARY' : `₹${order.shippingFee}`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#8a8594' }}>
                <span>GST Tax (10%)</span>
                <span>₹{order.tax.toLocaleString('en-IN')}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  color: '#ffffff',
                  fontFamily: 'Cinzel, serif',
                  fontSize: '1rem',
                  fontWeight: 700,
                  marginTop: '0.5rem',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <span>Total Settled</span>
                <span style={{ color: '#ff2a55' }}>₹{order.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          {order.shippingAddress && (
            <div className={styles.detailSection}>
              <div className={styles.sectionHeading}>
                <MapPin size={13} style={{ display: 'inline', marginRight: '6px' }} />
                SHIPPING DISPATCH DESTINATION
              </div>
              <p style={{ fontSize: '0.85rem', color: '#b5b0c0', lineHeight: 1.6 }}>
                {order.shippingAddress.name}
                <br />
                {order.shippingAddress.street}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                <br />
                {order.shippingAddress.country}
              </p>
            </div>
          )}

          {/* Status Updater */}
          <div className={styles.detailSection}>
            <div className={styles.sectionHeading}>
              <Truck size={13} style={{ display: 'inline', marginRight: '6px' }} />
              UPDATE FULFILLMENT STATUS
            </div>
            <div className={styles.formGroup}>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                className={styles.select}
              >
                <option value="processing">Processing (Archiving Garment)</option>
                <option value="confirmed">Confirmed (Secured in Cedar Vault)</option>
                <option value="shipped">Shipped (En Route with Tracking)</option>
                <option value="delivered">Delivered (Handed to Patron)</option>
                <option value="cancelled">Cancelled (Archival Void)</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.cancelBtn}>
            CLOSE
          </button>
          <button onClick={handleStatusSave} disabled={isUpdating} className={styles.confirmBtn}>
            <Check size={16} />
            <span>{isUpdating ? 'UPDATING...' : 'UPDATE ORDER STATUS'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
