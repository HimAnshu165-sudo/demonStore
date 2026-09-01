'use client';

import React, { useRef, useEffect } from 'react';
import styles from './EditorialTypography.module.css';

interface EditorialTypographyProps {
  scrollProgress: number; // 0.0 to 1.0
  onExploreClick?: () => void;
}

interface ChapterDef {
  id: string;
  number: string;
  name: string;
  japanese: string;
  watermark: string;
  watermarkPos: string;
  mainTitle: string[];
  secondaryTitle: string;
  editorialBody: string;
  metadata: { label: string; value: string }[];
  ctaText?: string;
  scrollStart: number;
  scrollPeak: number;
  scrollEnd: number;
  stageClass: string;
}

const CHAPTERS_EDITORIAL: ChapterDef[] = [
  // 01: ENTRANCE (0.00 to 0.18)
  {
    id: 'entrance',
    number: '01',
    name: 'ENTRANCE',
    japanese: '無限城 // 門',
    watermark: '門',
    watermarkPos: styles.kanjiRight,
    mainTitle: ['INFINITY', 'CASTLE'],
    secondaryTitle: 'DEMONS // STREETWEAR — CHAPTER 01',
    editorialBody: 'A streetwear world built inside the night. Engineered with architectural precision.',
    metadata: [
      { label: 'EST.', value: '2026' },
      { label: 'ORIGIN', value: 'TOKYO / GRAND LINE' },
      { label: 'DROP', value: '001' },
      { label: 'FABRIC', value: '420 GSM HEAVYWEIGHT' },
    ],
    ctaText: 'DISCOVER THE WORLD',
    scrollStart: 0.00,
    scrollPeak: 0.04,
    scrollEnd: 0.18,
    stageClass: styles.stageEntrance,
  },
  // 02: MAIN CASTLE HALL (0.16 to 0.38)
  {
    id: 'main-hall',
    number: '02',
    name: 'THE CASTLE',
    japanese: '本殿 // 階層',
    watermark: '階',
    watermarkPos: styles.kanjiLeft,
    mainTitle: ['THE WORLD', 'BEHIND THE DROP.'],
    secondaryTitle: 'BUILT FOR THE ONES WHO WALK THROUGH THE NIGHT.',
    editorialBody: 'Dimensional folding architecture engineered into heavyweight textile silhouettes.',
    metadata: [
      { label: 'WORLD', value: '01' },
      { label: 'ARCHIVE', value: '2026' },
      { label: 'DROP', value: '001' },
    ],
    ctaText: 'EXPLORE SANCTUM',
    scrollStart: 0.16,
    scrollPeak: 0.26,
    scrollEnd: 0.38,
    stageClass: styles.stageMainHall,
  },
  // 03: INFINITE CORRIDOR (0.36 to 0.58)
  {
    id: 'infinite-corridor',
    number: '03',
    name: 'INFINITE CORRIDOR',
    japanese: '無限廊下 // 刻',
    watermark: '無限',
    watermarkPos: styles.kanjiCenter,
    mainTitle: ['THE NIGHT', "DOESN'T END."],
    secondaryTitle: 'PERSPECTIVE OF ETERNAL CORRIDORS',
    editorialBody: 'Endless wooden perspective extending into deep midnight shadows.',
    metadata: [
      { label: 'DEPTH', value: '-80.00M' },
      { label: 'SILHOUETTE', value: 'OVERSIZED BOXY' },
      { label: 'STITCH', value: 'REINFORCED TAPE' },
    ],
    ctaText: 'VIEW PASSAGE',
    scrollStart: 0.36,
    scrollPeak: 0.46,
    scrollEnd: 0.58,
    stageClass: styles.stageCorridor,
  },
  // 04: FLOATING STAIRCASE (0.56 to 0.76)
  {
    id: 'floating-staircase',
    number: '04',
    name: 'ASCEND',
    japanese: '浮遊階段 // 雫',
    watermark: '昇',
    watermarkPos: styles.kanjiRight,
    mainTitle: ['THE UPPER', 'MOON COLLECTION'],
    secondaryTitle: 'ZERO-GRAVITY ASCENSION',
    editorialBody: 'Structured hybrid construction combining traditional Japanese draped sleeves with modern flight outerwear.',
    metadata: [
      { label: 'FABRIC', value: '500 GSM FRENCH TERRY' },
      { label: 'CUT', value: 'OVERSIZED KIMONO' },
      { label: 'EDITION', value: 'LIMITED DROP' },
    ],
    ctaText: 'ASCEND COLLECTION',
    scrollStart: 0.56,
    scrollPeak: 0.66,
    scrollEnd: 0.76,
    stageClass: styles.stageStaircase,
  },
  // 05: VERTICAL VOID (0.74 to 0.90)
  {
    id: 'vertical-void',
    number: '05',
    name: 'THE VOID',
    japanese: '虚空 // 階梯',
    watermark: '虚',
    watermarkPos: styles.kanjiCenter,
    mainTitle: ['BETWEEN', 'WORLDS.'],
    secondaryTitle: 'ABYSSAL PERSPECTIVE',
    editorialBody: 'A quiet suspension over the infinite vertical chasm.',
    metadata: [
      { label: 'ELEVATION', value: '-145.00M' },
      { label: 'TONE', value: 'PITCH OBSIDIAN' },
    ],
    scrollStart: 0.74,
    scrollPeak: 0.82,
    scrollEnd: 0.90,
    stageClass: styles.stageVoid,
  },
  // 06: DEMON CHAMBER (0.88 to 1.00)
  {
    id: 'demon-chamber',
    number: '06',
    name: 'THE FINAL CHAMBER',
    japanese: '終焉 // 玉座',
    watermark: '雷',
    watermarkPos: styles.kanjiRight,
    mainTitle: ['THE FIRST DROP', 'AWAITS.'],
    secondaryTitle: 'UPPER MOONS // COLLECTION 001',
    editorialBody: 'LIMITED STREETWEAR 2026. The journey culminates in the inner sanctum.',
    metadata: [
      { label: 'COLLECTION', value: 'THUNDER & UPPER MOON' },
      { label: 'STATUS', value: 'LIVE NOW' },
    ],
    ctaText: 'ENTER THE DROP',
    scrollStart: 0.88,
    scrollPeak: 0.96,
    scrollEnd: 1.00,
    stageClass: styles.stageChamber,
  },
];

