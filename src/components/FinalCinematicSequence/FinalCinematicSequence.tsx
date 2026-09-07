'use client';

import React, { useState, useEffect } from 'react';
import styles from './FinalCinematicSequence.module.css';

interface FinalCinematicSequenceProps {
  onComplete: () => void;
}

export function FinalCinematicSequence({ onComplete }: FinalCinematicSequenceProps) {
  const [elapsedTime, setElapsedTime] = useState(0); // 0 to 11.5 seconds

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
    };
  }, [onComplete]);

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
        style={{ backgroundImage: "url('/assets/castle/06-demon-chamber.webp')" }}
      />

      {/* Frame 2: Zenitsu Appears */}
      <div
        className={`${styles.sceneLayer} ${isFrame2 ? styles.sceneActive : ''}`}
        style={{ backgroundImage: "url('/assets/cinematic/01-zenitsu-step-in.webp')" }}
      />

      {/* Frame 3: Eyes Open */}
      <div
        className={`${styles.sceneLayer} ${isFrame3 ? styles.sceneActive : ''}`}
        style={{ backgroundImage: "url('/assets/cinematic/02-zenitsu-eyes-open.webp')" }}
      />

      {/* Frame 4 & 5: Thunder Breathing & Final Form */}
      <div
        className={`${styles.sceneLayer} ${isFrame4 || isFrame5 ? styles.sceneActive : ''}`}
        style={{ backgroundImage: "url('/assets/cinematic/03-zenitsu-thunder-stance.webp')" }}
      />

      {/* Frame 6 & 7: Godlike Speed & Final Strike */}
      <div
        className={`${styles.sceneLayer} ${isFrame6 || isFrame7 ? styles.sceneActive : ''}`}
        style={{ backgroundImage: "url('/assets/cinematic/04-zenitsu-final-strike.webp')" }}
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
