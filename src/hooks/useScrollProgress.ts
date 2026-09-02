'use client';

import { useState, useEffect, useRef } from 'react';

export function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  const targetProgress = useRef(0);
  const currentProgress = useRef(0);
  const rafId = useRef<number | null>(null);
  const isLoopRunning = useRef(false);

  useEffect(() => {
    const startLoop = () => {
      if (isLoopRunning.current) return;
      isLoopRunning.current = true;

      const loop = () => {
        const diff = targetProgress.current - currentProgress.current;
        currentProgress.current += diff * 0.18;

        if (Math.abs(diff) > 0.0001) {
          setProgress(currentProgress.current);
          rafId.current = requestAnimationFrame(loop);
        } else {
          currentProgress.current = targetProgress.current;
          setProgress(targetProgress.current);
          isLoopRunning.current = false;
          rafId.current = null;
        }
      };

      rafId.current = requestAnimationFrame(loop);
    };

    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      // Fixed 5 viewports of scroll = 600vh total castle height - 100vh viewport
      const castleTrackHeight = Math.max(window.innerHeight * 5, 1);
      targetProgress.current = Math.min(Math.max(scrollY / castleTrackHeight, 0), 1);
      startLoop();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId.current) {
        cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      isLoopRunning.current = false;
    };
  }, []);

  return {
    rawProgress: targetProgress.current,
    lerpedProgress: progress,
  };
}
