'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraRig } from '@/three/CameraRig';
import { ScenePlates } from '@/three/ScenePlates';
import { TransitionFog } from '@/three/TransitionFog';
import styles from './CastleWorld.module.css';

interface CastleWorldProps {
  scrollProgress: number;
}

export function CastleWorld({ scrollProgress }: CastleWorldProps) {
  const [mounted, setMounted] = useState(false);
  const [isCanvasActive, setIsCanvasActive] = useState(false);

  useEffect(() => {
    // Stage WebGL initialization after critical first paint
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      const handle = (window as any).requestIdleCallback(() => setMounted(true), { timeout: 250 });
      return () => (window as any).cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(() => setMounted(true), 120);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCreated = () => {
    // WebGL context ready & active
    setIsCanvasActive(true);
  };

  return (
    <div className={styles.canvasContainer}>
      <div className={styles.subtleGrain} />

      {/* Instant visual plate during first paint and prior to 3D initialization */}
      <div
        className={`${styles.heroStaticBackdrop} ${
          isCanvasActive ? styles.heroStaticBackdropHidden : ''
        }`}
        style={{
          display: scrollProgress > 0.20 ? 'none' : 'block',
        }}
      />

      {mounted && (
        <Canvas
          camera={{ position: [0, 0, 0], fov: 50, near: 0.1, far: 500 }}
          dpr={[1, 1.75]}
          gl={{
            antialias: true,
            powerPreference: 'high-performance',
            alpha: false,
          }}
          onCreated={handleCreated}
        >
          <color attach="background" args={['#050507']} />

          <Suspense fallback={null}>
            <CameraRig scrollProgress={scrollProgress} />
            <ScenePlates scrollProgress={scrollProgress} />
            <TransitionFog scrollProgress={scrollProgress} />
          </Suspense>
        </Canvas>
      )}
    </div>
  );
}
