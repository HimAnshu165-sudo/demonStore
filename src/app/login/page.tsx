'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Shield, ArrowLeft, ArrowRight, AlertCircle, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './Login.module.css';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin/dashboard';
  const { loginAdmin, isAuthenticated, isAdmin, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // If already logged in as admin, redirect immediately to dashboard
  React.useEffect(() => {
    if (isAuthenticated && isAdmin) {
      router.push(redirectPath);
    }
  }, [isAuthenticated, isAdmin, router, redirectPath]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Please enter your administrator identity email.');
      return;
    }

    setIsSubmitting(true);
    const res = await loginAdmin(cleanEmail, password);
    setIsSubmitting(false);

    if (res.success) {
      router.push(redirectPath);
    } else {
      setError(res.error || 'Authentication rejected. Verify credentials.');
    }
  };

  const handleAdminCredentialFill = () => {
    setEmail('admin@demonstore.luxury');
    setPassword('admin123');
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.ambientNoise} />

      <div className={styles.loginCard}>
        <div className={styles.brandBadge}>
          <span className={styles.beaconDot} />
          <span>INFINITY CITADEL // ACCESS PORTAL</span>
        </div>

        <h1 className={styles.headerTitle}>
          DEMONSTORE
          <span className={styles.kanjiSub}>無限城</span>
        </h1>
        <p className={styles.headerSubtitle}>
          Administrative command center. Enter supreme authority credentials to command inventory, dispatch orders, and monitor citadel telemetry.
        </p>

        {isAuthenticated && !isAdmin && (
          <div className={styles.errorBanner} style={{ borderColor: '#e71d36', background: 'rgba(231, 29, 54, 0.12)' }}>
            <AlertCircle size={16} />
            <span>
              Signed in as Disciple: <strong>{user?.name}</strong>. Administrator credentials are required to enter the Citadel Command Center.
            </span>
          </div>
        )}

        {/* Official Admin Quick Credential Helper for Evaluation */}
        <div className={styles.quickAdminBanner}>
          <div className={styles.quickAdminTitle}>⚡ CITADEL ADMINISTRATOR IDENTITY</div>
          <div className={styles.quickAdminDesc}>
            Authorized Admin: <strong>admin@demonstore.luxury</strong> (Lord Muzan clearance)
          </div>
          <button
            type="button"
            onClick={handleAdminCredentialFill}
            className={styles.quickAdminBtn}
          >
            <KeyRound size={14} />
            <span>LOAD ADMIN CREDENTIALS</span>
          </button>
        </div>

        <div className={styles.divider}>
          <span>AUTHENTICATE WITH CITADEL CIPHER</span>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="email-input">
              ADMINISTRATIVE EMAIL
            </label>
            <div className={styles.inputWrapper}>
              <Mail size={16} className={styles.inputIcon} />
              <input
                id="email-input"
                type="email"
                placeholder="admin@demonstore.luxury"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="password-input">
              SECURITY CIPHER / PASSWORD
            </label>
            <div className={styles.inputWrapper}>
              <Lock size={16} className={styles.inputIcon} />
              <input
                id="password-input"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={styles.submitBtn}
          >
            <span>{isSubmitting ? 'VERIFYING CLEARANCE...' : 'ACCESS CONTROL CENTER'}</span>
            <ArrowRight size={14} />
          </button>
        </form>

        <div className={styles.footerActions}>
          <Link href="/" className={styles.backLink}>
            <ArrowLeft size={13} />
            <span>RETURN TO STORE</span>
          </Link>
          <span className={styles.rolesHint}>Role-guarded citadel environment</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div style={{ minHeight: '100vh', background: '#060508', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e71d36', fontFamily: 'Cinzel, serif', letterSpacing: '0.1em' }}>
          LOADING ACCESS PORTAL...
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}
