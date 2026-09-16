'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { CustomCursor } from '@/components/CustomCursor/CustomCursor';
import { Navigation } from '@/components/Navigation/Navigation';

// Code-split interactive overlay dialogs so they don't load during initial page load
const CartDrawer = dynamic(
  () => import('@/components/CartDrawer/CartDrawer').then((m) => m.CartDrawer),
  { ssr: false }
);

const AuthModal = dynamic(
  () => import('@/components/AuthModal/AuthModal').then((m) => m.AuthModal),
  { ssr: false }
);

export function ClientOverlays({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CustomCursor />
      <Navigation />
      {children}
      <CartDrawer />
      <AuthModal />
    </>
  );
}
