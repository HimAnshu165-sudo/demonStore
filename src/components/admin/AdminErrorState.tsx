import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import styles from './AdminErrorState.module.css';

interface AdminErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function AdminErrorState({
  title = 'CITADEL TELEMETRY DISRUPTION',
  message = 'Unable to establish synchronization with the data node. Please verify network credentials.',
  onRetry,
  isRetrying = false,
}: AdminErrorStateProps) {
  return (
    <div className={styles.errorContainer}>
      <div className={styles.iconWrapper}>
        <AlertTriangle size={24} />
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>

      {onRetry && (
        <button onClick={onRetry} disabled={isRetrying} className={styles.retryBtn}>
          <RefreshCw size={14} className={isRetrying ? 'animate-spin' : ''} />
          <span>{isRetrying ? 'RECONNECTING...' : 'RETRY SYNCHRONIZATION'}</span>
        </button>
      )}
    </div>
  );
}
