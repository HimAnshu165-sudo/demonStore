'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Award,
  IndianRupee,
  ShoppingBag,
  Layers,
} from 'lucide-react';
import { adminApi } from '@/services/adminApi';
import { AnalyticsData } from '@/types/admin';
import { CardSkeleton } from '@/components/admin/AdminSkeletons';
import { AdminEmptyState } from '@/components/admin/AdminEmptyState';
import { AdminErrorState } from '@/components/admin/AdminErrorState';
import styles from './Analytics.module.css';

type PeriodType = '7d' | '30d' | '90d' | '1y';

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<PeriodType>('30d');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async (selectedPeriod: PeriodType) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminApi.getAnalytics(selectedPeriod);
      setData(res);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Telemetry synchronization failed';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(period);
  }, [fetchAnalytics, period]);

  if (isLoading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.metricsRow}>
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return <AdminErrorState message={error} onRetry={() => fetchAnalytics(period)} />;
  }

  if (!data || data.revenueSeries.length === 0) {
    return (
      <AdminEmptyState
        title="NO ANALYTICS TELEMETRY"
        description="No historical transaction records exist for the selected interval."
        kanji="記録無"
      />
    );
  }

  // Calculate SVG Points for Revenue Chart
  const series = data.revenueSeries;
  const maxRevenue = Math.max(...series.map((s) => s.revenue), 1000);
  const chartWidth = 700;
  const chartHeight = 220;
  const paddingX = 40;
  const paddingY = 20;

  const points = series.map((s, idx) => {
    const x = paddingX + (idx / (series.length - 1 || 1)) * (chartWidth - paddingX * 2);
    const y = chartHeight - paddingY - (s.revenue / maxRevenue) * (chartHeight - paddingY * 2);
    return { x, y, val: s.revenue, label: s.date };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z`;

  return (
    <div className={styles.pageContainer}>
      {/* Header & Period Switcher */}
      <div className={styles.topBar}>
        <div className={styles.headingWrapper}>
          <h2 className={styles.pageHeading}>CITADEL PERFORMANCE ANALYTICS</h2>
          <p className={styles.pageSub}>Audited revenue velocity, order throughput, and category breakdown.</p>
        </div>

        <div className={styles.periodFilter}>
          {(['7d', '30d', '90d', '1y'] as PeriodType[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`${styles.periodBtn} ${period === p ? styles.periodBtnActive : ''}`}
            >
              {p.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Metrics Row */}
      <div className={styles.metricsRow}>
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <span className={styles.chartTitle}>
              <IndianRupee size={15} color="#e71d36" />
              INTERVAL REVENUE
            </span>
            <span style={{ color: '#2ecc71', fontSize: '0.74rem', fontWeight: 600 }}>
              +{data.revenueComparisonPercentage}%
            </span>
          </div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>
            ₹{data.revenueTotal.toLocaleString('en-IN')}
          </div>
          <div className={styles.chartSub}>Settled transactions over {period}</div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <span className={styles.chartTitle}>
              <ShoppingBag size={15} color="#3498db" />
              DISPATCHED ORDERS
            </span>
            <span style={{ color: '#2ecc71', fontSize: '0.74rem', fontWeight: 600 }}>
              +{data.ordersComparisonPercentage}%
            </span>
          </div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>
            {data.ordersTotal}
          </div>
          <div className={styles.chartSub}>Average Order Value: ₹{data.averageOrderValue.toLocaleString('en-IN')}</div>
        </div>

        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <span className={styles.chartTitle}>
              <Layers size={15} color="#9b59b6" />
              TOP CATEGORY
            </span>
            <span style={{ color: '#ff2a55', fontSize: '0.74rem', fontWeight: 600 }}>
              {data.categorySales[0]?.percentage || 0}% SHARE
            </span>
          </div>
          <div style={{ fontFamily: 'Cinzel, serif', fontSize: '2rem', fontWeight: 800, color: '#ffffff' }}>
            {data.categorySales[0]?.category || 'Heavy Hoodies'}
          </div>
          <div className={styles.chartSub}>Dominating citadel seasonal shipments</div>
        </div>
      </div>

      {/* SVG Revenue Velocity Chart */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <div className={styles.chartTitle}>
            <TrendingUp size={16} color="#e71d36" />
            <span>REVENUE VELOCITY (INR ₹)</span>
          </div>
          <span className={styles.chartSub}>Continuous monetary volume</span>
        </div>

        <div className={styles.chartCanvasWrapper}>
          <svg className={styles.svgChart} viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="crimsonGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#e71d36" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#e71d36" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Guide Lines */}
            <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} className={styles.axisLine} />
            <line
              x1={paddingX}
              y1={chartHeight / 2}
              x2={chartWidth - paddingX}
              y2={chartHeight / 2}
              className={styles.axisLine}
            />
            <line
              x1={paddingX}
              y1={chartHeight - paddingY}
              x2={chartWidth - paddingX}
              y2={chartHeight - paddingY}
              className={styles.axisLine}
            />

            {/* Area and Line */}
            <path d={areaD} className={styles.areaGradient} />
            <path d={pathD} className={styles.chartLine} />

            {/* Data Points */}
            {points.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="3.5" className={styles.chartPoint}>
                  <title>{`${p.label}: ₹${p.val.toLocaleString('en-IN')}`}</title>
                </circle>
                <text
                  x={p.x}
                  y={chartHeight - 4}
                  textAnchor="middle"
                  className={styles.axisText}
                >
                  {p.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Orders Bar Chart & Category Share */}
      <div className={styles.chartsGrid}>
        {/* Orders Bar Chart */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitle}>
              <BarChart3 size={16} color="#e71d36" />
              <span>ORDERS PROGRESSION</span>
            </div>
            <span className={styles.chartSub}>Daily orders received</span>
          </div>

          <div className={styles.barChartContainer}>
            {series.map((s, idx) => {
              const maxO = Math.max(...series.map((p) => p.orders), 1);
              const heightPct = Math.round((s.orders / maxO) * 100);

              return (
                <div key={idx} className={styles.barColumn}>
                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{ height: `${heightPct}%` }}
                      title={`${s.date}: ${s.orders} orders`}
                    />
                  </div>
                  <span className={styles.barLabel}>{s.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Share */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={styles.chartTitle}>
              <PieChart size={16} color="#e71d36" />
              <span>CATEGORY PERFORMANCE</span>
            </div>
          </div>

          <div className={styles.categoryList}>
            {data.categorySales.map((cat) => (
              <div key={cat.category} className={styles.categoryItem}>
                <div className={styles.categoryMeta}>
                  <span className={styles.categoryName}>{cat.category}</span>
                  <span className={styles.categoryStat}>
                    ₹{cat.revenue.toLocaleString('en-IN')} ({cat.percentage}%)
                  </span>
                </div>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: `${cat.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Best Selling Products */}
      <div className={styles.chartCard}>
        <div className={styles.chartHeader}>
          <div className={styles.chartTitle}>
            <Award size={16} color="#e71d36" />
            <span>BEST-SELLING ARCHIVE PIECES</span>
          </div>
          <span className={styles.chartSub}>Ranked by dispatched quantity</span>
        </div>

        <div className={styles.topProductsList}>
          {data.topProducts.map((p, rank) => (
            <div key={p.id} className={styles.topProductRow}>
              <span className={styles.topProductRank}>#{rank + 1}</span>
              <Image
                src={p.image || '/assets/castle/01-entrance.png'}
                alt={p.name}
                width={36}
                height={44}
                className={styles.topProductThumb}
              />
              <div className={styles.topProductInfo}>
                <div className={styles.topProductName}>{p.name}</div>
                <div className={styles.topProductSales}>
                  {p.category} // {p.salesCount} pieces dispatched
                </div>
              </div>
              <div className={styles.topProductRevenue}>
                ₹{p.revenue.toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
