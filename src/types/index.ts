export interface Product {
  id: string;
  slug: string;
  name: string;
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
  sizes: ('S' | 'M' | 'L' | 'XL' | 'XXL')[];
  images: string[];
  lookbookImages: string[];
  stock: number;
  tags: string[];
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  selectedSize: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  quantity: number;
}
