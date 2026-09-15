'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { EditorialTypography } from '@/components/EditorialTypography/EditorialTypography';
import { CASTLE_FRAME_COUNT } from '@/three/config';

// Dynamic import with ssr: false eliminates 50,000 lines of Three.js from initial server SSR evaluation
const CastleWorld = dynamic(
  () => import('@/components/CastleWorld/CastleWorld').then((m) => m.CastleWorld),
  { ssr: false }
);

// Code-split below-the-fold components to accelerate initial compilation and page load
const FinalCinematicSequence = dynamic(
  () =>
    import('@/components/FinalCinematicSequence/FinalCinematicSequence').then(
      (m) => m.FinalCinematicSequence
    ),
  { ssr: false }
);

const ThunderCollectionLanding = dynamic(
  () =>
    import('@/components/ThunderCollectionLanding/ThunderCollectionLanding').then(
      (m) => m.ThunderCollectionLanding
    ),
  { ssr: false }
);

export default function HomePage() {
  const { lerpedProgress } = useScrollProgress();
  const [hasTriggeredCinema, setHasTriggeredCinema] = useState(false);
  const [isPlayingCinema, setIsPlayingCinema] = useState(false);
  const [showEcommerce, setShowEcommerce] = useState(false);

  // Trigger Zenitsu Final Form 10s sequence when scroll reaches Demon Chamber (0.96+)
  useEffect(() => {
    if (lerpedProgress >= 0.96 && !hasTriggeredCinema && !isPlayingCinema) {
      setHasTriggeredCinema(true);
      setIsPlayingCinema(true);
    }
  }, [lerpedProgress, hasTriggeredCinema, isPlayingCinema]);

  // Predictive preloading: buffer Zenitsu cinematic frames when approaching Demon Chamber (>= 0.70)
  useEffect(() => {
    if (lerpedProgress >= 0.70 && typeof window !== 'undefined') {
      const frames = [
        '/assets/cinematic/01-zenitsu-step-in.webp',
        '/assets/cinematic/02-zenitsu-eyes-open.webp',
        '/assets/cinematic/03-zenitsu-thunder-stance.webp',
        '/assets/cinematic/04-zenitsu-final-strike.webp',
      ];
      frames.forEach((src) => {
        const img = new window.Image();
        img.src = src;
      });
    }
  }, [lerpedProgress]);

  const handleCinemaComplete = () => {
    setIsPlayingCinema(false);
    setShowEcommerce(true);
    // Smoothly scroll down to the collection landing
    setTimeout(() => {
      const el = document.getElementById('collection-landing');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 150);
  };

  const handleExploreCollection = () => {
    setHasTriggeredCinema(true);
    setIsPlayingCinema(true);
  };

  return (
    <main style={{ position: 'relative', minHeight: `${CASTLE_FRAME_COUNT * 100}vh`, background: '#050507' }}>
      {/* Instant Critical Hero Plate Backdrop (Immediate First Paint prior to JS evaluation) */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: "url('/assets/castle/01-entrance.webp')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Fixed Full-Viewport WebGL Castle World with Procedural Fog Transitions */}
      <CastleWorld scrollProgress={lerpedProgress} />

      {/* Editorial Content Layer with 3-Depth Scroll Parallax */}
      <EditorialTypography
        scrollProgress={lerpedProgress}
        onExploreClick={handleExploreCollection}
      />

      {/* Final 10-Second Zenitsu Final Form Cinematic Sequence */}
      {isPlayingCinema && (
        <FinalCinematicSequence
          onComplete={handleCinemaComplete}
        />
      )}

      {/* Smooth Ecommerce Collection Transition */}
      {showEcommerce && (
        <div style={{ position: 'relative', zIndex: 50, marginTop: `${(CASTLE_FRAME_COUNT - 1) * 100 + 50}vh` }}>
          <ThunderCollectionLanding />
        </div>
      )}
    </main>
  );
}
