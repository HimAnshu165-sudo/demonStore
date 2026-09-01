'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './FinalCinematicSequence.module.css';

interface FinalCinematicSequenceProps {
  onComplete: () => void;
}

export function FinalCinematicSequence({ onComplete }: FinalCinematicSequenceProps) {
  const [elapsedTime, setElapsedTime] = useState(0); // 0 to 11.5 seconds
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Synthesize procedural cinematic sound effects
  const playThunderSound = (type: 'spark' | 'charge' | 'strike' | 'whiteout') => {
    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContextClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (type === 'spark') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440 + Math.random() * 600, ctx.currentTime);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'charge') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(60, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 1.8);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 1.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.8);
      } else if (type === 'strike') {
        // Massive Thunder Crack & Sub-bass
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.8);
        gain.gain.setValueAtTime(0.4, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);

        // White Noise burst
        const bufferSize = ctx.sampleRate * 0.5;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.2, ctx.currentTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        whiteNoise.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        whiteNoise.start();
        whiteNoise.stop(ctx.currentTime + 0.5);
      } else if (type === 'whiteout') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(80, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(20, ctx.currentTime + 1.5);
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 1.5);
      }
    } catch {
      // Audio context error handling
    }
  };

  useEffect(() => {
    // Lock scroll during cinematic sequence
    document.body.style.overflow = 'hidden';

    const startTime = performance.now();
    let animFrame: number;

    const tick = (now: number) => {
      const elapsedSec = (now - startTime) / 1000;
      setElapsedTime(elapsedSec);

      if (elapsedSec < 11.5) {
        animFrame = requestAnimationFrame(tick);
      } else {
        onComplete();
      }
    };

    animFrame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animFrame);
      document.body.style.overflow = '';
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, [onComplete]);

  // Trigger sound hits according to timeline
  useEffect(() => {
    if (elapsedTime >= 2.0 && elapsedTime < 2.1) {
      playThunderSound('spark');
    } else if (elapsedTime >= 3.0 && elapsedTime < 3.1) {
      playThunderSound('charge');
    } else if (elapsedTime >= 5.0 && elapsedTime < 5.1) {
      playThunderSound('strike');
    } else if (elapsedTime >= 7.0 && elapsedTime < 7.1) {
      playThunderSound('strike');
    } else if (elapsedTime >= 8.5 && elapsedTime < 8.6) {
      playThunderSound('strike');
    } else if (elapsedTime >= 9.3 && elapsedTime < 9.4) {
      playThunderSound('whiteout');
    }
  }, [elapsedTime]);

  // Visual frames based on 10s breakdown
  const isFrame1 = elapsedTime < 1.0;
  const isFrame2 = elapsedTime >= 1.0 && elapsedTime < 2.0;
  const isFrame3 = elapsedTime >= 2.0 && elapsedTime < 3.0;
  const isFrame4 = elapsedTime >= 3.0 && elapsedTime < 5.0;
  const isFrame5 = elapsedTime >= 5.0 && elapsedTime < 7.0;
  const isFrame6 = elapsedTime >= 7.0 && elapsedTime < 8.3;
  const isFrame7 = elapsedTime >= 8.3 && elapsedTime < 9.3;
  const isWhiteOut = elapsedTime >= 9.3 && elapsedTime < 10.0;
  const isTitleReveal = elapsedTime >= 10.0;

  const isLightningActive = elapsedTime >= 2.0 && elapsedTime < 9.3;
  const isShaking = elapsedTime >= 5.0 && elapsedTime < 9.3;
  const isSpeedLines = elapsedTime >= 3.0 && elapsedTime < 9.3;

  return (
    <div className={`${styles.cinematicWrapper} ${isShaking ? styles.screenShake : ''}`}>
      {/* Frame 1: Chamber Settles */}
      <div
        className={`${styles.sceneLayer} ${isFrame1 ? styles.sceneActive : ''}`}
        style={{ backgroundImage: "url('/assets/castle/06-demon-chamber.png')" }}
      />

      {/* Frame 2: Zenitsu Appears */}
      <div
        className={`${styles.sceneLayer} ${isFrame2 ? styles.sceneActive : ''}`}
        style={{ backgroundImage: "url('/assets/cinematic/01-zenitsu-step-in.jpg')" }}
      />

      {/* Frame 3: Eyes Open */}
      <div
        className={`${styles.sceneLayer} ${isFrame3 ? styles.sceneActive : ''}`}
        style={{ backgroundImage: "url('/assets/cinematic/02-zenitsu-eyes-open.jpg')" }}
      />

      {/* Frame 4 & 5: Thunder Breathing & Final Form */}
      <div
        className={`${styles.sceneLayer} ${isFrame4 || isFrame5 ? styles.sceneActive : ''}`}
        style={{ backgroundImage: "url('/assets/cinematic/03-zenitsu-thunder-stance.jpg')" }}
      />

      {/* Frame 6 & 7: Godlike Speed & Final Strike */}
      <div
        className={`${styles.sceneLayer} ${isFrame6 || isFrame7 ? styles.sceneActive : ''}`}
        style={{ backgroundImage: "url('/assets/cinematic/04-zenitsu-final-strike.jpg')" }}
      />

      {/* Speed Lines */}
      {isSpeedLines && <div className={styles.speedLines} />}

      {/* Lightning Flash Overlay */}
      {isLightningActive && (
        <div className={`${styles.lightningOverlay} ${isFrame5 || isFrame7 ? styles.lightningFlash : ''}`} />
      )}

      {/* White Out Flash at 9.30s - 10.00s */}
      <div className={`${styles.whiteOut} ${isWhiteOut ? styles.whiteOutActive : ''}`} />

      {/* Kanji Title Reveal at 10.00s */}
      <div className={`${styles.titleRevealLayer} ${isTitleReveal ? styles.titleRevealActive : ''}`}>
        <div className={styles.kanjiGold}>雷</div>
        <div className={styles.titleText}>THUNDER AWAKENS</div>
        <div className={styles.subtitleText}>ZENITSU FINAL FORM // INFINITY CASTLE</div>
      </div>
    </div>
  );
}
