import React, { useState } from 'react';
import { X, Shield, Check, Clock, ShoppingBag } from 'lucide-react';
import { AdminUser, UserRole, UserStatus } from '@/types/admin';
import styles from './Modals.module.css';

interface UserDetailsModalProps {
  user: AdminUser | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateRole: (id: string, role: UserRole) => Promise<void>;
  onUpdateStatus: (id: string, status: UserStatus) => Promise<void>;
}

export function UserDetailsModal({
  user,
  isOpen,
  onClose,
  onUpdateRole,
  onUpdateStatus,
}: UserDetailsModalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role || 'customer');
  const [selectedStatus, setSelectedStatus] = useState<UserStatus>(user?.status || 'active');
  const [isUpdating, setIsUpdating] = useState(false);

  React.useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
      setSelectedStatus(user.status);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      if (selectedRole !== user.role) {
        await onUpdateRole(user.id, selectedRole);
      }
      if (selectedStatus !== user.status) {
        await onUpdateStatus(user.id, selectedStatus);
      }
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
            <h2 className={styles.modalTitle}>{user.name}</h2>
            <span className={styles.modalSubtitle}>{user.japaneseTitle || 'CITADEL DISCIPLE'}</span>
          </div>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className={styles.modalContent}>
          {/* Identity & Presence Details */}
          <div className={styles.detailSection}>
            <div className={styles.sectionHeading}>DISCIPLE IDENTITY & TELEMETRY</div>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>DISCIPLE ID</span>
                <span className={styles.detailValue}>{user.id}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>PRIMARY EMAIL</span>
                <span className={styles.detailValue}>{user.email}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>REGISTERED ARCHIVE DATE</span>
                <span className={styles.detailValue}>
                  {new Date(user.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>LAST CITADEL PRESENCE</span>
                <span className={styles.detailValue} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={13} color="#8a8594" />
                  {user.isOnline ? (
                    <span style={{ color: '#2ecc71', fontWeight: 600 }}>Active Online Now</span>
                  ) : (
                    <span>{user.lastSeen || 'Offline'}</span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Purchasing Ledger */}
          <div className={styles.detailSection}>
            <div className={styles.sectionHeading}>TRANSACTION LEDGER</div>
            <div className={styles.detailGrid}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>TOTAL DISPATCHED ORDERS</span>
                <span className={styles.detailValue} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ShoppingBag size={14} color="#e71d36" />
                  {user.ordersCount} Orders
                </span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>LIFETIME EXPENDITURE</span>
                <span className={styles.detailValue} style={{ color: '#ffffff', fontFamily: 'Cinzel, serif', fontWeight: 700 }}>
                  ₹{user.totalSpent.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Administrative Role & Status Control */}
          <div className={styles.detailSection}>
            <div className={styles.sectionHeading}>SECURITY PRIVILEGES & ACCESS CONTROL</div>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label className={styles.label}>AUTHORITY ROLE</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                  className={styles.select}
                >
                  <option value="customer">Customer / Disciple</option>
                  <option value="admin">Supreme Administrator</option>
                  <option value="moderator">Citadel Moderator</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>ACCOUNT STATUS</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as UserStatus)}
                  className={styles.select}
                >
                  <option value="active">Active (Granted Access)</option>
                  <option value="suspended">Suspended (Restricted)</option>
                  <option value="pending">Pending Verification</option>
                </select>
              </div>
            </div>
          </div>

          {user.shippingAddress && (
            <div className={styles.detailSection}>
              <div className={styles.sectionHeading}>ARCHIVAL DISPATCH DESTINATION</div>
              <p style={{ fontSize: '0.85rem', color: '#b5b0c0', lineHeight: 1.6 }}>
                {user.shippingAddress.street}, {user.shippingAddress.city},{' '}
                {user.shippingAddress.state} {user.shippingAddress.postalCode},{' '}
                {user.shippingAddress.country}
              </p>
            </div>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.cancelBtn}>
            CLOSE
          </button>
          <button onClick={handleSave} disabled={isUpdating} className={styles.confirmBtn}>
            <Check size={16} />
            <span>{isUpdating ? 'UPDATING...' : 'APPLY CITADEL MODIFICATIONS'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
