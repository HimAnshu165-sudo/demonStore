import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/mongodb';
import { Product as ProductModel } from '@/models/Product';
import { Product } from '@/types';
import { PRODUCTS } from '@/data/products';
import { ProductDetailClient } from './ProductDetailClient';

export const dynamic = 'force-dynamic';

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  if (!slug || typeof slug !== 'string') {
    notFound();
  }

  const normalizedSlug = slug.trim().toLowerCase();
  let product: Product | null = null;

  if (process.env.MONGODB_URI) {
    try {
      await connectToDatabase();
      const productDoc = await ProductModel.findOne(
        { slug: normalizedSlug },
        { _id: 0, __v: 0 }
      ).lean();

      if (productDoc) {
        product = JSON.parse(JSON.stringify(productDoc)) as Product;
      }
    } catch (err) {
      console.warn('Database query failed in ProductPage, using static PRODUCTS fallback:', err);
    }
  }

  if (!product) {
    const fallback = PRODUCTS.find((p) => p.slug.toLowerCase() === normalizedSlug);
    if (fallback) {
      product = fallback;
    }
  }

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
