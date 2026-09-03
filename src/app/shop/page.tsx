'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CATEGORIES, CategoryFilter, getProductsByCategory, PRODUCTS } from '@/data/products';
import { FooterCinematic } from '@/components/FooterCinematic/FooterCinematic';
import { useCart } from '@/context/CartContext';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import styles from './Shop.module.css';

export default function ShopPage() {
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL');

  const filteredProducts = useMemo(() => {
    return getProductsByCategory(activeCategory);
  }, [activeCategory]);

  const handleQuickAdd = (e: React.MouseEvent, prod: typeof PRODUCTS[0]) => {
    e.preventDefault();
    const defaultSize = prod.sizes[0] || 'L';
    addToCart(prod, defaultSize, 1);
  };

  return (
    <main className={styles.shopContainer}>
      <div className={styles.shopBgKanji}>無限</div>

      <header className={styles.shopHeader}>
        <div className={styles.headerMeta}>
          <span>DROP 001 // ARCHIVE 2026</span>
          <span><b>INFINITY CASTLE</b> STREETWEAR UNIVERSE</span>
        </div>
        <h1 className={styles.shopTitle}>
          SHOP<br />THE COLLECTION
        </h1>
        <p className={styles.shopSubtitle}>
          ARCHITECTURAL HEAVYWEIGHT STREETWEAR, FOOTWEAR & GEAR // {PRODUCTS.length} OBJECTS
        </p>
      </header>

      {/* Category Filter Tabs */}
      <nav className={styles.filterNav} aria-label="Category Filters">
        {CATEGORIES.map((cat) => {
          const count = getProductsByCategory(cat).length;
          const isActive = activeCategory === cat;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`${styles.filterBtn} ${isActive ? styles.filterBtnActive : ''}`}
            >
              <span>{cat}</span>
              <span className={styles.filterCount}>[{count}]</span>
            </button>
          );
        })}
      </nav>

      {/* Structured Clean Uniform Catalog Grid */}
      <div className={styles.structuredCatalog}>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((p) => (
            <article key={p.id} className={styles.productCard}>
              <Link href={`/product/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={styles.imageFrame}>
                  <div className={styles.rankBadge}>{p.rank}</div>
                  <div className={styles.categoryBadge}>{p.category}</div>
                  <Image
                    src={p.images[0]}
                    alt={p.name}
                    width={600}
                    height={600}
                    className={styles.itemImage}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    loading="lazy"
                  />
                </div>

                <div className={styles.itemMeta}>
                  <span className={styles.itemCharacter}>{p.character} // {p.collection}</span>
                  <h2 className={styles.itemTitle}>{p.name}</h2>

                  <div className={styles.itemPriceRow}>
                    <span className={styles.itemPrice}>{p.formattedPrice}</span>
                    <span className={styles.itemSpecs}>
                      {p.gsm > 0 ? `${p.gsm} GSM // ` : ''}{p.fit}
                    </span>
                  </div>
                </div>
              </Link>

              <div className={styles.cardActions}>
                <Link href={`/product/${p.slug}`} className={styles.inspectBtn}>
                  <span>INSPECT</span>
                  <ArrowRight size={14} />
                </Link>
                <button
                  type="button"
                  onClick={(e) => handleQuickAdd(e, p)}
                  className={styles.quickAddBtn}
                  aria-label={`Add ${p.name} to bag`}
                >
                  <ShoppingBag size={15} />
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>NO OBJECTS FOUND IN THIS CATEGORY ARCHIVE.</p>
          </div>
        )}
      </div>

      <FooterCinematic />
    </main>
  );
}
