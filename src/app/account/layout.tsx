'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  Heart,
  ShoppingBag,
  Package,
  MapPin,
  Navigation as TrackingIcon,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { CustomerRouteGuard } from '@/components/account/CustomerRouteGuard';
import styles from './layout.module.css';

const NAV_ITEMS = [
  { href: '/account/profile', label: 'PROFILE', icon: User },
  { href: '/account/wishlist', label: 'WISHLIST', icon: Heart, badge: 'wishlist' },
  { href: '/account/orders', label: 'ORDERS', icon: Package },
  { href: '/account/orders', label: 'TRACKING', icon: TrackingIcon, exact: false },
  { href: '/account/addresses', label: 'ADDRESSES', icon: MapPin },
  { href: '/account/bag', label: 'BAG', icon: ShoppingBag, badge: 'cart' },
];

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const { totalWishlisted } = useWishlist();

  const isActive = (href: string) => {
    if (href === '/account/orders' && pathname?.includes('/account/orders')) return true;
    return pathname === href;
  };

  const getBadge = (badge?: string) => {
    if (badge === 'cart' && totalItems > 0) return totalItems;
    if (badge === 'wishlist' && totalWishlisted > 0) return totalWishlisted;
    return null;
  };

  return (
    <CustomerRouteGuard>
      <div className={styles.accountShell}>
        {/* ── Desktop Sidebar ─────────────────────────────────────── */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarUser}>
            <div className={styles.sidebarAvatar}>
              <User size={20} />
            </div>
            <div className={styles.sidebarName}>{user?.name || 'DISCIPLE'}</div>
            <div className={styles.sidebarRole}>
              {user?.japaneseTitle || 'REGISTERED DISCIPLE'}
            </div>
          </div>

          <nav className={styles.sidebarNav}>
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const badge = getBadge(item.badge);
              const active = isActive(item.href);
              const isTracking = item.label === 'TRACKING';

              return isTracking ? (
                <Link
                  key="tracking"
                  href="/account/orders"
                  className={`${styles.navItem} ${pathname?.includes('/tracking') ? styles.navItemActive : ''}`}
                >
                  <Icon size={14} />
                  ORDER TRACKING
                </Link>
              ) : (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  className={`${styles.navItem} ${active && item.label !== 'TRACKING' ? styles.navItemActive : ''}`}
                >
                  <Icon size={14} />
                  {item.label}
                  {badge !== null && (
                    <span className={styles.navBadge}>{badge}</span>
                  )}
                </Link>
              );
            })}

            <div className={styles.sidebarDivider} />

            <button
              className={`${styles.navItem} ${styles.signOutBtn}`}
              onClick={logout}
            >
              <LogOut size={14} />
              SIGN OUT
            </button>
          </nav>
        </aside>

        {/* ── Mobile Tab Navigation ────────────────────────────────── */}
        <div className={styles.mobileNav}>
          <div className={styles.mobileNavInner}>
            {[
              { href: '/account/profile', label: 'PROFILE', icon: User },
              { href: '/account/wishlist', label: 'WISHLIST', icon: Heart, badge: 'wishlist' },
              { href: '/account/orders', label: 'ORDERS', icon: Package },
              { href: '/account/addresses', label: 'ADDRESSES', icon: MapPin },
              { href: '/account/bag', label: 'BAG', icon: ShoppingBag, badge: 'cart' },
            ].map((item) => {
              const Icon = item.icon;
              const badge = getBadge(item.badge);
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`${styles.mobileNavItem} ${active ? styles.mobileNavItemActive : ''}`}
                >
                  <Icon size={12} />
                  {item.label}
                  {badge !== null && (
                    <span className={styles.mobileNavBadge}>{badge}</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Content Area ─────────────────────────────────────────── */}
        <main className={styles.contentArea}>
          {children}
        </main>
      </div>
    </CustomerRouteGuard>
  );
}
