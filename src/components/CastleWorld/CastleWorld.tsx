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

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={styles.canvasContainer}>
      <div className={styles.subtleGrain} />

      <Canvas
        camera={{ position: [0, 0, 0], fov: 50, near: 0.1, far: 500 }}
        dpr={[1, 2]}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
          alpha: false,
        }}
      >
        <color attach="background" args={['#050507']} />

        <Suspense fallback={null}>
          <CameraRig scrollProgress={scrollProgress} />
          <ScenePlates scrollProgress={scrollProgress} />
          <TransitionFog scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
    </div>
  );
}
