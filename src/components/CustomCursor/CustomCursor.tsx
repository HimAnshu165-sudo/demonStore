'use client';

import React, { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import styles from './CustomCursor.module.css';

export function CustomCursor() {
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (pathname?.startsWith('/admin')) return;
    // Only enable on desktop/fine-pointer devices
    if (typeof window === 'undefined' || window.matchMedia('(pointer: coarse)').matches) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let rafId: number | null = null;
    let isVisible = false;
    let isLooping = false;

    const render = () => {
      // Smooth lerp for outer ring
      const dx = mouseX - ringX;
      const dy = mouseY - ringY;

      ringX += dx * 0.15;
      ringY += dy * 0.15;

      if (ringRef.current) {
        ringRef.current.style.left = `${ringX}px`;
        ringRef.current.style.top = `${ringY}px`;
      }

      // If outer ring has caught up to the pointer within sub-pixel threshold, stop the loop to save CPU
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        rafId = requestAnimationFrame(render);
      } else {
        isLooping = false;
        rafId = null;
      }
    };

    const startLoop = () => {
      if (!isLooping && isVisible) {
        isLooping = true;
        rafId = requestAnimationFrame(render);
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible && containerRef.current) {
        isVisible = true;
        containerRef.current.style.opacity = '1';
        ringX = mouseX;
        ringY = mouseY;
        if (ringRef.current) {
          ringRef.current.style.left = `${ringX}px`;
          ringRef.current.style.top = `${ringY}px`;
        }
      }

      if (dotRef.current) {
        dotRef.current.style.left = `${mouseX}px`;
        dotRef.current.style.top = `${mouseY}px`;
      }

      startLoop();
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target || !containerRef.current) return;

      const isInteractive =
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.closest('button') ||
        target.closest('a') ||
        target.getAttribute('role') === 'button';

      if (isInteractive) {
        containerRef.current.classList.add(styles.cursorHover);
      } else {
        containerRef.current.classList.remove(styles.cursorHover);
      }
    };

    const handleMouseLeave = () => {
      if (containerRef.current) {
        isVisible = false;
        containerRef.current.style.opacity = '0';
      }
      if (rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
        isLooping = false;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && rafId) {
        cancelAnimationFrame(rafId);
        rafId = null;
        isLooping = false;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [pathname]);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <div ref={containerRef} style={{ opacity: 0, transition: 'opacity 0.3s ease' }}>
      <div ref={dotRef} className={styles.cursorDot} />
      <div ref={ringRef} className={styles.cursorRing} />
    </div>
  );
}
