'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { SCENE_PLATES_DATA, ScenePlateAnchor } from './config';

interface ScenePlatesProps {
  scrollProgress: number;
}

interface SinglePlateMeshProps {
  plate: ScenePlateAnchor;
  scrollProgress: number;
}

function SinglePlateMesh({ plate, scrollProgress }: SinglePlateMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useTexture(plate.texturePath);

  useMemo(() => {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = true;
    texture.needsUpdate = true;
  }, [texture]);

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
      meshRef.current.visible = opacity > 0.005;
    }
  });

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
  return (
    <group>
      {SCENE_PLATES_DATA.map((p) => (
        <SinglePlateMesh
          key={p.id}
          plate={p}
          scrollProgress={scrollProgress}
        />
      ))}
    </group>
  );
}
