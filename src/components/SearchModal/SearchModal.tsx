'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Search } from 'lucide-react';
import { PRODUCTS } from '@/data/products';
import styles from './SearchModal.module.css';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
      setQuery('');
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = PRODUCTS.filter((p) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      p.name.toLowerCase().includes(q) ||
      p.character.toLowerCase().includes(q) ||
      p.japaneseTitle.toLowerCase().includes(q) ||
      p.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  return (
    <div className={styles.searchOverlay} role="dialog" aria-modal="true">
      <div className={styles.searchHeader}>
        <div className={styles.eyebrow}>SEARCH THE ARCHIVE // 探検</div>
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close search">
          <span>ESC</span>
          <X size={14} />
        </button>
      </div>

      <div className={styles.inputWrapper}>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="TYPE TO DISCOVER PIECES..."
          className={styles.searchInput}
        />
      </div>

      <div className={styles.resultsContainer}>
        <div className={styles.resultsCount}>
          {filtered.length} {filtered.length === 1 ? 'OBJECT FOUND' : 'OBJECTS FOUND'}
        </div>

        {filtered.length > 0 ? (
          <div className={styles.resultsGrid}>
            {filtered.map((prod) => (
              <Link
                key={prod.id}
                href={`/product/${prod.slug}`}
                onClick={onClose}
                className={styles.resultItem}
              >
                <div className={styles.resultImageWrapper}>
                  <Image
                    src={prod.images[0]}
                    alt={prod.name}
                    width={320}
                    height={320}
                    className={styles.resultImage}
                  />
                </div>
                <div className={styles.resultMeta}>
                  <span className={styles.resultSubtitle}>{prod.character} // {prod.collection}</span>
                  <div className={styles.resultTitle}>{prod.name}</div>
                  <div className={styles.resultPrice}>{prod.formattedPrice}</div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            NO PIECES MATCH YOUR SEARCH CRITERIA.
          </div>
        )}
      </div>
    </div>
  );
}
