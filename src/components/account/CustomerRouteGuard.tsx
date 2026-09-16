'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface CustomerRouteGuardProps {
  children: React.ReactNode;
}

export function CustomerRouteGuard({ children }: CustomerRouteGuardProps) {
  const { isAuthenticated, isAdmin, isCustomer, isLoading, openAuthModal } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!isAuthenticated) {
      // Guest: send to homepage and open login modal
      router.replace('/');
      openAuthModal('login');
      return;
    }

    if (isAdmin) {
      // Admin has their own portal
      router.replace('/admin/dashboard');
      return;
    }
  }, [isLoading, isAuthenticated, isAdmin, isCustomer, router, openAuthModal]);

  // Show nothing while auth is resolving
  if (isLoading) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#8a8594',
        fontFamily: 'var(--font-display)',
        letterSpacing: '0.14em',
        fontSize: '0.8rem',
      }}>
        INITIALIZING CITADEL ACCESS...
      </div>
    );
  }

  if (!isAuthenticated || isAdmin) {
    return null;
  }

  return <>{children}</>;
}
