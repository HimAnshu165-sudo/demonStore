'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PRODUCTS } from '@/data/products';
import styles from './Lookbook.module.css';

const LOOKBOOK_ITEMS = [
  {
    number: 'LOOK 01',
    title: 'THE PROGENITOR SILHOUETTE',
    japanese: '原初 // 虚空の衣',
    product: PRODUCTS.find((p) => p.slug === 'zenitsu-thunder-breathing-hoodie') || PRODUCTS[0],
    image: '/assets/products/zenitsu-thunder-hoodie.jpg',
    description: '520 GSM loopback cotton with high-density metallic gold lightning embroidery across the shoulders. A silhouette engineered for unstoppable velocity.',
    layoutClass: styles.layoutLeft,
  },
  {
    number: 'LOOK 02',
    title: 'KIMONO MOON BREATHING',
    japanese: '黒死牟 // 壱ノ型',
    product: PRODUCTS.find((p) => p.slug === 'kokushibo-moon-breathing-hoodie') || PRODUCTS[1],
    image: '/assets/castle/02-main-hall.png',
    description: 'Structural hybrid kimono draped sleeves merged into 500 GSM French terry. Tonal crescent moon trail embroidery down the spine.',
    layoutClass: styles.layoutRight,
  },
  {
    number: 'LOOK 03',
    title: 'LOTUS FROST MILITARY NYLON',
    japanese: '蓮葉氷 // 氷晶',
    product: PRODUCTS.find((p) => p.slug === 'douma-lotus-frost-bomber') || PRODUCTS[2],
    image: '/assets/castle/04-floating-staircase.png',
    description: '280 GSM flight nylon shell with 180,000-stitch crystalline ice lotus embroidery. Blood-red cupra lining with oxidized gunmetal hardware.',
    layoutClass: styles.layoutFull,
  },
  {
    number: 'LOOK 04',
    title: 'DESTRUCTIVE DEATH HEAVY TEE',
    japanese: '破壊殺 // 羅針盤',
    product: PRODUCTS.find((p) => p.slug === 'akaza-destructive-death-tee') || PRODUCTS[1],
    image: '/assets/castle/03-infinite-corridor.png',
    description: '420 GSM combed cotton vintage stone-washed jersey with geometric high-density compass prints engineered for fluid motion.',
    layoutClass: styles.layoutLeft,
  },
  {
    number: 'LOOK 05',
    title: 'TAILORED PROGENITOR OVERCOAT',
    japanese: '支配 // 原初の影',
    product: PRODUCTS.find((p) => p.slug === 'muzan-infinity-tailored-trench') || PRODUCTS[3],
    image: '/assets/castle/06-demon-chamber.png',
    description: '600 GSM virgin wool-cashmere blend tailored overcoat featuring laser-engraved demon crest closures and monochrome jacquard castle lining.',
    layoutClass: styles.layoutRight,
  },
];

export default function LookbookPage() {
  return (
    <main className={styles.lookbookContainer}>
      <div className={styles.bgWatermark}>写真帖</div>

      <header className={styles.lookbookHeader}>
        <div className={styles.headerMeta}>
          <span>CAMPAIGN ARCHIVE // 2026</span>
          <span><b>INFINITY CASTLE</b> LOOKBOOK</span>
        </div>
        <h1 className={styles.title}>
          LOOKBOOK<br />VOLUME 01
        </h1>
        <p className={styles.subtitle}>
          VISUAL CAMPAIGN SHOT ACROSS THE SIX DIMENSIONAL MILESTONES
        </p>
      </header>

      <div className={styles.looksStack}>
        {LOOKBOOK_ITEMS.map((item, idx) => (
          <section key={idx} className={`${styles.lookCard} ${item.layoutClass}`}>
            <div className={styles.lookImageFrame}>
              <Image
                src={item.image}
                alt={item.title}
                width={1200}
                height={800}
                className={styles.lookImg}
                priority={idx < 2}
              />
            </div>

            <div className={styles.lookInfo}>
              <div className={styles.lookNumber}>{item.number}</div>
              <div className={styles.lookJapanese}>{item.japanese}</div>
              <h2 className={styles.lookTitle}>{item.title}</h2>
              <p className={styles.lookDescription}>{item.description}</p>
              
              <Link href={`/product/${item.product.slug}`} className={styles.lookCta}>
                <span>INSPECT PIECE</span>
                <span className={styles.lookCtaLine} />
                <span>→</span>
              </Link>
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
