'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import styles from './AdminRouteGuard.module.css';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export function AdminRouteGuard({ children }: AdminRouteGuardProps) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Redirect unauthenticated visitor to /login with redirect query param
      router.push(`/login?redirect=${encodeURIComponent(pathname || '/admin/dashboard')}`);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  // Loading indicator
  if (isLoading) {
    return (
      <div className={styles.guardLoadingContainer}>
        <div className={styles.loaderSpinner} />
        <div className={styles.loaderKanji}>無限城</div>
        <p className={styles.loaderText}>AUTHENTICATING CITADEL ACCESS...</p>
      </div>
    );
  }

  // Not logged in -> return null while router navigates to /login
  if (!isAuthenticated) {
    return null;
  }

  // Logged in but not an admin -> 403 Forbidden Screen
  if (!isAdmin) {
    return (
      <div className={styles.forbiddenContainer}>
        <div className={styles.forbiddenCard}>
          <div className={styles.forbiddenIconWrapper}>
            <ShieldAlert size={36} />
          </div>
          <div className={styles.forbiddenKanji}>禁断</div>
          <h1 className={styles.forbiddenTitle}>ADMIN PRIVILEGES REQUIRED</h1>
          <p className={styles.forbiddenDescription}>
            Your current account credentials lack administrative authority over the Infinity Castle
            control center. Access to citadel telemetry, inventory, and disciple registries is restricted to supreme administrators.
          </p>

          <div className={styles.forbiddenActions}>
            <Link
              href={`/login?redirect=${encodeURIComponent(pathname || '/admin/dashboard')}`}
              className={styles.adminElevateBtn}
            >
              <KeyRound size={16} />
              <span>AUTHENTICATE AS ADMINISTRATOR</span>
            </Link>

            <Link href="/" className={styles.returnStoreBtn}>
              <ArrowLeft size={16} />
              <span>RETURN TO CUSTOMER STOREFRONT</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Authenticated & Admin -> render protected children
  return <>{children}</>;
}
