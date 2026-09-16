import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';
import { AdminProduct } from '@/types/admin';
import { ProductCategory } from '@/types';
import styles from './Modals.module.css';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<AdminProduct>) => Promise<void>;
  initialData?: AdminProduct | null;
}

const CATEGORIES: ProductCategory[] = ['Hoodies', 'T-Shirts', 'Shoes', 'Jackets', 'Coats', 'Cargos'];

export function ProductFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: ProductFormModalProps) {
  const [name, setName] = useState('');
  const [japaneseTitle, setJapaneseTitle] = useState('');
  const [category, setCategory] = useState<ProductCategory>('Hoodies');
  const [price, setPrice] = useState<number>(12400);
  const [discount, setDiscount] = useState<number>(0);
  const [stock, setStock] = useState<number>(15);
  const [gsm, setGsm] = useState<number>(550);
  const [material, setMaterial] = useState('100% Ring-Spun Japanese Combed Cotton');
  const [fit, setFit] = useState('Oversized Boxy Tactical Silhouette');
  const [color, setColor] = useState('Citadel Onyx / Blood Crimson');
  const [imagePath, setImagePath] = useState('/assets/castle/01-entrance.png');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
      setJapaneseTitle(initialData.japaneseTitle || '');
      setCategory(initialData.category || 'Hoodies');
      setPrice(initialData.price || 12400);
      setDiscount(initialData.discount || 0);
      setStock(initialData.stock !== undefined ? initialData.stock : 10);
      setGsm(initialData.gsm || 500);
      setMaterial(initialData.material || '');
      setFit(initialData.fit || '');
      setColor(initialData.color || '');
      setImagePath(initialData.images?.[0] || '/assets/castle/01-entrance.png');
      setDescription(initialData.description || '');
    } else {
      setName('');
      setJapaneseTitle('');
      setCategory('Hoodies');
      setPrice(12400);
      setDiscount(0);
      setStock(15);
      setGsm(550);
      setMaterial('100% Ring-Spun Japanese Combed Cotton');
      setFit('Oversized Boxy Tactical Silhouette');
      setColor('Citadel Onyx / Blood Crimson');
      setImagePath('/assets/castle/01-entrance.png');
      setDescription('');
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = 'Product name is required';
    if (!price || price <= 0) nextErrors.price = 'Valid price in INR is required';
    if (stock < 0) nextErrors.stock = 'Stock count cannot be negative';
    if (!description.trim()) nextErrors.description = 'Garment description is required';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name,
        japaneseTitle: japaneseTitle || '無限 // ARCHIVE',
        category,
        price: Number(price),
        discount: Number(discount) || 0,
        stock: Number(stock),
        gsm: Number(gsm) || 500,
        material,
        fit,
        color,
        description,
        imagePath,
        images: [imagePath],
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalBox} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitleWrapper}>
            <h2 className={styles.modalTitle}>
              {initialData ? 'EDIT ARCHIVE GARMENT' : 'ENSCRIBE NEW PRODUCT'}
            </h2>
            <span className={styles.modalSubtitle}>
              {initialData ? `UPDATING ITEM #${initialData.id}` : 'CREATE HEAVYWEIGHT SPECIFICATION'}
            </span>
          </div>
          <button onClick={onClose} className={styles.closeBtn} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className={styles.modalContent}>
            <div className={styles.formGrid}>
              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>PRODUCT NAME</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Zenitsu Thunder Form Heavyweight Hoodie"
                  className={styles.input}
                />
                {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>JAPANESE TITLE / KANJI</label>
                <input
                  type="text"
                  value={japaneseTitle}
                  onChange={(e) => setJapaneseTitle(e.target.value)}
                  placeholder="e.g. 善逸 // 雷の呼吸"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>CATEGORY</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ProductCategory)}
                  className={styles.select}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>BASE PRICE (₹ INR)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  min={1}
                  className={styles.input}
                />
                {errors.price && <span className={styles.fieldError}>{errors.price}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>STOCK QUANTITY</label>
                <input
                  type="number"
                  value={stock}
                  onChange={(e) => setStock(Number(e.target.value))}
                  min={0}
                  className={styles.input}
                />
                {errors.stock && <span className={styles.fieldError}>{errors.stock}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>FABRIC DENSITY (GSM)</label>
                <input
                  type="number"
                  value={gsm}
                  onChange={(e) => setGsm(Number(e.target.value))}
                  min={100}
                  max={1200}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>DISCOUNT PERCENT (%)</label>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  min={0}
                  max={90}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>MATERIAL COMPOSITION</label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="100% Ring-Spun Cotton"
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>SILHOUETTE / FIT</label>
                <input
                  type="text"
                  value={fit}
                  onChange={(e) => setFit(e.target.value)}
                  placeholder="Oversized Boxy Silhouette"
                  className={styles.input}
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>IMAGE ASSET PATH / URL</label>
                <input
                  type="text"
                  value={imagePath}
                  onChange={(e) => setImagePath(e.target.value)}
                  placeholder="/assets/castle/01-entrance.png"
                  className={styles.input}
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullWidth}`}>
                <label className={styles.label}>GARMENT DESCRIPTION</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Cinematic construction details, stitching, and Demon Slayer lore..."
                  className={styles.textarea}
                  rows={3}
                />
                {errors.description && <span className={styles.fieldError}>{errors.description}</span>}
              </div>
            </div>
          </div>

          <div className={styles.modalFooter}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>
              CANCEL
            </button>
            <button type="submit" disabled={isSubmitting} className={styles.confirmBtn}>
              <Check size={16} />
              <span>{isSubmitting ? 'SAVING SPECIFICATION...' : initialData ? 'UPDATE PIECE' : 'ENSCRIBE PIECE'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
