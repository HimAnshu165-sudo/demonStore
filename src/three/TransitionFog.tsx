'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

interface TransitionFogProps {
  scrollProgress: number;
}

// Procedural Fog Shader with drifting FBM noise, soft edges, and dynamic color
const FogShaderMaterial = {
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform float uOpacity;
    uniform vec3 uColor;
    uniform vec2 uFlowDir;
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    // Simplex Noise functions for organic drifting mist
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                          0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                         -0.577350269189626,  // -1.0 + 2.0 * C.x
                          0.024390243902439); // 1.0 / 41.0
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 ox = floor(x + 0.5);
      vec3 a0 = x - ox;
      m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      return 130.0 * dot(m, g);
    }

    float fbm(vec2 p) {
      float total = 0.0;
      float amplitude = 0.5;
      for (int i = 0; i < 4; i++) {
        total += snoise(p) * amplitude;
        p = p * 2.0 + vec2(12.5, 31.7);
        amplitude *= 0.5;
      }
      return total;
    }

    void main() {
      vec2 uv = vUv;
      
      // Drifting coordinates
      vec2 drift = uFlowDir * uTime * 0.04;
      float n1 = fbm(uv * 2.5 + drift);
      float n2 = fbm(uv * 4.0 - drift * 1.5 + vec2(n1 * 0.3));
      
      float fogDensity = smoothstep(-0.2, 0.8, n1 * 0.6 + n2 * 0.4);

      // Soft vignette falloff to prevent hard edges on planes
      float edgeX = smoothstep(0.0, 0.25, uv.x) * smoothstep(1.0, 0.75, uv.x);
      float edgeY = smoothstep(0.0, 0.25, uv.y) * smoothstep(1.0, 0.75, uv.y);
      float edgeMask = edgeX * edgeY;

      float alpha = fogDensity * edgeMask * uOpacity;

      gl_FragColor = vec4(uColor, alpha);
    }
  `,
};

// 3 Transition Fog Boundaries between the 4 Scene Plates (01 -> 02 -> 03 -> 06)
const TRANSITION_BOUNDARIES = [
  // 1: Entrance -> Main Hall (Peak scroll ~0.26, Z = -34)
  {
    index: 0,
    scrollCenter: 0.26,
    scrollSpan: 0.16,
    position: [0, -1, -34],
    rotation: [0, 0, 0],
    scale: [42, 24, 1],
    color: new THREE.Color('#0d0a11'),
    flow: [0.3, 0.1],
  },
  // 2: Main Hall -> Infinite Corridor (Peak scroll ~0.55, Z = -65)
  {
    index: 1,
    scrollCenter: 0.55,
    scrollSpan: 0.16,
    position: [-1, 1, -65],
    rotation: [0, 0.04, 0],
    scale: [44, 25, 1],
    color: new THREE.Color('#1a080d'), // subtle crimson tint
    flow: [-0.3, 0.15],
  },
  // 3: Infinite Corridor -> Demon Chamber (Peak scroll ~0.84, Z = -95)
  {
    index: 2,
    scrollCenter: 0.84,
    scrollSpan: 0.16,
    position: [0, 0, -95],
    rotation: [0, 0, 0],
    scale: [50, 28, 1],
    color: new THREE.Color('#2e040a'), // deep sanguine red mist
    flow: [0.0, 0.3],
  },
];

function SingleTransitionFogPlane({ data, scrollProgress }: { data: typeof TRANSITION_BOUNDARIES[0]; scrollProgress: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uOpacity: { value: 0 },
    uColor: { value: data.color },
    uFlowDir: { value: new THREE.Vector2(data.flow[0], data.flow[1]) },
  }), [data]);

  useFrame((state) => {
    if (!materialRef.current || !meshRef.current) return;

    materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();

    // Calculate transition opacity: bell curve around scrollCenter
    const dist = Math.abs(scrollProgress - data.scrollCenter);
    const halfSpan = data.scrollSpan * 0.5;

    let opacity = 0;
    if (dist < halfSpan) {
      const normalized = 1.0 - (dist / halfSpan);
      // Smooth bell curve with max opacity at 0.75 (never solid, keeps environment visible)
      opacity = Math.sin((normalized * Math.PI) / 2) * 0.75;
    }

    materialRef.current.uniforms.uOpacity.value = opacity;
    meshRef.current.visible = opacity > 0.01;
  });

  return (
    <mesh
      ref={meshRef}
      position={data.position as [number, number, number]}
      rotation={data.rotation as [number, number, number]}
      scale={data.scale as [number, number, number]}
    >
      <planeGeometry args={[1, 1 / 1.777, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={FogShaderMaterial.vertexShader}
        fragmentShader={FogShaderMaterial.fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

// Camera-attached floating ambient mist layer that adapts dynamically
function CameraAttachedFogLayer({ scrollProgress }: { scrollProgress: number }) {
  const { camera } = useThree();
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uOpacity: { value: 0 },
    uColor: { value: new THREE.Color('#0a080d') },
    uFlowDir: { value: new THREE.Vector2(0.2, 0.1) },
  }), []);

  useFrame((state) => {
    if (!materialRef.current || !meshRef.current) return;

    materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();

    // Position mist 6 units in front of camera
    meshRef.current.position.copy(camera.position);
    meshRef.current.quaternion.copy(camera.quaternion);
    meshRef.current.translateZ(-6);

    // Evolve fog color smoothly based on current environment
    const uCol = materialRef.current.uniforms.uColor.value as THREE.Color;
    if (scrollProgress < 0.30) {
      // Entrance & Main Hall: Dark charcoal
      uCol.lerp(new THREE.Color('#0a080d'), 0.08);
    } else if (scrollProgress < 0.72) {
      // Infinite Corridor: Dark crimson charcoal
      uCol.lerp(new THREE.Color('#14060a'), 0.08);
    } else {
      // Demon Chamber: Sanguine deep red
      uCol.lerp(new THREE.Color('#200308'), 0.08);
    }

    // Determine if we are currently in an active transition zone
    let inTransition = false;
    let transitionStrength = 0;
    for (const b of TRANSITION_BOUNDARIES) {
      const dist = Math.abs(scrollProgress - b.scrollCenter);
      if (dist < b.scrollSpan * 0.5) {
        const factor = 1.0 - (dist / (b.scrollSpan * 0.5));
        transitionStrength = Math.max(transitionStrength, factor);
        inTransition = true;
      }
    }

    // Gentle base ambient mist (0.12) + transition boost (up to 0.45 max, never solid)
    const targetOpacity = inTransition ? (0.12 + transitionStrength * 0.35) : 0.12;
    materialRef.current.uniforms.uOpacity.value = targetOpacity;
  });

  return (
    <mesh ref={meshRef} scale={[18, 10.125, 1]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={FogShaderMaterial.vertexShader}
        fragmentShader={FogShaderMaterial.fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </mesh>
  );
}

export function TransitionFog({ scrollProgress }: TransitionFogProps) {
  return (
    <group>
      {/* 3 Layered 3D Fog Transition Planes at Scene Boundaries */}
      {TRANSITION_BOUNDARIES.map((boundary) => (
        <SingleTransitionFogPlane
          key={boundary.index}
          data={boundary}
          scrollProgress={scrollProgress}
        />
      ))}

      {/* Floating Camera-Attached Subtle Depth Mist */}
      <CameraAttachedFogLayer scrollProgress={scrollProgress} />
    </group>
  );
}
