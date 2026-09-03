'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { adminApi } from '@/services/adminApi';
import { AdminOrder } from '@/types/admin';
import styles from './Checkout.module.css';

export default function CheckoutPage() {
  const { cart, subtotal, formattedSubtotal, clearCart } = useCart();
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [orderCode, setOrderCode] = useState('');

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  useEffect(() => {
    if (user) {
      if (user.name) {
        const parts = user.name.split(' ');
        setFirstName(parts[0] || '');
        setLastName(parts.slice(1).join(' ') || '');
      }
      if (user.email) setEmail(user.email);
      if (user.shippingAddress?.street) {
        setStreet(user.shippingAddress.street || '');
        setCity(user.shippingAddress.city || '');
        setPostalCode(user.shippingAddress.postalCode || '');
      } else if (user.id) {
        try {
          const raw = localStorage.getItem(`demonstore_addresses_${user.id}`);
          if (raw) {
            const addrs = JSON.parse(raw);
            const def = addrs.find((a: any) => a.isDefault) || addrs[0];
            if (def) {
              if (def.street) setStreet(def.street);
              if (def.city) setCity(def.city);
              if (def.postalCode) setPostalCode(def.postalCode);
            }
          }
        } catch { /* ignore */ }
      }
    }
  }, [user]);

  const shippingCost = 0; // Complimentary Global Courier for Drop 001
  const total = subtotal + shippingCost;
  const formattedTotal = `₹${total.toLocaleString('en-IN')}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedCode = `DC-${Math.floor(10000 + Math.random() * 90000)}`;
    setOrderCode(generatedCode);

    // Record order in real admin ledger & update customer stats
    const newOrder: AdminOrder = {
      id: `ord_${Date.now()}`,
      orderNumber: generatedCode,
      customer: {
        id: user?.id || `usr_guest_${Date.now()}`,
        name: `${firstName} ${lastName}`.trim() || user?.name || 'Archival Disciple',
        email: email || user?.email || 'disciple@infinitycastle.jp',
      },
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        category: item.product.category,
        image: item.product.images[0] || '/assets/castle/01-entrance.png',
        size: item.selectedSize,
        quantity: item.quantity,
        unitPrice: item.product.price,
        total: item.product.price * item.quantity,
        gsm: item.product.gsm || 500,
      })),
      subtotal,
      shippingFee: shippingCost,
      tax: Math.round(subtotal * 0.1),
      totalAmount: total,
      paymentStatus: 'paid',
      orderStatus: 'processing',
      shippingAddress: {
        name: `${firstName} ${lastName}`.trim() || user?.name || 'Archival Disciple',
        street: street || 'Nakano 4-Chome 10-1',
        city: city || 'Tokyo',
        state: 'Tokyo',
        postalCode: postalCode || '164-0001',
        country: 'Japan',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    adminApi.createOrder(newOrder);

    setSubmitted(true);
    clearCart();
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
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={styles.minimalInput}
                  />
                </div>
                <div className={styles.fieldWrapper}>
                  <label className={styles.fieldLabel}>LAST NAME</label>
                  <input
                    required
                    placeholder="Kamado"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={styles.minimalInput}
                  />
                </div>
                <div className={`${styles.fieldWrapper} ${styles.fullCol}`}>
                  <label className={styles.fieldLabel}>EMAIL ADDRESS</label>
                  <input
                    type="email"
                    required
                    placeholder="recipient@infinitycastle.jp"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.minimalInput}
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
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className={styles.minimalInput}
                  />
                </div>
                <div className={styles.fieldWrapper}>
                  <label className={styles.fieldLabel}>CITY</label>
                  <input
                    required
                    placeholder="Tokyo"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className={styles.minimalInput}
                  />
                </div>
                <div className={styles.fieldWrapper}>
                  <label className={styles.fieldLabel}>POSTAL CODE</label>
                  <input
                    required
                    placeholder="164-0001"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className={styles.minimalInput}
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

            <button
              type="submit"
              className={styles.confirmOrderCta}
              disabled={cart.length === 0}
            >
              <span>CONFIRM ACQUISITION — {formattedTotal}</span>
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
                  <div key={`${item.product.id}-${item.selectedSize}`} className={styles.summaryItem}>
                    <Image
                      src={item.product.images[0]}
                      alt={item.product.name}
                      width={56}
                      height={70}
                      className={styles.summaryThumb}
                    />
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
