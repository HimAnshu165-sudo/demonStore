'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PRODUCTS } from '@/data/products';
import { useCart } from '@/context/CartContext';
import styles from './ThunderCollectionLanding.module.css';

export function ThunderCollectionLanding() {
  const { addToCart } = useCart();
  const zenitsuProduct = PRODUCTS.find((p) => p.slug === 'zenitsu-thunder-breathing-hoodie') || PRODUCTS[0];

  const handleAddZenitsu = () => {
    addToCart(zenitsuProduct, 'L', 1);
  };

  return (
    <section id="collection-landing" className={styles.collectionContainer}>
      {/* Hero Drop Showcase matching Panel 10 */}
      <div className={styles.heroDropBanner}>
        <div className={styles.productShowcase}>
          <Image
            src={zenitsuProduct.images[0]}
            alt={zenitsuProduct.name}
            width={700}
            height={700}
            className={styles.productImage}
            priority
          />
        </div>

        <div className={styles.dropMeta}>
          <div className={styles.dropTag}>
            <span>⚡</span> NEW DROP // FINAL FORM EDITION
          </div>

          <h1 className={styles.dropTitle}>
            THUNDER<br />COLLECTION
          </h1>

          <p className={styles.dropSubtitle}>
            AWAKEN YOUR SPEED // 雷の呼吸
          </p>

          <p className={styles.dropDesc}>
            {zenitsuProduct.description}
          </p>

          <div className={styles.specsList}>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>FABRIC</span>
              <span className={styles.specValue}>{zenitsuProduct.gsm} GSM FRENCH TERRY</span>
            </div>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>EMBROIDERY</span>
              <span className={styles.specValue}>METALLIC GOLD 24K</span>
            </div>
            <div className={styles.specItem}>
              <span className={styles.specLabel}>FIT</span>
              <span className={styles.specValue}>BOX OVERSIZED</span>
            </div>
          </div>

          <div className={styles.priceAction}>
            <div className={styles.priceTag}>{zenitsuProduct.formattedPrice}</div>
            <button className={styles.primaryCta} onClick={handleAddZenitsu}>
              ACQUIRE PIECE ⚡
            </button>
          </div>
        </div>
      </div>

      {/* Streetwear Universe Catalog */}
      <div className={styles.catalogHeader}>
        <div className={styles.sectionEyebrow}>INFINITY CASTLE STREETWEAR</div>
        <h2 className={styles.sectionTitle}>THE COMPLETE COLLECTION</h2>
      </div>

      <div className={styles.productsGrid}>
        {PRODUCTS.map((prod) => (
          <div key={prod.id} className={styles.productCard}>
            <div className={styles.cardImageWrapper}>
              <Image
                src={prod.images[0]}
                alt={prod.name}
                width={400}
                height={400}
                className={styles.cardImage}
              />
            </div>
            <div className={styles.cardInfo}>
              <span className={styles.specLabel}>{prod.character}</span>
              <h3 className={styles.cardTitle}>{prod.name}</h3>
              <div className={styles.cardMeta}>
                <span>{prod.collection}</span>
                <span className={styles.cardPrice}>{prod.formattedPrice}</span>
              </div>
            </div>
            <Link href={`/product/${prod.slug}`} className={styles.cardButton} style={{ textAlign: 'center', textDecoration: 'none' }}>
              VIEW DETAILS →
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
