import React from 'react';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import styles from './KPICard.module.css';

interface KPICardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  changePercentage?: number;
  changeLabel?: string;
  subtext?: string;
  isAlert?: boolean;
}

export function KPICard({
  title,
  value,
  icon: Icon,
  changePercentage,
  changeLabel = 'vs last period',
  subtext,
  isAlert = false,
}: KPICardProps) {
  const isPositive = changePercentage !== undefined && changePercentage > 0;
  const isNegative = changePercentage !== undefined && changePercentage < 0;

  return (
    <div className={styles.card} style={isAlert ? { borderColor: 'rgba(231, 29, 54, 0.4)' } : undefined}>
      <div className={styles.cardTop}>
        <span className={styles.cardTitle}>{title}</span>
        <div className={styles.iconWrapper} style={isAlert ? { background: 'rgba(231, 29, 54, 0.2)', color: '#ff2a55' } : undefined}>
          <Icon size={18} />
        </div>
      </div>

      <div className={styles.valueArea}>
        <div className={styles.value}>{value}</div>
      </div>

      <div className={styles.cardBottom}>
        {changePercentage !== undefined ? (
          <>
            {isPositive && (
              <span className={styles.trendPositive}>
                <TrendingUp size={13} />
                +{changePercentage}%
              </span>
            )}
            {isNegative && (
              <span className={styles.trendNegative}>
                <TrendingDown size={13} />
                {changePercentage}%
              </span>
            )}
            {!isPositive && !isNegative && (
              <span className={styles.trendNeutral}>
                <Minus size={13} />
                0%
              </span>
            )}
            <span className={styles.subtext}>{changeLabel}</span>
          </>
        ) : subtext ? (
          <span className={styles.subtext}>{subtext}</span>
        ) : null}
      </div>

      <div className={styles.accentBar} />
    </div>
  );
}
