'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LookbookMarquee } from '@/components/LookbookMarquee/LookbookMarquee';
import { FooterCinematic } from '@/components/FooterCinematic/FooterCinematic';
import styles from './Lookbook.module.css';

const LOOKBOOK_ITEMS = [
  {
    number: 'LOOK 01',
    title: 'HINOKAMI KAGURA FLAME HOODIE',
    japanese: '竈門炭治郎 // ヒノカミ神楽 円舞',
    productSlug: 'tanjiro-hinokami-kagura-flame-hoodie',
    image: '/assets/products/hoodie_01.png',
    description: '520 GSM loopback cotton hoodie with high-build Hinokami Kagura flame samurai back graphic. Paired with Flame Stride tactical combat sneakers.',
    layoutClass: styles.layoutLeft,
  },
  {
    number: 'LOOK 02',
    title: 'CRESCENT MOON SANCTUM HOODIE',
    japanese: '黒死牟 // 月の呼吸 壱ノ型 新月',
    productSlug: 'kokushibo-crescent-moon-sanctum-hoodie',
    image: '/assets/products/hoodie_02.png',
    description: 'Minimalist luxury bone white hoodie with 120,000-stitch crescent moon warrior embroidery on chest. Paired with Lunar Phase sand tech cargos.',
    layoutClass: styles.layoutRight,
  },
  {
    number: 'LOOK 03',
    title: 'BLOOD FLAME MA-1 FLIGHT BOMBER',
    japanese: '童磨 // 血炎 軍用フライトボンバー',
    productSlug: 'douma-blood-flame-ma1-flight-bomber',
    image: '/assets/products/jacket_01.png',
    description: '280 GSM military flight nylon shell with 180,000-stitch crimson armored samurai knight embroidery and blood-red satin lining.',
    layoutClass: styles.layoutFull,
  },
  {
    number: 'LOOK 04',
    title: 'DESTRUCTIVE DEATH MINERAL TEE',
    japanese: '猗窩座 // 破壊殺 鉱物洗',
    productSlug: 'akaza-destructive-death-mineral-wash-tee',
    image: '/assets/products/hoodie_07.png',
    description: '420 GSM combed cotton vintage mineral stone-washed oversized jersey with high-impact battle aura samurai back print.',
    layoutClass: styles.layoutLeft,
  },
  {
    number: 'LOOK 05',
    title: 'PROGENITOR WINGED DEMON TRENCH',
    japanese: '鬼舞辻無惨 // 始祖 翼魔 コート',
    productSlug: 'muzan-progenitor-winged-demon-trench-coat',
    image: '/assets/products/coat_01.png',
    description: '600 GSM Italian virgin wool tailored overcoat featuring winged armored demon knight embroidery and custom jacquard lining.',
    layoutClass: styles.layoutRight,
  },
  {
    number: 'LOOK 06',
    title: 'THUNDER-X 24K GOLD LUXURY RUNNERS',
    japanese: '我妻善逸 // 迅雷 24K金箔',
    productSlug: 'zenitsu-thunder-x-24k-gold-luxury-runners',
    image: '/assets/products/shoes_02.png',
    description: 'Handcrafted Italian calfskin court runners with metallic 24K gold lightning streaks and translucent gum air cushioning.',
    layoutClass: styles.layoutFull,
  },
  {
    number: 'LOOK 07',
    title: 'HASHIRA MULTI-POCKET UTILITY CARGOS',
    japanese: '鬼殺隊 // 柱 戦術 10ポケット',
    productSlug: 'hashira-combat-multi-pocket-utility-cargos',
    image: '/assets/products/cargo_01.png',
    description: '340 GSM heavy ripstop combat cargo pants engineered with 10 ergonomic 3D modular pockets and dual thigh buckle harnesses.',
    layoutClass: styles.layoutLeft,
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
          VISUAL CAMPAIGN SHOT ACROSS STREETWEAR, FOOTWEAR & ARCHITECTURAL APPAREL
        </p>
      </header>

      {/* Seamless Continuous Infinite Moving Editorial Track */}
      <div className={styles.marqueeWrapper}>
        <LookbookMarquee
          title="THE SLAYER ARCHIVES"
          subtitle="CONTINUOUS EDITORIAL CAMPAIGN TRACK"
          eyebrow="LIVE GALLERY // VOLUME 01"
          showExploreLink={false}
        />
      </div>

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

              <Link href={`/product/${item.productSlug}`} className={styles.lookCta}>
                <span>INSPECT PIECE</span>
                <span className={styles.lookCtaLine} />
                <span>→</span>
              </Link>
            </div>
          </section>
        ))}
      </div>

      <FooterCinematic />
    </main>
  );
}
