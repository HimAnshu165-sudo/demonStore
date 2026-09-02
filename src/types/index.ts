export type ProductCategory = 'Hoodies' | 'T-Shirts' | 'Shoes' | 'Jackets' | 'Coats' | 'Cargos';

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  imagePath: string;
  japaneseTitle: string;
  character: string;
  rank: string;
  collection: string;
  price: number;
  currency: string;
  formattedPrice: string;
  description: string;
  details: string[];
  material: string;
  gsm: number;
  fit: string;
  color: string;
  sizes: string[];
  images: string[];
  lookbookImages: string[];
  stock: number;
  tags: string[];
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  selectedSize: string;
  quantity: number;
}
