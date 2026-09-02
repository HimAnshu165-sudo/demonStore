import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Product';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { slug } = await params;

    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or missing product slug',
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const product = await Product.findOne(
      { slug: slug.trim().toLowerCase() },
      { _id: 0, __v: 0 }
    ).lean();

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: 'Product not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        product,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/products/[slug]:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch product',
      },
      { status: 500 }
    );
  }
}
