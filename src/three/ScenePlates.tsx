'use client';

import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { SCENE_PLATES_DATA, ScenePlateAnchor } from './config';

// Global texture cache to prevent duplicate requests across re-renders
const textureCache = new Map<string, THREE.Texture>();
let textureLoader: THREE.TextureLoader | null = null;

function getTextureLoader(): THREE.TextureLoader {
  if (!textureLoader) {
    textureLoader = new THREE.TextureLoader();
  }
  return textureLoader;
}

function loadPlateTexture(path: string): Promise<THREE.Texture> {
  if (textureCache.has(path)) {
    return Promise.resolve(textureCache.get(path)!);
  }
  return new Promise((resolve, reject) => {
    const loader = getTextureLoader();
    loader.load(
      path,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        tex.needsUpdate = true;
        textureCache.set(path, tex);
        resolve(tex);
      },
      undefined,
      (err) => {
        console.warn(`Failed to load plate texture ${path}:`, err);
        reject(err);
      }
    );
  });
}

interface ScenePlatesProps {
  scrollProgress: number;
}

interface SinglePlateMeshProps {
  plate: ScenePlateAnchor;
  scrollProgress: number;
  shouldLoad: boolean;
  onLoaded: () => void;
}

function SinglePlateMesh({ plate, scrollProgress, shouldLoad, onLoaded }: SinglePlateMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(() => textureCache.get(plate.texturePath) || null);

  useEffect(() => {
    if (!shouldLoad || texture) return;

    let isMounted = true;
    loadPlateTexture(plate.texturePath)
      .then((tex) => {
        if (isMounted) {
          setTexture(tex);
          onLoaded();
        }
      })
      .catch(() => {
        // Fallback or retry silently
      });

    return () => {
      isMounted = false;
    };
  }, [shouldLoad, plate.texturePath, texture, onLoaded]);

  useFrame(() => {
    if (!meshRef.current) return;

    const { scrollStart, scrollPeak, scrollEnd } = plate;
    let opacity = 0;

    // Entrance plate is fully visible from 0.0
    if (plate.id === 'entrance') {
      if (scrollProgress <= scrollPeak) {
        opacity = 1.0;
      } else if (scrollProgress <= scrollEnd) {
        const ratio = (scrollProgress - scrollPeak) / (scrollEnd - scrollPeak);
        opacity = 1.0 - ratio;
      }
    } else if (plate.id === 'demon-chamber') {
      // Final chamber stays visible until 1.0
      if (scrollProgress >= scrollPeak) {
        opacity = 1.0;
      } else if (scrollProgress >= scrollStart) {
        const ratio = (scrollProgress - scrollStart) / (scrollPeak - scrollStart);
        opacity = ratio;
      }
    } else {
      // Intermediate plates: smooth entry, hold, and smooth exit
      if (scrollProgress >= scrollStart && scrollProgress <= scrollEnd) {
        if (scrollProgress <= scrollPeak) {
          const ratio = (scrollProgress - scrollStart) / (scrollPeak - scrollStart);
          opacity = ratio;
        } else {
          const ratio = (scrollProgress - scrollPeak) / (scrollEnd - scrollPeak);
          opacity = 1.0 - ratio;
        }
      }
    }

    const material = meshRef.current.material as THREE.MeshBasicMaterial;
    if (material) {
      material.opacity = Math.max(0, Math.min(1, opacity));
      material.transparent = true;
      material.depthWrite = opacity > 0.4;
      meshRef.current.visible = Boolean(texture && opacity > 0.005);
    }
  });

  if (!texture) {
    return null;
  }

  return (
    <group position={plate.position} rotation={plate.rotation}>
      <mesh ref={meshRef} scale={plate.scale}>
        <planeGeometry args={[1, 1 / 1.777, 1, 1]} />
        <meshBasicMaterial
          map={texture}
          transparent
          toneMapped={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}

export function ScenePlates({ scrollProgress }: ScenePlatesProps) {
  // Track which plates are loaded to trigger sequential background buffering
  const [loadedIndices, setLoadedIndices] = useState<Set<number>>(() => new Set([0]));

  const handlePlateLoaded = (index: number) => {
    setLoadedIndices((prev) => {
      const next = new Set(prev);
      next.add(index);
      // Trigger the subsequent plate in the background
      if (index + 1 < SCENE_PLATES_DATA.length) {
        next.add(index + 1);
      }
      return next;
    });
  };

  return (
    <group>
      {SCENE_PLATES_DATA.map((p, idx) => {
        // Priority 1: Plate 00 (Entrance) loads immediately
        // Priority 2: Proximity loading - plate begins loading when scroll gets within 0.20 of its start
        // Priority 3: Sequential idle queue - previous plate loaded triggers next plate
        const isProximity = scrollProgress >= Math.max(0, p.scrollStart - 0.20);
        const isSequenced = loadedIndices.has(idx);
        const shouldLoad = idx === 0 || isProximity || isSequenced;

        return (
          <SinglePlateMesh
            key={p.id}
            plate={p}
            scrollProgress={scrollProgress}
            shouldLoad={shouldLoad}
            onLoaded={() => handlePlateLoaded(idx)}
          />
        );
      })}
    </group>
  );
}
