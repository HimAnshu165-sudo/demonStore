import { notFound } from 'next/navigation';
import { connectToDatabase } from '@/lib/mongodb';
import { Product as ProductModel } from '@/models/Product';
import { Product } from '@/types';
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

  await connectToDatabase();

  const productDoc = await ProductModel.findOne(
    { slug: slug.trim().toLowerCase() },
    { _id: 0, __v: 0 }
  ).lean();

  if (!productDoc) {
    notFound();
  }

  const product = JSON.parse(JSON.stringify(productDoc)) as Product;

  return <ProductDetailClient product={product} />;
}
