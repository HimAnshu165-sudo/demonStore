'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CATEGORIES, CategoryFilter } from '@/data/products';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { LookbookMarquee } from '@/components/LookbookMarquee/LookbookMarquee';
import { FooterCinematic } from '@/components/FooterCinematic/FooterCinematic';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import styles from './ThunderCollectionLanding.module.css';

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

export function ThunderCollectionLanding() {
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      })
      .catch((err) => {
        console.error('Error fetching products for landing:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const heroProduct = useMemo(() => {
    if (products.length === 0) return null;
    return products.find((p) => p.slug === 'tanjiro-hinokami-kagura-flame-hoodie') || products[0];
  }, [products]);

  const handleAddHero = () => {
    if (heroProduct) {
      const defaultSize = heroProduct.sizes?.[0] || 'L';
      addToCart(heroProduct, defaultSize, 1);
    }
  };

  const handleQuickAdd = (e: React.MouseEvent, prod: Product) => {
    e.preventDefault();
    const defaultSize = prod.sizes?.[0] || 'L';
    addToCart(prod, defaultSize, 1);
  };

  const filteredProducts = useMemo(() => {
    return filterProductsByCategory(products, activeCategory);
  }, [products, activeCategory]);

  return (
    <section id="collection-landing" className={styles.collectionContainer}>
      {/* 1. Hero Drop Showcase */}
      {heroProduct && (
        <div className={styles.heroDropBanner}>
          <div className={styles.productShowcase}>
            <Image
              src={heroProduct.images?.[0] || heroProduct.imagePath || '/assets/products/hoodie_01.png'}
              alt={heroProduct.name}
              width={750}
              height={750}
              className={styles.productImage}
              priority
            />
          </div>

          <div className={styles.dropMeta}>
            <div className={styles.dropTag}>
              <span>⚡</span> NEW DROP // ARCHIVE 001
            </div>

            <h1 className={styles.dropTitle}>
              SOLAR FLAME<br />COLLECTION
            </h1>

            <p className={styles.dropSubtitle}>
              HINOKAMI KAGURA // ヒノカミ神楽 円舞
            </p>

            <p className={styles.dropDesc}>
              {heroProduct.description}
            </p>

            <div className={styles.specsList}>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>FABRIC</span>
                <span className={styles.specValue}>{heroProduct.gsm || 520} GSM FRENCH TERRY</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>EMBROIDERY</span>
                <span className={styles.specValue}>METALLIC & PUFF INK</span>
              </div>
              <div className={styles.specItem}>
                <span className={styles.specLabel}>FIT</span>
                <span className={styles.specValue}>{heroProduct.fit || 'OVERSIZED BOXY'}</span>
              </div>
            </div>

            <div className={styles.priceAction}>
              <div className={styles.priceTag}>{heroProduct.formattedPrice}</div>
              <button className={styles.primaryCta} onClick={handleAddHero}>
                ACQUIRE PIECE ⚡
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Seamless Infinite Lookbook Showcase Marquee */}
      <div className={styles.lookbookBreakout}>
        <LookbookMarquee
          title="THE SLAYER ARCHIVES"
          subtitle="EDITORIAL CAMPAIGN // HOODIES • TEES • SHOES • JACKETS • COATS • CARGOS"
          eyebrow="LOOKBOOK // 2026 CAMPAIGN"
          showExploreLink={true}
        />
      </div>

      {/* 3. Streetwear Universe Dynamic Catalog */}
      <div className={styles.catalogSection}>
        <div className={styles.catalogHeader}>
          <div className={styles.sectionEyebrow}>INFINITY CASTLE STREETWEAR ARCHIVE</div>
          <h2 className={styles.sectionTitle}>THE COMPLETE COLLECTION</h2>
          <p className={styles.sectionSubtitle}>
            HEAVYWEIGHT TEXTILES, FOOTWEAR & ARCHITECTURAL APPAREL // {products.length} OBJECTS
          </p>
        </div>

        {/* Category Filter Navigation */}
        <nav className={styles.filterNav} aria-label="Product Category Filter">
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

        {/* Dynamic Products Grid */}
        <div className={styles.productsGrid}>
          {isLoading ? (
            <div className={styles.emptyState}>
              <p>LOADING ARCHIVE COLLECTION...</p>
            </div>
          ) : filteredProducts.length > 0 ? (
            filteredProducts.map((prod) => (
              <article key={prod.id || prod.slug} className={styles.productCard}>
                <Link href={`/product/${prod.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className={styles.cardImageWrapper}>
                    {prod.category && <span className={styles.cardCategoryBadge}>{prod.category}</span>}
                    <Image
                      src={prod.images?.[0] || prod.imagePath || '/assets/products/hoodie_01.png'}
                      alt={prod.name}
                      width={450}
                      height={450}
                      className={styles.cardImage}
                    />
                  </div>

                  <div className={styles.cardInfo}>
                    <span className={styles.cardCharacter}>{prod.character} // {prod.rank}</span>
                    <h3 className={styles.cardTitle}>{prod.name}</h3>
                    <div className={styles.cardMeta}>
                      <span>{prod.collection}</span>
                      <span className={styles.cardPrice}>{prod.formattedPrice}</span>
                    </div>
                  </div>
                </Link>

                <div className={styles.cardActions}>
                  <Link href={`/product/${prod.slug}`} className={styles.cardButton}>
                    <span>INSPECT</span>
                    <ArrowRight size={14} />
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => handleQuickAdd(e, prod)}
                    className={styles.quickAddBtn}
                    aria-label={`Add ${prod.name} to cart`}
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
      </div>

      {/* 4. Atmospheric Animated Footer Section */}
      <FooterCinematic />
    </section>
  );
}
