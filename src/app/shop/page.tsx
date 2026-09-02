'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CATEGORIES, CategoryFilter } from '@/data/products';
import { Product } from '@/types';
import { FooterCinematic } from '@/components/FooterCinematic/FooterCinematic';
import { useCart } from '@/context/CartContext';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import styles from './Shop.module.css';

function filterProductsByCategory(products: Product[], category: CategoryFilter | string): Product[] {
  if (!category || category === 'ALL') {
    return products;
  }
  const normalized = category.toUpperCase();
  return products.filter((p) => {
    if (normalized === 'HOODIES') return p.category === 'Hoodies';
    if (normalized === 'T-SHIRTS' || normalized === 'TEES') return p.category === 'T-Shirts';
    if (normalized === 'SHOES' || normalized === 'FOOTWEAR') return p.category === 'Shoes';
    if (normalized === 'JACKETS' || normalized === 'OUTERWEAR') return p.category === 'Jackets';
    if (normalized === 'COATS') return p.category === 'Coats';
    if (normalized === 'CARGOS' || normalized === 'BOTTOMS') return p.category === 'Cargos';
    return p.category?.toUpperCase() === normalized;
  });
}

export default function ShopPage() {
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchProducts() {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch('/api/products');
        if (!res.ok) {
          throw new Error('Failed to load products from archive');
        }
        const data = await res.json();
        if (isMounted) {
          if (data.success && Array.isArray(data.products)) {
            setProducts(data.products);
          } else {
            setProducts([]);
          }
        }
      } catch (err) {
        console.error('Error fetching products in ShopPage:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load products');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchProducts();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredProducts = useMemo(() => {
    return filterProductsByCategory(products, activeCategory);
  }, [products, activeCategory]);

  const handleQuickAdd = (e: React.MouseEvent, prod: Product) => {
    e.preventDefault();
    const defaultSize = prod.sizes?.[0] || 'L';
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
          ARCHITECTURAL HEAVYWEIGHT STREETWEAR, FOOTWEAR & GEAR // {products.length} OBJECTS
        </p>
      </header>

      {/* Category Filter Tabs */}
      <nav className={styles.filterNav} aria-label="Category Filters">
        {CATEGORIES.map((cat) => {
          const count = filterProductsByCategory(products, cat).length;
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
        {isLoading ? (
          <div className={styles.emptyState}>
            <p>LOADING ARCHIVE COLLECTION...</p>
          </div>
        ) : error ? (
          <div className={styles.emptyState}>
            <p>UNABLE TO RETRIEVE ARCHIVE OBJECTS. PLEASE REFRESH.</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          filteredProducts.map((p) => (
            <article key={p.id || p.slug} className={styles.productCard}>
              <Link href={`/product/${p.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className={styles.imageFrame}>
                  {p.rank && <div className={styles.rankBadge}>{p.rank}</div>}
                  {p.category && <div className={styles.categoryBadge}>{p.category}</div>}
                  {p.images && p.images[0] && (
                    <Image
                      src={p.images[0]}
                      alt={p.name}
                      width={600}
                      height={600}
                      className={styles.itemImage}
                    />
                  )}
                </div>

                <div className={styles.itemMeta}>
                  <span className={styles.itemCharacter}>{p.character} // {p.collection}</span>
                  <h2 className={styles.itemTitle}>{p.name}</h2>

                  <div className={styles.itemPriceRow}>
                    <span className={styles.itemPrice}>{p.formattedPrice}</span>
                    <span className={styles.itemSpecs}>
                      {p.gsm && p.gsm > 0 ? `${p.gsm} GSM // ` : ''}{p.fit}
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
