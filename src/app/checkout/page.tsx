'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import styles from './Checkout.module.css';

export default function CheckoutPage() {
  const { cart, subtotal, formattedSubtotal, clearCart } = useCart();
  const [submitted, setSubmitted] = useState(false);
  const [orderCode, setOrderCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const shippingCost = 0; // Complimentary Global Courier for Drop 001
  const total = subtotal + shippingCost;
  const formattedTotal = `₹${total.toLocaleString('en-IN')}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const orderPayload = {
        customer: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
        },
        shippingAddress: {
          streetAddress: streetAddress.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(),
          country: 'Japan',
        },
        items: cart.map((item) => ({
          slug: item.product.slug,
          productId: item.product.id,
          selectedSize: item.selectedSize,
          quantity: item.quantity,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to place order. Please try again.');
      }

      setOrderCode(data.order.orderId);
      setSubmitted(true);
      clearCart();
    } catch (err) {
      console.error('Checkout error:', err);
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred during acquisition.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className={styles.checkoutContainer}>
      <header className={styles.checkoutHeader}>
        <div className={styles.headerMeta}>
          <span>ACQUISITION PROTOCOL // 2026</span>
          <span><b>ENCRYPTED</b> DISPATCH</span>
        </div>
        <h1 className={styles.checkoutTitle}>FINAL ACQUISITION</h1>
      </header>

      {submitted ? (
        <div className={styles.successContainer}>
          <div className={styles.successKanji}>契約成立</div>
          <h2 className={styles.successTitle}>ACQUISITION CONFIRMED</h2>
          <p className={styles.successDesc}>
            Your piece has been recorded in the Infinity Castle archive under Order <b>#{orderCode}</b>. Custom charred cedar packaging and laser-engraved certificate of authenticity are now queued for dispatch.
          </p>
          <Link href="/" className={styles.returnHomeLink}>
            <span>RETURN TO THE CASTLE</span>
            <span>→</span>
          </Link>
        </div>
      ) : (
        <div className={styles.checkoutLayout}>
          {/* Checkout Form */}
          <form onSubmit={handleSubmit} className={styles.formSection}>
            {/* 01: Contact Information */}
            <div className={styles.formBlock}>
              <div className={styles.blockHeading}>
                <span className={styles.blockNumber}>01</span>
                <span>CONTACT & IDENTITY</span>
              </div>
              <div className={styles.inputGrid}>
                <div className={styles.fieldWrapper}>
                  <label className={styles.fieldLabel}>FIRST NAME</label>
                  <input
                    required
                    placeholder="Tanjuro"
                    className={styles.minimalInput}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className={styles.fieldWrapper}>
                  <label className={styles.fieldLabel}>LAST NAME</label>
                  <input
                    required
                    placeholder="Kamado"
                    className={styles.minimalInput}
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <div className={`${styles.fieldWrapper} ${styles.fullCol}`}>
                  <label className={styles.fieldLabel}>EMAIL ADDRESS</label>
                  <input
                    type="email"
                    required
                    placeholder="recipient@infinitycastle.jp"
                    className={styles.minimalInput}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* 02: Archive Delivery Address */}
            <div className={styles.formBlock}>
              <div className={styles.blockHeading}>
                <span className={styles.blockNumber}>02</span>
                <span>ARCHIVE DELIVERY ADDRESS</span>
              </div>
              <div className={styles.inputGrid}>
                <div className={`${styles.fieldWrapper} ${styles.fullCol}`}>
                  <label className={styles.fieldLabel}>STREET ADDRESS</label>
                  <input
                    required
                    placeholder="Nakano 4-Chome 10-1"
                    className={styles.minimalInput}
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                  />
                </div>
                <div className={styles.fieldWrapper}>
                  <label className={styles.fieldLabel}>CITY</label>
                  <input
                    required
                    placeholder="Tokyo"
                    className={styles.minimalInput}
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div className={styles.fieldWrapper}>
                  <label className={styles.fieldLabel}>POSTAL CODE</label>
                  <input
                    required
                    placeholder="164-0001"
                    className={styles.minimalInput}
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* 03: Payment Protocol */}
            <div className={styles.formBlock}>
              <div className={styles.blockHeading}>
                <span className={styles.blockNumber}>03</span>
                <span>PAYMENT PROTOCOL</span>
              </div>
              <div className={styles.inputGrid}>
                <div className={`${styles.fieldWrapper} ${styles.fullCol}`}>
                  <label className={styles.fieldLabel}>CARD NUMBER</label>
                  <input required placeholder="•••• •••• •••• ••••" className={styles.minimalInput} />
                </div>
                <div className={styles.fieldWrapper}>
                  <label className={styles.fieldLabel}>EXPIRY DATE</label>
                  <input required placeholder="MM / YY" className={styles.minimalInput} />
                </div>
                <div className={styles.fieldWrapper}>
                  <label className={styles.fieldLabel}>SECURITY CODE</label>
                  <input required placeholder="CVC" className={styles.minimalInput} />
                </div>
              </div>
            </div>

            {errorMessage && (
              <div style={{ color: '#ff4d4d', fontSize: '0.85rem', marginBottom: '1rem', letterSpacing: '0.05em' }}>
                ⚠️ {errorMessage}
              </div>
            )}

            <button
              type="submit"
              className={styles.confirmOrderCta}
              disabled={cart.length === 0 || isSubmitting}
            >
              <span>{isSubmitting ? 'ENCRYPTING & RECORDING...' : `CONFIRM ACQUISITION — ${formattedTotal}`}</span>
              <span className={styles.ctaLine} />
              <span>→</span>
            </button>
          </form>

          {/* Order Summary */}
          <aside className={styles.summaryCol}>
            <h2 className={styles.summaryTitle}>BAG SUMMARY</h2>
            
            {cart.length > 0 ? (
              <div className={styles.itemsList}>
                {cart.map((item) => (
                  <div key={`${item.product.id || item.product.slug}-${item.selectedSize}`} className={styles.summaryItem}>
                    {item.product.images && item.product.images[0] && (
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        width={56}
                        height={70}
                        className={styles.summaryThumb}
                      />
                    )}
                    <div className={styles.summaryItemInfo}>
                      <div className={styles.summaryItemName}>{item.product.name}</div>
                      <div className={styles.summaryItemMeta}>
                        SIZE: {item.selectedSize} // QTY: {item.quantity}
                      </div>
                    </div>
                    <div className={styles.summaryItemPrice}>{item.product.formattedPrice}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ color: '#7d8781', fontSize: '0.85rem', fontStyle: 'italic' }}>
                No pieces selected in bag.
              </div>
            )}

            <div className={styles.costBreakdown}>
              <div className={styles.costRow}>
                <span>SUBTOTAL</span>
                <span>{formattedSubtotal}</span>
              </div>
              <div className={styles.costRow}>
                <span>GLOBAL SECURED COURIER</span>
                <span style={{ color: '#ffd700' }}>COMPLIMENTARY</span>
              </div>
              <div className={styles.totalRow}>
                <span>TOTAL DUE</span>
                <span>{formattedTotal}</span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
