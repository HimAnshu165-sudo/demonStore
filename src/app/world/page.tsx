'use client';

import React from 'react';
import Link from 'next/link';
import { FooterCinematic } from '@/components/FooterCinematic/FooterCinematic';
import styles from './World.module.css';

export default function WorldPage() {
  return (
    <main className={styles.worldContainer}>
      <div className={styles.bgKanji}>哲学</div>

      <header className={styles.worldHeader}>
        <div className={styles.headerMeta}>
          <span>ARCHIVE MANIFESTO // 2026</span>
          <span><b>THE WORLD</b> BEHIND THE BRAND</span>
        </div>
        <h1 className={styles.title}>
          THE PHILOSOPHY<br />OF THE NIGHT
        </h1>
        <p className={styles.subtitle}>
          ARCHITECTURAL STREETWEAR ENGINEERED FROM AN IMPOSSIBLE CASTLE
        </p>
      </header>

      <div className={styles.manifestoContent}>
        {/* Section 01: The Concept */}
        <section className={styles.manifestoSection}>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionNumber}>01</div>
            <div className={styles.sectionJapanese}>次元構造 // 建築</div>
            <h2 className={styles.sectionTitle}>DIMENSIONAL SILHOUETTES</h2>
          </div>
          <div className={styles.sectionBody}>
            <p className={styles.leadText}>
              We do not design garments for seasonal retail cycles. We engineer wearable architectural objects inspired by the shifting, infinite geometries of Japanese feudal fortresses.
            </p>
            <p className={styles.bodyText}>
              The Infinity Castle represents gravity-defying architecture where traditional tatami halls, floating staircases, and wooden corridors intersect across impossible spatial axes. Each garment reflects this dimensional complexity through multi-panel draping, wide kimono sleeves, and reinforced tactical construction.
            </p>
          </div>
        </section>

        {/* Section 02: Textile Engineering */}
        <section className={styles.manifestoSection}>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionNumber}>02</div>
            <div className={styles.sectionJapanese}>織物 // 420–600 GSM</div>
            <h2 className={styles.sectionTitle}>TEXTILE HEAVYWEIGHT</h2>
          </div>
          <div className={styles.sectionBody}>
            <p className={styles.leadText}>
              Every piece in Drop 001 is built from custom-milled loopback French terry, military flight nylon, and combed organic cotton ranging from 420 GSM to 600 GSM.
            </p>
            <p className={styles.bodyText}>
              The heavy drape creates a commanding presence on the body that maintains its architectural structure through movement, weather, and time. Pre-shrunk and stone-washed with vintage cold-dye baths for a soft, obsidian-matte handfeel.
            </p>

            <div className={styles.craftPillars}>
              <div className={styles.pillarItem}>
                <div className={styles.pillarTitle}>520 GSM TERRY</div>
                <div className={styles.pillarText}>Custom loopback fleece with reinforced double-stitched collar</div>
              </div>
              <div className={styles.pillarItem}>
                <div className={styles.pillarTitle}>24K METALLIC</div>
                <div className={styles.pillarText}>High-density 180,000-stitch Japanese embroidery</div>
              </div>
              <div className={styles.pillarItem}>
                <div className={styles.pillarTitle}>CEDAR BOX</div>
                <div className={styles.pillarText}>Serialized archive certificate in custom charred cedar</div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 03: Limited Drop Model */}
        <section className={styles.manifestoSection}>
          <div className={styles.sectionHeading}>
            <div className={styles.sectionNumber}>03</div>
            <div className={styles.sectionJapanese}>限定 // 壱之型</div>
            <h2 className={styles.sectionTitle}>SERIALIZED ARCHIVES</h2>
          </div>
          <div className={styles.sectionBody}>
            <p className={styles.leadText}>
              True luxury lies in scarcity and deliberate execution. Every drop is produced in strictly limited quantities and permanently retired once allocated.
            </p>
            <p className={styles.bodyText}>
              Each acquired piece comes sealed with a laser-engraved demon crest authentication card, establishing its place in the brand archive.
            </p>
          </div>
        </section>

        {/* Footer CTA */}
        <div className={styles.footerCtaBox}>
          <Link href="/shop" className={styles.ctaLink}>
            <span>ENTER THE COLLECTION</span>
            <span className={styles.ctaLine} />
            <span>→</span>
          </Link>
        </div>
      </div>

      <FooterCinematic />
    </main>
  );
}
