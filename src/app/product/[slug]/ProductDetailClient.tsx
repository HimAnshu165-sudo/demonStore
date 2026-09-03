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
  const availableSizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['S', 'M', 'L', 'XL'];
  const [selectedSize, setSelectedSize] = useState<string>(availableSizes[0] || 'L');
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
    ...(product.imagePath ? [product.imagePath] : []),
  ].filter((v, i, a) => a.indexOf(v) === i);

  const displayCategory = product.category || 'COLLECTION';

  return (
    <main className={styles.detailPageContainer}>
      {/* Breadcrumb Navigation */}
      <div className={styles.breadcrumbRow}>
        <Link href="/">CASTLE</Link>
        <span>/</span>
        <Link href="/shop">COLLECTION</Link>
        <span>/</span>
        <span>{displayCategory}</span>
        <span>/</span>
        <span>{product.character}</span>
      </div>

      <div className={styles.editorialLayout}>
        {/* Left: Dominant Visual Gallery */}
        <div className={styles.gallerySection}>
          <div className={styles.heroImageFrame}>
            <Image
              src={allImages[activeImageIndex] || product.images?.[0] || product.imagePath || '/assets/products/hoodie_01.png'}
              alt={product.name}
              width={900}
              height={900}
              className={styles.heroImage}
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
              <span>{product.category ? `${product.category} // ` : ''}{product.character}</span>
              {product.rank && <span>{product.rank}</span>}
            </div>

            {product.japaneseTitle && (
              <div className={styles.kanjiSubtitle}>{product.japaneseTitle}</div>
            )}
            <h1 className={styles.productTitle}>{product.name}</h1>
            <div className={styles.priceDisplay}>{product.formattedPrice}</div>
          </div>

          <p className={styles.productDescription}>{product.description}</p>

          {/* Size Selection */}
          <div className={styles.sizeSelectionArea}>
            <div className={styles.sizeHeader}>
              <span>SELECT SIZE</span>
              {product.fit && <span>{product.fit}</span>}
            </div>
            <div className={styles.sizeOptions}>
              {availableSizes.map((s) => (
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
                <li>CATEGORY: {(product.category || 'ARCHIVE').toUpperCase()}</li>
                {typeof product.gsm === 'number' && product.gsm > 0 && (
                  <li>FABRIC WEIGHT: {product.gsm} GSM</li>
                )}
                {product.material && <li>MATERIAL: {product.material}</li>}
                {product.fit && <li>SILHOUETTE / FIT: {product.fit}</li>}
                {product.color && <li>COLORWAY: {product.color}</li>}
              </ul>
            </div>

            {product.details && product.details.length > 0 && (
              <div className={styles.specRow}>
                <div className={styles.specRowTitle}>CONSTRUCTION & CRAFT</div>
                <ul className={styles.specBullets}>
                  {product.details.map((detail, idx) => (
                    <li key={idx}>{detail}</li>
                  ))}
                </ul>
              </div>
            )}

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
