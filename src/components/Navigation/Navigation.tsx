'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Volume2, VolumeX, ShoppingBag, Search, Menu, X, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSoundscape } from '@/hooks/useSoundscape';
import { SearchModal } from '@/components/SearchModal/SearchModal';
import styles from './Navigation.module.css';

export function Navigation() {
  const { totalItems, setIsCartOpen } = useCart();
  const { isPlaying, toggleSound } = useSoundscape();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll-aware glassmorphic backdrop
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open & listen for Escape
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

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
            onClick={toggleSound}
            className={`${styles.actionBtn} ${isPlaying ? styles.soundActive : ''}`}
            aria-label={isPlaying ? 'Mute Castle Soundscape' : 'Enable Castle Soundscape'}
          >
            {isPlaying ? <Volume2 size={14} /> : <VolumeX size={14} />}
            <span className={styles.actionLabel}>{isPlaying ? 'AUDIO ON' : 'AUDIO OFF'}</span>
            {isPlaying && (
              <div className={styles.bars}>
                <div className={styles.bar} />
                <div className={styles.bar} />
                <div className={styles.bar} />
              </div>
            )}
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
