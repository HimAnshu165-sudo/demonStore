'use client';

import React, { useState, useEffect } from 'react';
import { useScrollProgress } from '@/hooks/useScrollProgress';
import { CastleWorld } from '@/components/CastleWorld/CastleWorld';
import { EditorialTypography } from '@/components/EditorialTypography/EditorialTypography';
import { FinalCinematicSequence } from '@/components/FinalCinematicSequence/FinalCinematicSequence';
import { ThunderCollectionLanding } from '@/components/ThunderCollectionLanding/ThunderCollectionLanding';

export default function HomePage() {
  const { lerpedProgress } = useScrollProgress();
  const [hasTriggeredCinema, setHasTriggeredCinema] = useState(false);
  const [isPlayingCinema, setIsPlayingCinema] = useState(false);
  const [showEcommerce, setShowEcommerce] = useState(false);

  // Trigger Zenitsu Final Form 10s sequence when scroll reaches Demon Chamber (0.97+)
  useEffect(() => {
    if (lerpedProgress >= 0.97 && !hasTriggeredCinema) {
      setHasTriggeredCinema(true);
      setIsPlayingCinema(true);
    }
  }, [lerpedProgress, hasTriggeredCinema]);

  const handleCinemaComplete = () => {
    setIsPlayingCinema(false);
    setShowEcommerce(true);
    // Smoothly scroll down to the collection
    setTimeout(() => {
      const el = document.getElementById('collection-landing');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const handleExploreCollection = () => {
    setHasTriggeredCinema(true);
    setIsPlayingCinema(true);
  };

  return (
    <main style={{ position: 'relative', minHeight: '600vh', background: '#050507' }}>
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
        <div style={{ position: 'relative', zIndex: 50, marginTop: '550vh' }}>
          <ThunderCollectionLanding />
        </div>
      )}
    </main>
  );
}
