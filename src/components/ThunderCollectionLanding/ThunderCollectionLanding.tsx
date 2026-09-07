'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CATEGORIES, CategoryFilter, getProductsByCategory, PRODUCTS } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { LookbookMarquee } from '@/components/LookbookMarquee/LookbookMarquee';
import { FooterCinematic } from '@/components/FooterCinematic/FooterCinematic';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import styles from './ThunderCollectionLanding.module.css';

export function ThunderCollectionLanding() {
  const { addToCart } = useCart();
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('ALL');

  const heroProduct = PRODUCTS.find((p) => p.slug === 'tanjiro-hinokami-kagura-flame-hoodie') || PRODUCTS[0];

  const handleAddHero = () => {
    addToCart(heroProduct, 'L', 1);
  };

  const handleQuickAdd = (e: React.MouseEvent, prod: typeof PRODUCTS[0]) => {
    e.preventDefault();
    const defaultSize = prod.sizes[0] || 'L';
    addToCart(prod, defaultSize, 1);
  };

  const filteredProducts = useMemo(() => {
    return getProductsByCategory(activeCategory);
  }, [activeCategory]);

  return (
    <section id="collection-landing" className={styles.collectionContainer}>
      {/* 1. Hero Drop Showcase */}
      <div className={styles.heroDropBanner}>
        <div className={styles.productShowcase}>
          <Image
            src={heroProduct.images[0]}
            alt={heroProduct.name}
            width={750}
            height={750}
            className={styles.productImage}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 750px"
            loading="lazy"
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
              <span className={styles.specValue}>{heroProduct.gsm} GSM FRENCH TERRY</span>
            </div>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>EMBROIDERY</span>
              <span className={styles.specValue}>METALLIC & PUFF INK</span>
            </div>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>FIT</span>
              <span className={styles.specValue}>OVERSIZED BOXY</span>
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

      {/* 2. Seamless Infinite Lookbook Showcase Marquee */}
      <div className={styles.lookbookBreakout}>
        <LookbookMarquee
          title="THE SLAYER ARCHIVES"
          subtitle="EDITORIAL CAMPAIGN // HOODIES • TEES • SHOES • JACKETS • COATS • CARGOS"
          eyebrow="LOOKBOOK // 2026 CAMPAIGN"
          showExploreLink={true}
          preloadFirstFew={false}
        />
      </div>

      {/* 3. Streetwear Universe Dynamic Catalog */}
      <div className={styles.catalogSection}>
        <div className={styles.catalogHeader}>
          <div className={styles.sectionEyebrow}>INFINITY CASTLE STREETWEAR ARCHIVE</div>
          <h2 className={styles.sectionTitle}>THE COMPLETE COLLECTION</h2>
          <p className={styles.sectionSubtitle}>
            HEAVYWEIGHT TEXTILES, FOOTWEAR & ARCHITECTURAL APPAREL // 28 OBJECTS
          </p>
        </div>

        {/* Category Filter Navigation */}
        <nav className={styles.filterNav} aria-label="Product Category Filter">
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

        {/* Dynamic Products Grid */}
        <div className={styles.productsGrid}>
          {filteredProducts.length > 0 ? (
            filteredProducts.map((prod) => (
              <article key={prod.id} className={styles.productCard}>
                <Link href={`/product/${prod.slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                  <div className={styles.cardImageWrapper}>
                    <span className={styles.cardCategoryBadge}>{prod.category}</span>
                    <Image
                      src={prod.images[0]}
                      alt={prod.name}
                      width={450}
                      height={450}
                      className={styles.cardImage}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      loading="lazy"
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
