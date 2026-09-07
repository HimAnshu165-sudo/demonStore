import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Product';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await connectToDatabase();

    // Query all products, excluding internal MongoDB/Mongoose fields (_id, __v)
    const products = await Product.find({}, { _id: 0, __v: 0 }).lean();

    return NextResponse.json(
      {
        success: true,
        count: products.length,
        products,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/products:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch products',
      },
      { status: 500 }
    );
  }
}