export function EditorialTypography({ scrollProgress, onExploreClick }: EditorialTypographyProps) {
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    // Parallax update on scrollProgress changes
    CHAPTERS_EDITORIAL.forEach((ch, idx) => {
      const el = stageRefs.current[idx];
      if (!el) return;

      const { scrollStart, scrollPeak, scrollEnd } = ch;
      let opacity = 0;
      let progressOffset = 0;

      if (scrollProgress >= scrollStart && scrollProgress <= scrollEnd) {
        if (scrollProgress <= scrollPeak) {
          const ratio = (scrollProgress - scrollStart) / Math.max(scrollPeak - scrollStart, 0.001);
          opacity = Math.sin((ratio * Math.PI) / 2);
          progressOffset = (1 - ratio) * 36; // Enter gently from bottom
        } else {
          const ratio = (scrollProgress - scrollPeak) / Math.max(scrollEnd - scrollPeak, 0.001);
          opacity = Math.cos((ratio * Math.PI) / 2);
          progressOffset = -ratio * 36; // Exit gently to top
        }
      }

      el.style.opacity = `${opacity}`;
      el.style.pointerEvents = opacity > 0.35 ? 'auto' : 'none';

      // 3 Parallax Layers
      const farLayer = el.querySelector(`.${styles.farLayer}`) as HTMLElement;
      const midLayer = el.querySelector(`.${styles.midLayer}`) as HTMLElement;
      const nearLayer = el.querySelector(`.${styles.nearLayer}`) as HTMLElement;

      if (farLayer) {
        farLayer.style.transform = `translate3d(0, ${progressOffset * 0.22}px, 0)`;
      }
      if (midLayer) {
        midLayer.style.transform = `translate3d(0, ${progressOffset * 0.60}px, 0)`;
      }
      if (nearLayer) {
        nearLayer.style.transform = `translate3d(0, ${progressOffset * 1.10}px, 0)`;
      }
    });
  }, [scrollProgress]);

  const handleCtaClick = (index: number) => {
    if (index === CHAPTERS_EDITORIAL.length - 1 && onExploreClick) {
      onExploreClick();
    } else {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const nextTarget = Math.min(scrollProgress + 0.18, 1.0) * maxScroll;
      window.scrollTo({ top: nextTarget, behavior: 'smooth' });
    }
  };

  return (
    <div className={styles.overlayContainer}>
      {CHAPTERS_EDITORIAL.map((chapter, idx) => (
        <div
          key={chapter.id}
          ref={(node) => { stageRefs.current[idx] = node; }}
          className={`${styles.chapterStage} ${chapter.stageClass}`}
        >
          {/* Depth 01: Far Japanese Watermark Typography */}
          <div className={`${styles.farLayer} ${chapter.watermarkPos}`}>
            <span className={styles.kanjiWatermark}>{chapter.watermark}</span>
          </div>

          {/* Depth 02: Primary Editorial Typography */}
          <div className={styles.midLayer}>
            <div className={styles.microHeader}>
              <span className={styles.chapterNumber}>{chapter.number}</span>
              <span className={styles.goldDot} />
              <span>{chapter.name}</span>
            </div>

            {chapter.japanese && (
              <div className={styles.heroJapanese}>{chapter.japanese}</div>
            )}

            <h2 className={styles.mainTitle}>
              {chapter.mainTitle.map((line, i) => (
                <span key={i} style={{ display: 'block' }}>{line}</span>
              ))}
            </h2>

            {chapter.secondaryTitle && (
              <div className={styles.secondaryTitle}>{chapter.secondaryTitle}</div>
            )}

            {chapter.editorialBody && (
              <p className={styles.editorialBody}>{chapter.editorialBody}</p>
            )}

            {chapter.ctaText && (
              <button
                type="button"
                className={styles.editorialCta}
                onClick={() => handleCtaClick(idx)}
              >
                <span>{chapter.ctaText}</span>
                <span className={styles.ctaLine} />
                <span className={styles.ctaArrow}>→</span>
              </button>
            )}
          </div>

          {/* Depth 03: Near Foreground Micro Technical Specifications */}
          <div className={styles.nearLayer}>
            <div className={styles.techSpecs}>
              {chapter.metadata.map((item, mIdx) => (
                <span key={mIdx}>
                  {item.label}: <b>{item.value}</b>
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
