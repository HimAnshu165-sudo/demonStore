'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingBag, Trash2, Heart, Minus, Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import shared from '../shared.module.css';
import styles from './Bag.module.css';

export default function BagPage() {
  const { cart, removeFromCart, updateQuantity, subtotal, formattedSubtotal } = useCart();
  const { addToWishlist, isWishlisted } = useWishlist();

  const shippingFee = 0;
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + shippingFee + tax;

  const handleMoveToWishlist = (item: typeof cart[0]) => {
    addToWishlist(item.product);
    removeFromCart(item.product.id, item.selectedSize);
  };

  return (
    <div>
      <div className={shared.pageHeader}>
        <div className={shared.pageTagline}>
          <span className={shared.taglineDot} />
          INFINITY CASTLE // ACQUISITION BAG
        </div>
        <h1 className={shared.pageTitle}>MY BAG</h1>
        <p className={shared.pageSubtitle}>
          {cart.length > 0
            ? `${cart.length} piece${cart.length > 1 ? 's' : ''} selected for acquisition.`
            : 'Your bag awaits pieces from the archive.'}
        </p>
      </div>

      {cart.length === 0 ? (
        <div className={shared.emptyState}>
          <div className={shared.emptyIcon}><ShoppingBag size={48} /></div>
          <h2 className={shared.emptyTitle}>NO PIECES IN YOUR BAG</h2>
          <p className={shared.emptySubtitle}>
            Explore the Infinity Castle archive and add pieces to begin your acquisition.
          </p>
          <Link href="/shop" className={shared.btnPrimary}>
            EXPLORE COLLECTION
          </Link>
        </div>
      ) : (
        <div className={styles.bagLayout}>
          {/* Items List */}
          <div className={styles.bagItems}>
            {cart.map((item) => {
              const lineTotal = item.product.price * item.quantity;
              const alreadyWishlisted = isWishlisted(item.product.id);

              return (
                <div key={`${item.product.id}-${item.selectedSize}`} className={styles.bagItem}>
                  {/* Product Image */}
                  <Link href={`/product/${item.product.slug}`} className={styles.itemImageLink}>
                    <Image
                      src={item.product.images?.[0] || item.product.imagePath}
                      alt={item.product.name}
                      width={88}
                      height={110}
                      className={styles.itemImage}
                    />
                  </Link>

                  {/* Info */}
                  <div className={styles.itemInfo}>
                    <div className={styles.itemCategory}>{item.product.category}</div>
                    <Link href={`/product/${item.product.slug}`} className={styles.itemName}>
                      {item.product.name}
                    </Link>
                    <div className={styles.itemMeta}>
                      SIZE: {item.selectedSize} // {item.product.gsm} GSM
                    </div>
                    <div className={styles.itemPrice}>
                      {item.product.formattedPrice}
                    </div>
                  </div>

                  {/* Quantity + Actions */}
                  <div className={styles.itemControls}>
                    <div className={styles.qtyControl}>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity - 1)}
                        aria-label="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span className={styles.qtyValue}>{item.quantity}</span>
                      <button
                        className={styles.qtyBtn}
                        onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity + 1)}
                        aria-label="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className={styles.lineTotal}>
                      ₹{lineTotal.toLocaleString('en-IN')}
                    </div>

                    <div className={styles.itemActions}>
                      {!alreadyWishlisted && (
                        <button
                          className={styles.actionBtn}
                          onClick={() => handleMoveToWishlist(item)}
                          title="Move to Wishlist"
                        >
                          <Heart size={13} />
                          SAVE
                        </button>
                      )}
                      <button
                        className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                        onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                        title="Remove from bag"
                      >
                        <Trash2 size={13} />
                        REMOVE
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <aside className={styles.bagSummary}>
            <div className={styles.summaryCard}>
              <h2 className={styles.summaryTitle}>BAG SUMMARY</h2>

              <div className={styles.costRows}>
                <div className={styles.costRow}>
                  <span>SUBTOTAL</span>
                  <span>{formattedSubtotal}</span>
                </div>
                <div className={styles.costRow}>
                  <span>GLOBAL COURIER</span>
                  <span style={{ color: '#ffd700' }}>COMPLIMENTARY</span>
                </div>
                <div className={styles.costRow}>
                  <span>TAX (10%)</span>
                  <span>₹{tax.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className={styles.totalRow}>
                <span>TOTAL DUE</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>

              <Link href="/checkout" className={`${shared.btnPrimary} ${styles.checkoutBtn}`}>
                <ShoppingBag size={14} />
                PROCEED TO CHECKOUT
              </Link>

              <Link href="/shop" className={styles.continueLink}>
                CONTINUE SHOPPING →
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
