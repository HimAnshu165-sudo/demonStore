import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { PRODUCTS } from '@/data/products';

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

    const normalizedSlug = slug.trim().toLowerCase();
    let product = null;

    if (process.env.MONGODB_URI) {
      try {
        await connectToDatabase();
        product = await Product.findOne(
          { slug: normalizedSlug },
          { _id: 0, __v: 0 }
        ).lean();
      } catch (err) {
        console.warn('MongoDB query failed for slug, falling back to static products:', err);
      }
    }

    if (!product) {
      const fallback = PRODUCTS.find((p) => p.slug.toLowerCase() === normalizedSlug);
      if (fallback) {
        product = fallback;
      }
    }

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
