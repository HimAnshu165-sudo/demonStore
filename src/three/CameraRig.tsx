'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { CAM_POS_SPLINE, CAM_LOOK_SPLINE } from './config';

interface CameraRigProps {
  scrollProgress: number; // 0.0 to 1.0
}

export function CameraRig({ scrollProgress }: CameraRigProps) {
  const { camera } = useThree();
  const targetPos = useRef<THREE.Vector3>(new THREE.Vector3());
  const targetLook = useRef<THREE.Vector3>(new THREE.Vector3());

  useFrame(() => {
    const t = Math.min(Math.max(scrollProgress, 0), 1);

    CAM_POS_SPLINE.getPoint(t, targetPos.current);
    CAM_LOOK_SPLINE.getPoint(t, targetLook.current);

    camera.position.copy(targetPos.current);
    camera.lookAt(targetLook.current);
  });

  return null;
}
