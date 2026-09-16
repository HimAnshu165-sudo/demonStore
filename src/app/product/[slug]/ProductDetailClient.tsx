'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/context/CartContext';
import { FooterCinematic } from '@/components/FooterCinematic/FooterCinematic';
import styles from './ProductDetail.module.css';

interface ProductDetailClientProps {
  product: Product;
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes[0] || 'L');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addToCart(product, selectedSize, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2400);
  };

  const allImages = [
    ...(product.images || []),
    ...(product.lookbookImages || []),
  ].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <main className={styles.detailPageContainer}>
      {/* Breadcrumb Navigation */}
      <div className={styles.breadcrumbRow}>
        <Link href="/">CASTLE</Link>
        <span>/</span>
        <Link href="/shop">COLLECTION</Link>
        <span>/</span>
        <span>{product.category}</span>
        <span>/</span>
        <span>{product.character}</span>
      </div>

      <div className={styles.editorialLayout}>
        {/* Left: Dominant Visual Gallery */}
        <div className={styles.gallerySection}>
          <div className={styles.heroImageFrame}>
            <Image
              src={allImages[activeImageIndex] || product.images[0]}
              alt={product.name}
              width={900}
              height={900}
              className={styles.heroImage}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 700px"
              priority
            />
          </div>

          {allImages.length > 1 && (
            <div className={styles.galleryThumbs}>
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`${styles.thumbBtn} ${activeImageIndex === idx ? styles.thumbBtnActive : ''}`}
                  aria-label={`View image angle ${idx + 1}`}
                >
                  <Image
                    src={img}
                    alt=""
                    width={80}
                    height={80}
                    className={styles.thumbImg}
                    sizes="80px"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Asymmetric Fashion Information */}
        <div className={styles.infoSection}>
          <div className={styles.headerCluster}>
            <div className={styles.characterMeta}>
              <span>{product.category} // {product.character}</span>
              <span>{product.rank}</span>
            </div>

            <div className={styles.kanjiSubtitle}>{product.japaneseTitle}</div>
            <h1 className={styles.productTitle}>{product.name}</h1>
            <div className={styles.priceDisplay}>{product.formattedPrice}</div>
          </div>

          <p className={styles.productDescription}>{product.description}</p>

          {/* Size Selection */}
          <div className={styles.sizeSelectionArea}>
            <div className={styles.sizeHeader}>
              <span>SELECT SIZE</span>
              <span>{product.fit}</span>
            </div>
            <div className={styles.sizeOptions}>
              {product.sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={`${styles.sizeButton} ${selectedSize === s ? styles.sizeButtonActive : ''}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Add to Bag Editorial CTA */}
          <button onClick={handleAdd} className={styles.addToBagCta}>
            <span>{added ? 'ACQUIRED TO BAG' : 'ADD TO BAG'}</span>
            <span className={styles.ctaArrow}>→</span>
          </button>
          {added && (
            <div className={styles.addedFeedback}>
              ✓ {product.name} ({selectedSize}) ADDED TO YOUR BAG
            </div>
          )}

          {/* Minimal Expandable Specs */}
          <div className={styles.specsContainer}>
            <div className={styles.specRow}>
              <div className={styles.specRowTitle}>GARMENT & OBJECT SPECIFICATIONS</div>
              <ul className={styles.specBullets}>
                <li>CATEGORY: {product.category.toUpperCase()}</li>
                {product.gsm > 0 && <li>FABRIC WEIGHT: {product.gsm} GSM</li>}
                <li>MATERIAL: {product.material}</li>
                <li>SILHOUETTE / FIT: {product.fit}</li>
                <li>COLORWAY: {product.color}</li>
              </ul>
            </div>

            <div className={styles.specRow}>
              <div className={styles.specRowTitle}>CONSTRUCTION & CRAFT</div>
              <ul className={styles.specBullets}>
                {product.details.map((detail, idx) => (
                  <li key={idx}>{detail}</li>
                ))}
              </ul>
            </div>

            <div className={styles.specRow}>
              <div className={styles.specRowTitle}>SHIPPING & ARCHIVE DELIVERY</div>
              <div className={styles.specRowContent}>
                Complimentary tracked courier dispatch in custom matte black cedar box with serialized certificate of authenticity. Worldwide delivery within 3–5 business days.
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterCinematic />
    </main>
  );
}
