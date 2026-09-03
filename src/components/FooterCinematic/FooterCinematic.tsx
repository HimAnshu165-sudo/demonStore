'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowUp, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import styles from './FooterCinematic.module.css';

export function FooterCinematic() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // High-performance 60fps golden ember particles & lightning atmospheric background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle system
    const particleCount = 45;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 0.8,
      speedY: -(Math.random() * 0.6 + 0.2),
      speedX: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.7 + 0.2,
      pulse: Math.random() * Math.PI * 2,
    }));

    let isVisible = true;
    let lightningTimer = 0;
    let lightningFlash = 0;

    const render = () => {
      if (!isVisible) return;

      ctx.clearRect(0, 0, width, height);

      // Ambient subtle lightning glow
      lightningTimer++;
      if (lightningTimer % 240 === 0 && Math.random() > 0.4) {
        lightningFlash = 0.25;
      }
      if (lightningFlash > 0) {
        ctx.fillStyle = `rgba(255, 215, 0, ${lightningFlash})`;
        ctx.fillRect(0, 0, width, height);
        lightningFlash *= 0.85;
      }

      // Draw floating golden embers
      particles.forEach((p) => {
        p.y += p.speedY;
        p.x += p.speedX;
        p.pulse += 0.03;

        if (p.y < 0) {
          p.y = height;
          p.x = Math.random() * width;
        }

        const currentOpacity = Math.max(0.1, p.opacity + Math.sin(p.pulse) * 0.25);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 215, 0, ${currentOpacity})`;
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 8;
        ctx.fill();
      });

      animId = requestAnimationFrame(render);
    };

    // Pause rendering when footer is scrolled offscreen
    const observer = new IntersectionObserver(
      ([entry]) => {
        const nowVisible = entry.isIntersecting;
        if (nowVisible && !isVisible) {
          isVisible = true;
          animId = requestAnimationFrame(render);
        } else if (!nowVisible && isVisible) {
          isVisible = false;
          cancelAnimationFrame(animId);
        }
      },
      { threshold: 0.05 }
    );

    observer.observe(canvas);
    render();

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
    }
  };

  const handleAscend = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={styles.footerContainer} aria-label="Archive Footer">
      {/* 60fps Ambient Animated Particle Canvas */}
      <canvas ref={canvasRef} className={styles.canvasBackground} />
      <div className={styles.ambientVignette} />
      <div className={styles.kanjiWatermark}>無限城</div>

      <div className={styles.footerContent}>
        {/* Top Hero Cluster */}
        <div className={styles.footerHero}>
          <div className={styles.heroMeta}>
            <div className={styles.heroEyebrow}>
              <span className={styles.goldDot} />
              <span>THE NIGHT WORLD // ARCHIVE 2026</span>
            </div>
            <h2 className={styles.heroTitle}>
              INFINITY<br />CASTLE
            </h2>
            <p className={styles.heroSubtitle}>
              ARCHITECTURAL HEAVYWEIGHT STREETWEAR ENGINEERED FROM IMPOSSIBLE JAPANESE GOTHIC STRUCTURES. 420–600 GSM OBJECTS CRAFTED FOR THE PERPETUAL NIGHT.
            </p>
          </div>

          {/* Private Drop Access Form */}
          <div className={styles.accessBox}>
            <div className={styles.accessHeading}>
              <Zap size={16} style={{ display: 'inline', marginRight: '6px', color: '#ffd700' }} />
              PRIVATE DROP ACCESS
            </div>
            <p className={styles.accessDesc}>
              Enter your identity to receive exclusive allocation access for Drop 002: Upper Moons Sanctum.
            </p>

            {subscribed ? (
              <div className={styles.accessSuccess}>
                ✓ ACCESS GRANTED. YOU ARE RECORDED IN THE ARCHIVE.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className={styles.accessForm}>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="recipient@infinitycastle.jp"
                  className={styles.accessInput}
                />
                <button type="submit" className={styles.accessBtn}>
                  REQUEST
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Directory Columns */}
        <div className={styles.directoryGrid}>
          <div className={styles.dirCol}>
            <div className={styles.dirTitle}>01 // SANCTUM DIRECTORY</div>
            <ul className={styles.dirList}>
              <li><Link href="/" className={styles.dirLink}>THE CASTLE WORLD</Link></li>
              <li><Link href="/shop" className={styles.dirLink}>ALL COLLECTIONS (28 OBJECTS)</Link></li>
              <li><Link href="/lookbook" className={styles.dirLink}>SLAYER ARCHIVES LOOKBOOK</Link></li>
              <li><Link href="/world" className={styles.dirLink}>PHILOSOPHY & MANIFESTO</Link></li>
              <li><Link href="/admin" className={styles.dirLink}>CITADEL ADMIN // 無限城</Link></li>
            </ul>
          </div>

          <div className={styles.dirCol}>
            <div className={styles.dirTitle}>02 // CATEGORIES</div>
            <ul className={styles.dirList}>
              <li><Link href="/shop" className={styles.dirLink}>HEAVY HOODIES (520 GSM)</Link></li>
              <li><Link href="/shop" className={styles.dirLink}>STONE-WASHED TEES (420 GSM)</Link></li>
              <li><Link href="/shop" className={styles.dirLink}>CYBER & COMBAT SHOES</Link></li>
              <li><Link href="/shop" className={styles.dirLink}>MILITARY BOMBERS & JACKETS</Link></li>
              <li><Link href="/shop" className={styles.dirLink}>PROGENITOR TRENCH COATS</Link></li>
              <li><Link href="/shop" className={styles.dirLink}>TACTICAL HAKAMA CARGOS</Link></li>
            </ul>
          </div>

          <div className={styles.dirCol}>
            <div className={styles.dirTitle}>03 // CRAFT SPECIFICATIONS</div>
            <ul className={styles.dirList}>
              <li>100% FRENCH TERRY COTTON</li>
              <li>24K METALLIC EMBROIDERY</li>
              <li>BALLISTIC CORDURA NYLON</li>
              <li>CEDAR BOX AUTHENTICATION</li>
            </ul>
          </div>

          <div className={styles.dirCol}>
            <div className={styles.dirTitle}>04 // DISPATCH PROTOCOL</div>
            <ul className={styles.dirList}>
              <li>GLOBAL COMPLIMENTARY COURIER</li>
              <li>3–5 BUSINESS DAYS DELIVERY</li>
              <li>SERIALIZED ARCHIVE NUMBERS</li>
              <li>ENCRYPTED SSL ACQUISITION</li>
            </ul>
          </div>
        </div>

        {/* Bottom Row */}
        <div className={styles.bottomRow}>
          <div className={styles.copyright}>
            © 2026 INFINITY CASTLE // 無限城. ALL RIGHTS RESERVED. ARCHIVE DROP 001.
          </div>

          <button onClick={handleAscend} className={styles.ascendBtn} aria-label="Ascend to top of Castle">
            <span>ASCEND CASTLE</span>
            <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  );
}
