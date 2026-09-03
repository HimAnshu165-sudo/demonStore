'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShoppingBag,
  Search,
  Menu,
  X,
  ArrowRight,
  Shield,
  User,
  LayoutDashboard,
  Users,
  Package,
  LogOut,
  ChevronDown,
  ShoppingBag as BagIcon,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { SearchModal } from '@/components/SearchModal/SearchModal';
import styles from './Navigation.module.css';

export function Navigation() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const { user, isAuthenticated, isAdmin, isCustomer, logout, openAuthModal } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);

  // Scroll-aware glassmorphic backdrop
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close account dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
    };

    if (accountOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [accountOpen]);

  // Safely manage body scroll when mobile menu is open & listen for Escape
  useEffect(() => {
    if (mobileMenuOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setMobileMenuOpen(false);
          setAccountOpen(false);
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [mobileMenuOpen]);

  // Return null if on admin routes or login portal
  if (pathname?.startsWith('/admin') || pathname === '/login') {
    return null;
  }

  return (
    <>
      <header className={`${styles.header} ${isScrolled ? styles.headerScrolled : ''}`}>
        <Link href="/" className={styles.brand} onClick={() => setMobileMenuOpen(false)}>
          <span className={styles.logoTitle}>INFINITY CASTLE</span>
          <span className={styles.kanjiSub}>無限城</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className={styles.desktopNav}>
          <Link href="/shop" className={styles.navLink}>
            COLLECTION
          </Link>
          <Link href="/lookbook" className={styles.navLink}>
            LOOKBOOK
          </Link>
          <Link href="/world" className={styles.navLink}>
            WORLD
          </Link>
          
          {/* ONLY show Dashboard to verified logged-in Admins */}
          {isAuthenticated && isAdmin && (
            <Link href="/admin/dashboard" className={`${styles.navLink} ${styles.adminNavLink}`}>
              <span>DASHBOARD</span>
              <span className={styles.adminBadgeSmall}>ADMIN</span>
            </Link>
          )}
        </nav>

        {/* Action Controls */}
        <div className={styles.actions}>
          <button
            onClick={() => setSearchOpen(true)}
            className={styles.actionBtn}
            aria-label="Open Search"
          >
            <Search size={14} />
            <span className={styles.actionLabel}>SEARCH</span>
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className={styles.cartButton}
            aria-label="Open Cart Bag"
          >
            <ShoppingBag size={14} />
            <span className={styles.cartLabel}>BAG</span>
            {totalItems > 0 && <span className={styles.cartCount}>{totalItems}</span>}
          </button>

          {/* Account Authentication & Dropdown */}
          {!isAuthenticated ? (
            /* GUEST STATE: Clean Sign In button opening customer AuthModal */
            <button
              onClick={() => openAuthModal('login')}
              className={styles.accountBtn}
              aria-label="Sign In"
              title="Sign In to DemonStore"
            >
              <User size={14} />
              <span className={styles.actionLabel}>SIGN IN</span>
            </button>
          ) : (
            /* AUTHENTICATED STATE: Clean separation between Admin vs Customer */
            <div className={styles.accountWrapper} ref={accountRef}>
              <button
                onClick={() => setAccountOpen(!accountOpen)}
                className={`${styles.accountBtn} ${accountOpen ? styles.accountBtnActive : ''}`}
                aria-label={isAdmin ? 'Administrator Section' : 'Disciple Account'}
                title={isAdmin ? 'Citadel Administrator Control' : 'Disciple Profile'}
              >
                {isAdmin ? (
                  <Shield size={14} color="#ff2a55" />
                ) : (
                  <User size={14} color="#ffd700" />
                )}
                <span className={styles.actionLabel}>
                  {isAdmin ? 'ADMIN' : (user?.name ? user.name.split(' ')[0].toUpperCase() : 'ACCOUNT')}
                </span>
                <ChevronDown
                  size={11}
                  style={{
                    transform: accountOpen ? 'rotate(180deg)' : 'none',
                    transition: 'transform 0.2s ease',
                  }}
                />
              </button>

              {accountOpen && (
                <div className={styles.accountDropdown}>
                  <div className={styles.dropdownHeader}>
                    <div className={styles.dropdownName}>{user?.name}</div>
                    <div className={styles.dropdownRole}>
                      {isAdmin ? 'Supreme Citadel Admin' : 'Citadel Disciple'}
                    </div>
                  </div>

                  {isAdmin ? (
                    /* ADMIN ONLY DROPDOWN MENU */
                    <>
                      <Link
                        href="/admin/dashboard"
                        className={styles.dropdownItem}
                        onClick={() => setAccountOpen(false)}
                      >
                        <LayoutDashboard size={14} color="#e71d36" />
                        <span>Citadel Dashboard</span>
                      </Link>

                      <Link
                        href="/admin/users"
                        className={styles.dropdownItem}
                        onClick={() => setAccountOpen(false)}
                      >
                        <Users size={14} />
                        <span>Users & Disciples</span>
                      </Link>

                      <Link
                        href="/admin/products"
                        className={styles.dropdownItem}
                        onClick={() => setAccountOpen(false)}
                      >
                        <Package size={14} />
                        <span>Archive Products</span>
                      </Link>

                      <Link
                        href="/admin/orders"
                        className={styles.dropdownItem}
                        onClick={() => setAccountOpen(false)}
                      >
                        <ShoppingBag size={14} />
                        <span>Citadel Orders</span>
                      </Link>
                    </>
                  ) : (
                    /* CUSTOMER ONLY DROPDOWN MENU */
                    <>
                      <Link
                        href="/account/profile"
                        className={styles.dropdownItem}
                        onClick={() => setAccountOpen(false)}
                      >
                        <User size={14} />
                        <span>My Profile</span>
                      </Link>
                      <Link
                        href="/account/orders"
                        className={styles.dropdownItem}
                        onClick={() => setAccountOpen(false)}
                      >
                        <Package size={14} />
                        <span>My Orders</span>
                      </Link>
                      <Link
                        href="/account/wishlist"
                        className={styles.dropdownItem}
                        onClick={() => setAccountOpen(false)}
                      >
                        <BagIcon size={14} />
                        <span>Wishlist</span>
                      </Link>
                      <Link
                        href="/account/bag"
                        className={styles.dropdownItem}
                        onClick={() => setAccountOpen(false)}
                      >
                        <ShoppingBag size={14} />
                        <span>My Bag</span>
                      </Link>
                    </>
                  )}

                  <div className={styles.dropdownDivider} />

                  <button
                    onClick={() => {
                      logout();
                      setAccountOpen(false);
                    }}
                    className={styles.dropdownItem}
                    style={{ color: '#ff556e' }}
                  >
                    <LogOut size={14} />
                    <span>Sign Out (Logout)</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={styles.mobileMenuBtn}
            aria-label={mobileMenuOpen ? 'Close Navigation Menu' : 'Open Navigation Menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Full-Screen Mobile Navigation Overlay */}
      <div
        className={`${styles.mobileOverlay} ${mobileMenuOpen ? styles.mobileOverlayOpen : ''}`}
        aria-hidden={!mobileMenuOpen}
      >
        <div className={styles.mobileOverlayHeader}>
          <div className={styles.mobileBrand}>
            <span>INFINITY CASTLE</span>
            <span className={styles.kanjiSub}>無限城</span>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className={styles.mobileCloseBtn}
            aria-label="Close menu"
          >
            <X size={22} />
          </button>
        </div>

        <nav className={styles.mobileNavLinks}>
          <Link
            href="/"
            className={styles.mobileNavLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span>01 // THE CASTLE</span>
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/shop"
            className={styles.mobileNavLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span>02 // COLLECTION</span>
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/lookbook"
            className={styles.mobileNavLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span>03 // LOOKBOOK</span>
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/world"
            className={styles.mobileNavLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            <span>04 // MANIFESTO</span>
            <ArrowRight size={18} />
          </Link>

          {/* ADMIN ONLY MOBILE LINKS */}
          {isAuthenticated && isAdmin && (
            <>
              <Link
                href="/admin/dashboard"
                className={styles.mobileNavLink}
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: '#ff2a55' }}
              >
                <span>05 // CITADEL DASHBOARD</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/admin/users"
                className={styles.mobileNavLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>06 // USERS & DISCIPLES</span>
                <ArrowRight size={18} />
              </Link>
            </>
          )}

          {/* CUSTOMER ONLY MOBILE LINKS */}
          {isAuthenticated && isCustomer && (
            <>
              <Link
                href="/account/profile"
                className={styles.mobileNavLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>05 // MY PROFILE</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/account/orders"
                className={styles.mobileNavLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>06 // MY ORDERS</span>
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/account/bag"
                className={styles.mobileNavLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span>07 // MY BAG</span>
                <ArrowRight size={18} />
              </Link>
            </>
          )}

          {/* AUTH ACTION */}
          {!isAuthenticated ? (
            <button
              className={styles.mobileNavLink}
              onClick={() => {
                setMobileMenuOpen(false);
                openAuthModal('login');
              }}
              style={{
                background: 'transparent',
                border: 'none',
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
                color: '#ffffff',
              }}
            >
              <span>05 // DISCIPLE SIGN IN</span>
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              className={styles.mobileNavLink}
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              style={{
                background: 'transparent',
                border: 'none',
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
                color: '#ff556e',
              }}
            >
              <span>{isAdmin ? '07 // ADMIN SIGN OUT' : '06 // SIGN OUT'}</span>
              <ArrowRight size={18} />
            </button>
          )}
        </nav>

        <div className={styles.mobileFooter}>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setSearchOpen(true);
            }}
            className={styles.mobileSearchBtn}
          >
            <Search size={16} />
            <span>SEARCH THE ARCHIVE</span>
          </button>

          <div className={styles.mobileMeta}>
            <span>DROP 001 // ARCHIVE 2026</span>
            <span>420–600 GSM HEAVYWEIGHT</span>
          </div>
        </div>
      </div>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
