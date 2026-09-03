import type { Metadata } from 'next';
import { Cinzel, Space_Grotesk, Noto_Serif_JP } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { Navigation } from '@/components/Navigation/Navigation';
import { CartDrawer } from '@/components/CartDrawer/CartDrawer';
import { AuthModal } from '@/components/AuthModal/AuthModal';
import { CustomCursor } from '@/components/CustomCursor/CustomCursor';

const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '600', '800', '900'],
  variable: '--font-display-next',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans-next',
  display: 'swap',
});

const notoSerifJP = Noto_Serif_JP({
  subsets: ['latin'],
  weight: ['300', '400', '600', '900'],
  variable: '--font-kanji-next',
  display: 'swap',
});

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
    <html lang="en" className={`${cinzel.variable} ${spaceGrotesk.variable} ${notoSerifJP.variable}`}>
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
