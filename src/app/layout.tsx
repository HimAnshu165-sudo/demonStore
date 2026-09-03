import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { Navigation } from '@/components/Navigation/Navigation';
import { CartDrawer } from '@/components/CartDrawer/CartDrawer';
import { AuthModal } from '@/components/AuthModal/AuthModal';
import { CustomCursor } from '@/components/CustomCursor/CustomCursor';

export const metadata: Metadata = {
  metadataBase: new URL('https://infinitycastle.streetwear'),
  title: 'INFINITY CASTLE // 無限城 — Cinematic Streetwear Universe',
  description: 'An immersive cinematic streetwear experience inspired by the impossible Japanese gothic architecture of the Infinity Castle. 420–600 GSM heavyweight garments engineered for the night world.',
  keywords: ['Streetwear', 'Infinity Castle', 'Anime Streetwear', 'Japanese Gothic Fashion', 'Heavyweight Hoodie', 'Drop 001'],
  openGraph: {
    title: 'INFINITY CASTLE // 無限城',
    description: 'Immersive Japanese Gothic Streetwear Universe',
    images: ['/assets/castle/01-entrance.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <CartProvider>
            <CustomCursor />
            <Navigation />
            {children}
            <CartDrawer />
            <AuthModal />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
