import React from 'react';
import styles from './AdminSkeletons.module.css';

export function CardSkeleton() {
  return (
    <div className={styles.cardSkeleton}>
      <div className={styles.cardTopSkeleton}>
        <div className={`${styles.titleSkeleton} ${styles.skeletonPulse}`} />
        <div className={`${styles.iconSkeleton} ${styles.skeletonPulse}`} />
      </div>
      <div className={`${styles.valueSkeleton} ${styles.skeletonPulse}`} />
      <div className={`${styles.subtextSkeleton} ${styles.skeletonPulse}`} />
    </div>
  );
}

export function TableSkeleton({ rows = 5, columns = 6 }: { rows?: number; columns?: number }) {
  return (
    <div className={styles.tableSkeleton}>
      <div className={styles.tableHeaderSkeleton}>
        {Array.from({ length: columns }).map((_, i) => (
          <div key={`th-${i}`} className={`${styles.tableCellSkeleton} ${styles.skeletonPulse}`} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={`tr-${r}`} className={styles.tableRowSkeleton}>
          {Array.from({ length: columns }).map((_, c) => (
            <div key={`tc-${r}-${c}`} className={`${styles.tableCellSkeleton} ${styles.skeletonPulse}`} />
          ))}
        </div>
      ))}
    </div>
  );
}
