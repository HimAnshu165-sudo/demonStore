import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { ClientOverlays } from '@/components/ClientOverlays/ClientOverlays';

export const metadata: Metadata = {
  metadataBase: new URL('https://infinitycastle.streetwear'),
  title: 'INFINITY CASTLE // 無限城 — Cinematic Streetwear Universe',
  description: 'An immersive cinematic streetwear experience inspired by the impossible Japanese gothic architecture of the Infinity Castle. 420–600 GSM heavyweight garments engineered for the night world.',
  keywords: ['Streetwear', 'Infinity Castle', 'Anime Streetwear', 'Japanese Gothic Fashion', 'Heavyweight Hoodie', 'Drop 001'],
  openGraph: {
    title: 'INFINITY CASTLE // 無限城',
    description: 'Immersive Japanese Gothic Streetwear Universe',
    images: ['/assets/castle/01-entrance.webp'],
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
        {/* Priority 1 Hero Castle Plate Preload */}
        <link
          rel="preload"
          as="image"
          href="/assets/castle/01-entrance.webp"
          type="image/webp"
          // @ts-ignore Next.js React 19 supports fetchPriority
          fetchpriority="high"
        />

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
              <ClientOverlays>
                {children}
              </ClientOverlays>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
