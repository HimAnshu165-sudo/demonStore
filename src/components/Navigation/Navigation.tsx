'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Volume2, VolumeX, ShoppingBag, Search, Menu, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useSoundscape } from '@/hooks/useSoundscape';
import { SearchModal } from '@/components/SearchModal/SearchModal';
import styles from './Navigation.module.css';

export function Navigation() {
  const { totalItems, setIsCartOpen } = useCart();
  const { isPlaying, toggleSound } = useSoundscape();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header className={styles.header}>
        <Link href="/" className={styles.brand}>
          <span className={styles.logoTitle}>INFINITY CASTLE</span>
          <span className={styles.kanjiSub}>無限城</span>
        </Link>

        <nav className={`${styles.navLinks} ${mobileMenuOpen ? styles.navLinksMobileOpen : ''}`}>
          <Link href="/shop" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>
            COLLECTION
          </Link>
          <Link href="/lookbook" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>
            LOOKBOOK
          </Link>
          <Link href="/world" className={styles.navLink} onClick={() => setMobileMenuOpen(false)}>
            WORLD
          </Link>
        </nav>

        <div className={styles.actions}>
          <button
            onClick={() => setSearchOpen(true)}
            className={styles.soundButton}
            aria-label="Open Search"
          >
            <Search size={13} />
            <span>SEARCH</span>
          </button>

          <button
            onClick={toggleSound}
            className={`${styles.soundButton} ${isPlaying ? styles.soundActive : ''}`}
            aria-label={isPlaying ? 'Mute Castle Soundscape' : 'Enable Castle Soundscape'}
          >
            {isPlaying ? <Volume2 size={13} /> : <VolumeX size={13} />}
            <span>{isPlaying ? 'AUDIO ON' : 'AUDIO OFF'}</span>
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
            <ShoppingBag size={13} />
            <span>BAG</span>
            {totalItems > 0 && <span className={styles.cartCount}>{totalItems}</span>}
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={styles.mobileMenuBtn}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
