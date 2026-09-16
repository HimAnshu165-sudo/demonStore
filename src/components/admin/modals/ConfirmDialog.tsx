import React from 'react';
import { AlertTriangle } from 'lucide-react';
import styles from './Modals.module.css';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'CONFIRM ACTION',
  cancelLabel = 'CANCEL',
  isDanger = true,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.modalBackdrop} onClick={onCancel}>
      <div className={styles.modalBox} style={{ maxWidth: 460 }} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleWrapper}>
            <h2 className={styles.modalTitle} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: isDanger ? '#ff556e' : '#ffffff' }}>
              <AlertTriangle size={18} />
              {title}
            </h2>
          </div>
        </div>

        <div className={styles.modalContent}>
          <p style={{ fontSize: '0.88rem', color: '#b5b0c0', lineHeight: 1.6 }}>{message}</p>
        </div>

        <div className={styles.modalFooter}>
          <button onClick={onCancel} disabled={isLoading} className={styles.cancelBtn}>
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`${styles.confirmBtn} ${isDanger ? styles.dangerBtn : ''}`}
          >
            {isLoading ? 'PROCESSING...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
