import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
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
      <head>
        {/* Asynchronous, non-blocking Google Fonts with instant local fallback */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;800;900&family=Space+Grotesk:wght@300;400;500;600;700&family=Noto+Serif+JP:wght@300;400;600;900&display=swap"
        />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <CustomCursor />
              <Navigation />
              {children}
              <CartDrawer />
              <AuthModal />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
