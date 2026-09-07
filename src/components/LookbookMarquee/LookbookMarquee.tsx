'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LOOKBOOK_SHOWCASE_ITEMS, LookbookCardItem } from '@/data/products';
import { ArrowRight } from 'lucide-react';
import styles from './LookbookMarquee.module.css';

interface LookbookMarqueeProps {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  showExploreLink?: boolean;
  preloadFirstFew?: boolean;
}

export function LookbookMarquee({
  title = 'THE SLAYER ARCHIVES',
  subtitle = 'EDITORIAL CAMPAIGN // 2026 DROP 001',
  eyebrow = 'LOOKBOOK // EDITORIAL',
  showExploreLink = true,
  preloadFirstFew = false,
}: LookbookMarqueeProps) {
  // We duplicate the items array once to create a mathematically seamless infinite loop
  const seamlessItems: LookbookCardItem[] = [
    ...LOOKBOOK_SHOWCASE_ITEMS,
    ...LOOKBOOK_SHOWCASE_ITEMS,
  ];

  const getAspectClass = (aspect: LookbookCardItem['aspectClass']) => {
    switch (aspect) {
      case 'tall':
        return styles.aspectTall;
      case 'wide':
        return styles.aspectWide;
      case 'square':
        return styles.aspectSquare;
      case 'portrait':
      default:
        return styles.aspectPortrait;
    }
  };

  return (
    <section className={styles.lookbookSection} aria-label="Editorial Lookbook Campaign">
      <div className={styles.ambientGlow} />

      <div className={styles.headerContainer}>
        <div className={styles.headerMeta}>
          <div className={styles.eyebrow}>
            <span className={styles.goldSquare} />
            <span>{eyebrow}</span>
          </div>
          <h2 className={styles.mainTitle}>{title}</h2>
          <div className={styles.japaneseSub}>{subtitle}</div>
        </div>

        {showExploreLink && (
          <div className={styles.headerAction}>
            <Link href="/lookbook" className={styles.lookbookLink}>
              <span>FULL CAMPAIGN</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        )}
      </div>

      {/* Horizontally moving continuous seamless infinite marquee */}
      <div className={styles.marqueeWrapper}>
        <div className={styles.marqueeTrack}>
          {seamlessItems.map((item, index) => {
            const aspectClass = getAspectClass(item.aspectClass);
            const isPriority = preloadFirstFew && index < 2;

            return (
              <Link
                key={`${item.id}-${index}`}
                href={`/product/${item.productSlug}`}
                className={`${styles.editorialCard} ${aspectClass}`}
              >
                <div className={styles.imageFrame}>
                  <span className={styles.numberBadge}>{item.number}</span>
                  <span className={styles.categoryTag}>{item.category}</span>
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={600}
                    height={750}
                    className={styles.cardImage}
                    sizes="(max-width: 768px) 300px, 450px"
                    priority={isPriority}
                    loading={isPriority ? 'eager' : 'lazy'}
                  />
                </div>

                <div className={styles.cardContent}>
                  <div className={styles.japaneseLabel}>{item.japanese}</div>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <div className={styles.detailTag}>{item.tag}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
