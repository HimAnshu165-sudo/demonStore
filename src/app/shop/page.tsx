'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PRODUCTS } from '@/data/products';
import styles from './Shop.module.css';

export default function ShopPage() {
  const [activeCategory, setActiveCategory] = useState<'ALL' | 'OUTERWEAR' | 'HOODIES' | 'TEES' | 'LIMITED'>('ALL');

  const categories = ['ALL', 'OUTERWEAR', 'HOODIES', 'TEES', 'LIMITED'] as const;

  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((p) => {
      if (activeCategory === 'ALL') return true;
      if (activeCategory === 'OUTERWEAR') return p.tags.includes('Outerwear') || p.tags.includes('Bomber') || p.tags.includes('Trench');
      if (activeCategory === 'HOODIES') return p.tags.includes('Hoodie') || p.tags.includes('Knitwear');
      if (activeCategory === 'TEES') return p.tags.includes('T-Shirt');
      if (activeCategory === 'LIMITED') return p.tags.includes('Limited') || p.tags.includes('Final Form') || p.tags.includes('Statement');
      return true;
    });
  }, [activeCategory]);

  return (
    <main className={styles.shopContainer}>
      <div className={styles.shopBgKanji}>無限</div>

      <header className={styles.shopHeader}>
        <div className={styles.headerMeta}>
          <span>DROP 001 // ARCHIVE 2026</span>
          <span><b>UPPER MOON</b> COLLECTION</span>
        </div>
        <h1 className={styles.shopTitle}>
          SHOP<br />THE COLLECTION
        </h1>
        <p className={styles.shopSubtitle}>
          ARCHITECTURAL HEAVYWEIGHT STREETWEAR // 420–600 GSM
        </p>
      </header>

      {/* Minimal Editorial Category Filter */}
      <nav className={styles.filterNav} aria-label="Category Filters">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`${styles.filterBtn} ${activeCategory === cat ? styles.filterBtnActive : ''}`}
          >
            {cat}
          </button>
        ))}
      </nav>

      {/* Asymmetric Editorial Catalog Layout */}
      <div className={styles.editorialCatalog}>
        {filteredProducts.map((p, index) => {
          // Asymmetric layout span rule based on index
          let spanClass = styles.spanHalf;
          if (index === 0) spanClass = styles.spanHero;
          else if (index % 3 === 1) spanClass = styles.spanWide;
          else if (index % 3 === 2) spanClass = styles.spanTall;

          const altImage = p.images[1] || p.lookbookImages[0] || p.images[0];

          return (
            <article key={p.id} className={`${styles.editorialItem} ${spanClass}`}>
              <Link href={`/product/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={styles.imageFrame}>
                  <div className={styles.rankBadge}>{p.rank}</div>
                  <Image
                    src={p.images[0]}
                    alt={p.name}
                    width={800}
                    height={1000}
                    className={styles.itemImage}
                    priority={index === 0}
                  />
                  <Image
                    src={altImage}
                    alt={`${p.name} alternate angle`}
                    width={800}
                    height={1000}
                    className={styles.itemImageAlt}
                  />
                </div>

                <div className={styles.itemMeta}>
                  <span className={styles.itemCharacter}>{p.character} // {p.collection}</span>
                  <h2 className={styles.itemTitle}>{p.name}</h2>
                  
                  <div className={styles.itemPriceRow}>
                    <span className={styles.itemPrice}>{p.formattedPrice}</span>
                    <span className={styles.itemSpecs}>{p.gsm} GSM // {p.fit}</span>
                  </div>

                  <div className={styles.inspectLink}>
                    <span>VIEW OBJECT</span>
                    <span className={styles.inspectLine} />
                    <span>→</span>
                  </div>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </main>
  );
}
