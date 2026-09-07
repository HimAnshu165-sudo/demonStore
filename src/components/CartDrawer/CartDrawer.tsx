'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { X, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import styles from './CartDrawer.module.css';

export function CartDrawer() {
  const pathname = usePathname();
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    totalItems,
    formattedSubtotal,
  } = useCart();

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`${styles.backdrop} ${isCartOpen ? styles.backdropOpen : ''}`}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className={`${styles.drawer} ${isCartOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.header}>
          <div className={styles.titleBox}>
            <h2 className={styles.title}>YOUR BAG</h2>
            <span className={styles.itemCount}>[{totalItems} PIECES]</span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className={styles.closeBtn}
            aria-label="Close Bag"
          >
            <X size={20} />
          </button>
        </div>

        <div className={styles.itemsList}>
          {cart.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyKanji}>空虚</div>
              <p className={styles.emptyText}>YOUR BAG IS CURRENTLY EMPTY</p>
              <button
                onClick={() => setIsCartOpen(false)}
                className={styles.checkoutBtn}
              >
                RETURN TO CASTLE
              </button>
            </div>
          ) : (
            cart.map((item) => (
              <div key={`${item.product.id}-${item.selectedSize}`} className={styles.cartItem}>
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  width={72}
                  height={90}
                  className={styles.itemThumb}
                  sizes="72px"
                  loading="lazy"
                />

                <div className={styles.itemDetails}>
                  <div className={styles.itemName}>{item.product.name}</div>
                  <div className={styles.itemMeta}>
                    SIZE: {item.selectedSize} // {item.product.gsm} GSM
                  </div>
                  <div className={styles.itemPrice}>{item.product.formattedPrice}</div>

                  <div className={styles.qtyControls}>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity - 1)}
                      className={styles.qtyBtn}
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className={styles.qtyVal}>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.selectedSize, item.quantity + 1)}
                      className={styles.qtyBtn}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                  className={styles.removeBtn}
                  aria-label="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.subtotalRow}>
              <span className={styles.subtotalLabel}>SUBTOTAL (EXCL. TAX)</span>
              <span className={styles.subtotalAmount}>{formattedSubtotal}</span>
            </div>

            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className={styles.checkoutBtn}
            >
              <span>PROCEED TO CHECKOUT</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
