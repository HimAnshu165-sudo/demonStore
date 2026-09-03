import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import styles from './AdminEmptyState.module.css';

interface AdminEmptyStateProps {
  title?: string;
  description?: string;
  kanji?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
}

export function AdminEmptyState({
  title = 'NO RECORDS FOUND',
  description = 'There are no items matching the selected parameters in the citadel database.',
  kanji = '虚無',
  icon: Icon = Inbox,
  actionLabel,
  onAction,
}: AdminEmptyStateProps) {
  return (
    <div className={styles.emptyContainer}>
      <div className={styles.iconWrapper}>
        <Icon size={24} />
      </div>
      <div className={styles.kanji}>{kanji}</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>

      {actionLabel && onAction && (
        <button onClick={onAction} className={styles.actionBtn}>
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
