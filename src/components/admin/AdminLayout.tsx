'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  BarChart3,
  Settings,
  ExternalLink,
  LogOut,
  Menu,
  X,
  Radio,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './AdminLayout.module.css';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const NAV_ITEMS = [
  { label: 'DASHBOARD', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'USERS & DISCIPLES', href: '/admin/users', icon: Users },
  { label: 'ARCHIVE PRODUCTS', href: '/admin/products', icon: Package },
  { label: 'CITADEL ORDERS', href: '/admin/orders', icon: ShoppingBag },
  { label: 'TELEMETRY & ANALYTICS', href: '/admin/analytics', icon: BarChart3 },
  { label: 'SETTINGS', href: '/admin/settings', icon: Settings },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Close drawer on navigation
  useEffect(() => {
    setMobileDrawerOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    logout();
    router.replace('/');
  };

  // Derive page title from pathname
  const getPageInfo = () => {
    if (pathname.includes('/users')) return { title: 'USERS MANAGEMENT', breadcrumb: 'CITADEL // DISCIPLES DIRECTORY' };
    if (pathname.includes('/products')) return { title: 'PRODUCT ARCHIVE', breadcrumb: 'INVENTORY // HEAVYWEIGHT CATALOG' };
    if (pathname.includes('/orders')) return { title: 'ORDERS DISPATCH', breadcrumb: 'FULFILLMENT // ORDER LEDGER' };
    if (pathname.includes('/analytics')) return { title: 'CITADEL TELEMETRY', breadcrumb: 'METRICS // REVENUE & TRAFFIC' };
    if (pathname.includes('/settings')) return { title: 'ADMIN SETTINGS', breadcrumb: 'CONFIGURATION // SYSTEM DEFAULTS' };
    return { title: 'COMMAND OVERVIEW', breadcrumb: 'DEMONSTORE // CITADEL CONTROL' };
  };

  const pageInfo = getPageInfo();

  return (
    <div className={styles.adminWrapper}>
      {/* Mobile Backdrop */}
      <div
        className={`${styles.backdrop} ${mobileDrawerOpen ? styles.backdropVisible : ''}`}
        onClick={() => setMobileDrawerOpen(false)}
      />

      {/* Sidebar Navigation */}
      <aside className={`${styles.sidebar} ${mobileDrawerOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <Link href="/admin/dashboard" className={styles.brandLink}>
            <div className={styles.brandTitle}>
              <span>DEMONSTORE</span>
              <span className={styles.adminBadge}>ADMIN</span>
            </div>
            <span className={styles.brandKanji}>無限城 // CONTROL</span>
          </Link>
          <button
            onClick={() => setMobileDrawerOpen(false)}
            className={styles.closeSidebarBtn}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className={styles.navSection}>
          <span className={styles.navLabel}>NAVIGATION</span>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || (item.href !== '/admin/dashboard' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
              >
                <Icon size={16} className={styles.navItemIcon} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userCard}>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user?.name || 'Administrator'}</div>
              <div className={styles.userRole}>
                <span className={styles.presenceDot} />
                <span>{user?.role === 'admin' ? 'Supreme Authority' : 'Staff'}</span>
              </div>
            </div>
          </div>

          <div className={styles.footerActions}>
            <Link href="/" className={styles.footerBtn}>
              <ExternalLink size={13} />
              <span>Store</span>
            </Link>
            <button onClick={handleLogout} className={`${styles.footerBtn} ${styles.logoutBtn}`}>
              <LogOut size={13} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={styles.mainContainer}>
        {/* Sticky Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className={styles.mobileMenuToggle}
              aria-label="Open navigation drawer"
            >
              <Menu size={18} />
            </button>
            <div className={styles.headerTitleWrapper}>
              <h1 className={styles.headerTitle}>{pageInfo.title}</h1>
              <span className={styles.headerBreadcrumbs}>{pageInfo.breadcrumb}</span>
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.telemetryBadge} title="Real-time citadel connection active">
              <span className={styles.telemetryPulse} />
              <Radio size={12} />
              <span>SYSTEM ONLINE</span>
            </div>

            <Link href="/" className={styles.storeReturnButton}>
              <ExternalLink size={13} />
              <span>RETURN TO STORE</span>
            </Link>
          </div>
        </header>

        {/* Dynamic Route Content */}
        <main className={styles.contentArea}>{children}</main>
      </div>
    </div>
  );
}
