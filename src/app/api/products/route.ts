import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { PRODUCTS } from '@/data/products';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (process.env.MONGODB_URI) {
    try {
      await connectToDatabase();
      const products = await Product.find({}, { _id: 0, __v: 0 }).lean();
      if (products && products.length > 0) {
        return NextResponse.json(
          {
            success: true,
            count: products.length,
            products,
          },
          { status: 200 }
        );
      }
    } catch (error) {
      console.warn('Error querying MongoDB for products, using static fallback:', error);
    }
  }

  return NextResponse.json(
    {
      success: true,
      count: PRODUCTS.length,
      products: PRODUCTS,
    },
    { status: 200 }
  );
}
