'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#8a8594', fontFamily: 'Cinzel, serif' }}>
      REDIRECTING TO CITADEL DASHBOARD...
    </div>
  );
}
