'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import shared from '../shared.module.css';
import styles from './Wishlist.module.css';

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart, setIsCartOpen } = useCart();

  const handleAddToBag = (product: (typeof wishlist)[0]) => {
    addToCart(product, product.sizes?.[0] || 'M', 1, true);
    setIsCartOpen(true);
  };

  return (
    <div>
      {/* Header */}
      <div className={shared.pageHeader}>
        <div className={shared.pageTagline}>
          <span className={shared.taglineDot} />
          INFINITY CASTLE // CURATED ARCHIVE
        </div>
        <h1 className={shared.pageTitle}>WISHLIST</h1>
        <p className={shared.pageSubtitle}>
          {wishlist.length > 0
            ? `${wishlist.length} piece${wishlist.length > 1 ? 's' : ''} preserved in your archive.`
            : 'Your archive awaits curation.'}
        </p>
      </div>

      {wishlist.length === 0 ? (
        <div className={shared.emptyState}>
          <div className={shared.emptyIcon}>
            <Heart size={48} />
          </div>
          <h2 className={shared.emptyTitle}>YOUR ARCHIVE IS EMPTY</h2>
          <p className={shared.emptySubtitle}>
            Explore the collection and preserve pieces worthy of the Infinity Castle.
          </p>
          <Link href="/shop" className={shared.btnPrimary}>
            EXPLORE COLLECTION
          </Link>
        </div>
      ) : (
        <div className={styles.wishlistGrid}>
          {wishlist.map((product) => (
            <div key={product.id} className={styles.wishCard}>
              {/* Product Image */}
              <Link href={`/product/${product.slug}`} className={styles.imageLink}>
                <div className={styles.imageWrapper}>
                  <Image
                    src={product.images?.[0] || product.imagePath || '/assets/products/hoodie_01.png'}
                    alt={product.name}
                    fill
                    className={styles.productImage}
                    sizes="(max-width: 768px) 100vw, 280px"
                  />
                  <div className={styles.imageOverlay} />
                </div>
              </Link>

              {/* Product Info */}
              <div className={styles.cardBody}>
                <div className={styles.productMeta}>
                  <span className={styles.productCategory}>{product.category}</span>
                  <span className={styles.productRank}>{product.rank}</span>
                </div>
                <Link href={`/product/${product.slug}`} className={styles.productName}>
                  {product.name}
                </Link>
                <div className={styles.productPrice}>{product.formattedPrice}</div>
                <div className={styles.productGsm}>{product.gsm} GSM</div>

                {/* Actions */}
                <div className={styles.cardActions}>
                  <button
                    className={shared.btnPrimary}
                    onClick={() => handleAddToBag(product)}
                    style={{ flex: 1, justifyContent: 'center' }}
                  >
                    <ShoppingBag size={13} />
                    ADD TO BAG
                  </button>
                  <button
                    className={shared.btnDanger}
                    onClick={() => removeFromWishlist(product.id)}
                    aria-label="Remove from wishlist"
                    title="Remove from wishlist"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
