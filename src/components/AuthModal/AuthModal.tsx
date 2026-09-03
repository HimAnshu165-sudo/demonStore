'use client';

import React, { useState, useEffect } from 'react';
import { X, Mail, Lock, User, ArrowRight, AlertCircle, ShoppingBag, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import styles from './AuthModal.module.css';

type RoleTab = 'customer' | 'admin';

export function AuthModal() {
  const {
    authModalOpen,
    authModalMode,
    pendingAction,
    closeAuthModal,
    loginCustomer,
    registerCustomer,
    loginAdmin,
    executePendingAction,
  } = useAuth();

  const { addToCart, setIsCartOpen } = useCart();
  const router = useRouter();

  // Which portal: customer or admin
  const [roleTab, setRoleTab] = useState<RoleTab>('customer');

  // Customer sub-tabs: sign in or register
  const [mode, setMode] = useState<'login' | 'signup'>(authModalMode || 'login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync mode with authModalMode whenever modal opens
  useEffect(() => {
    if (authModalOpen) {
      setMode(authModalMode);
      setRoleTab('customer');
      setError(null);
      resetForm();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authModalOpen, authModalMode]);

  // Restore body overflow safely without breaking hero animation
  useEffect(() => {
    if (authModalOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') closeAuthModal();
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = prevOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [authModalOpen, closeAuthModal]);

  if (!authModalOpen) return null;

  function resetForm() {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError(null);
  }

  function switchRole(tab: RoleTab) {
    setRoleTab(tab);
    resetForm();
    if (tab === 'customer') setMode('login');
  }

  // ─── Admin Submit ───────────────────────────────────────────────────────────
  const handleAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError('Administrator email is required.');
      return;
    }

    setIsSubmitting(true);
    const res = await loginAdmin(cleanEmail, password || undefined);
    setIsSubmitting(false);

    if (!res.success) {
      setError(res.error || 'ACCESS DENIED. Invalid administrator credentials.');
      return;
    }

    closeAuthModal();
    router.push('/admin/dashboard');
  };

  // ─── Customer Submit ────────────────────────────────────────────────────────
  const handleCustomerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please provide an email address.');
      return;
    }

    if (mode === 'signup') {
      const cleanName = name.trim();
      if (!cleanName) {
        setError('Please enter your full name or Slayer identity.');
        return;
      }
      if (password && confirmPassword && password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      setIsSubmitting(true);
      const res = await registerCustomer(cleanName, cleanEmail, password);
      setIsSubmitting(false);

      if (!res.success) {
        setError(res.error || 'Failed to establish disciple registration.');
        return;
      }
    } else {
      setIsSubmitting(true);
      const res = await loginCustomer(cleanEmail, password);
      setIsSubmitting(false);

      if (!res.success) {
        setError(res.error || 'Authentication rejected. Verify your credentials.');
        return;
      }
    }

    // Execute any pending action (e.g. deferred Add-to-Cart)
    executePendingAction((action) => {
      if (action.type === 'ADD_TO_CART' && action.product) {
        addToCart(action.product, action.selectedSize || 'L', action.quantity || 1, true);
        setIsCartOpen(true);
      }
    });

    closeAuthModal();
  };

  // ─── Fill dummy admin credentials ──────────────────────────────────────────
  const fillAdminCredentials = () => {
    setEmail('admin@demonstore.luxury');
    setPassword('admin123');
    setError(null);
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className={styles.backdrop} onClick={closeAuthModal}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.header}>
          <div>
            <div className={styles.tagline}>
              <span className={styles.taglineDot} />
              <span>INFINITY CASTLE // CITADEL PORTAL</span>
            </div>
            <h2 className={styles.title}>
              <span>
                {roleTab === 'admin'
                  ? 'CITADEL ADMIN'
                  : mode === 'login'
                  ? 'DISCIPLE LOGIN'
                  : 'JOIN ARCHIVE'}
              </span>
              <span className={styles.kanjiSub}>{roleTab === 'admin' ? '無惨' : '無限城'}</span>
            </h2>
          </div>

          <button onClick={closeAuthModal} className={styles.closeBtn} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* ── ROLE SELECTOR ── */}
        <div className={styles.roleSwitcher}>
          <button
            type="button"
            className={`${styles.roleBtn} ${roleTab === 'customer' ? styles.roleBtnActiveCustomer : ''}`}
            onClick={() => switchRole('customer')}
          >
            <User size={13} />
            DISCIPLE / USER
          </button>
          <button
            type="button"
            className={`${styles.roleBtn} ${roleTab === 'admin' ? styles.roleBtnActiveAdmin : ''}`}
            onClick={() => switchRole('admin')}
          >
            <Shield size={13} />
            ADMIN / CITADEL
          </button>
        </div>

        {/* ── PENDING ACTION BANNER (customer mode only) ── */}
        {roleTab === 'customer' && pendingAction && pendingAction.type === 'ADD_TO_CART' && (
          <div className={styles.pendingActionBanner}>
            <ShoppingBag size={14} color="#ff2a55" />
            <div>
              Authenticate to complete adding{' '}
              <span>{pendingAction.product?.name || 'garment'}</span>{' '}
              (Size {pendingAction.selectedSize || 'L'}) to your bag.
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            ADMIN PORTAL
        ════════════════════════════════════════════════════════════════ */}
        {roleTab === 'admin' && (
          <>
            {/* Dummy credentials hint */}
            <div className={styles.adminHintBox}>
              <div className={styles.adminHintTitle}>
                <Shield size={12} />
                DEMO ADMIN CREDENTIALS
              </div>
              <div className={styles.adminHintRow}>
                <span className={styles.adminHintLabel}>Email</span>
                <span className={styles.adminHintValue}>admin@demonstore.luxury</span>
              </div>
              <div className={styles.adminHintRow}>
                <span className={styles.adminHintLabel}>Password</span>
                <span className={styles.adminHintValue}>admin123</span>
              </div>
              <button
                type="button"
                className={styles.adminHintFill}
                onClick={fillAdminCredentials}
              >
                ↗ USE THESE CREDENTIALS
              </button>
            </div>

            {error && (
              <div className={styles.errorBanner}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleAdminSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="admin-email">
                  ADMINISTRATOR EMAIL
                </label>
                <div className={styles.inputWrapper}>
                  <Mail size={15} className={styles.inputIcon} />
                  <input
                    id="admin-email"
                    type="email"
                    placeholder="admin@demonstore.luxury"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="admin-password">
                  CITADEL PASSWORD
                </label>
                <div className={styles.inputWrapper}>
                  <Lock size={15} className={styles.inputIcon} />
                  <input
                    id="admin-password"
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.input}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className={`${styles.submitBtn} ${styles.submitBtnAdmin}`}>
                <span>{isSubmitting ? 'VERIFYING CLEARANCE...' : 'ACCESS CITADEL →'}</span>
                <Shield size={14} />
              </button>
            </form>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            CUSTOMER PORTAL
        ════════════════════════════════════════════════════════════════ */}
        {roleTab === 'customer' && (
          <>
            {/* Sign In / Register tabs */}
            <div className={styles.tabs}>
              <button
                type="button"
                className={`${styles.tabBtn} ${mode === 'login' ? styles.tabBtnActive : ''}`}
                onClick={() => { setMode('login'); setError(null); }}
              >
                SIGN IN
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${mode === 'signup' ? styles.tabBtnActive : ''}`}
                onClick={() => { setMode('signup'); setError(null); }}
              >
                REGISTER
              </button>
            </div>

            {error && (
              <div className={styles.errorBanner}>
                <AlertCircle size={15} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCustomerSubmit} className={styles.form}>
              {mode === 'signup' && (
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="modal-name">
                    SLAYER / DISCIPLE NAME
                  </label>
                  <div className={styles.inputWrapper}>
                    <User size={15} className={styles.inputIcon} />
                    <input
                      id="modal-name"
                      type="text"
                      placeholder="e.g. Tanjiro Kamado"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className={styles.input}
                      required
                    />
                  </div>
                </div>
              )}

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="modal-email">
                  ACCOUNT EMAIL
                </label>
                <div className={styles.inputWrapper}>
                  <Mail size={15} className={styles.inputIcon} />
                  <input
                    id="modal-email"
                    type="email"
                    placeholder="slayer@demonstore.luxury"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={styles.input}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label} htmlFor="modal-password">
                  PASSWORD
                </label>
                <div className={styles.inputWrapper}>
                  <Lock size={15} className={styles.inputIcon} />
                  <input
                    id="modal-password"
                    type="password"
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={styles.input}
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="modal-confirm-password">
                    CONFIRM PASSWORD
                  </label>
                  <div className={styles.inputWrapper}>
                    <Lock size={15} className={styles.inputIcon} />
                    <input
                      id="modal-confirm-password"
                      type="password"
                      placeholder="••••••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={styles.input}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              )}

              <button type="submit" disabled={isSubmitting} className={styles.submitBtn}>
                <span>
                  {isSubmitting
                    ? 'AUTHENTICATING...'
                    : mode === 'login'
                    ? 'ENTER CASTLE'
                    : 'CREATE DISCIPLE ACCOUNT'}
                </span>
                <ArrowRight size={14} />
              </button>
            </form>

            <div className={styles.footerHint}>
              {mode === 'login' ? (
                <p>
                  First time entering the Citadel?{' '}
                  <span onClick={() => setMode('signup')}>Create an account</span>
                </p>
              ) : (
                <p>
                  Already registered as a disciple?{' '}
                  <span onClick={() => setMode('login')}>Sign in here</span>
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
