import React from 'react';
import { AdminRouteGuard } from '@/components/admin/AdminRouteGuard';
import { AdminLayout } from '@/components/admin/AdminLayout';

export const metadata = {
  title: 'CITADEL ADMIN // INFINITY CASTLE',
  description: 'Administrative command center for DemonStore Infinity Castle Streetwear',
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminRouteGuard>
      <AdminLayout>{children}</AdminLayout>
    </AdminRouteGuard>
  );
}
