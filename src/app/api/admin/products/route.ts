import 'server-only';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/products
 * Retrieves all products with full management metadata (Admin only).
 */
export async function GET(req: Request) {
  try {
    const authResult = await requireAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.status }
      );
    }

    await connectToDatabase();

    const products = await Product.find({}, { __v: 0 })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        count: products.length,
        products,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching admin products:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve products' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/products
 * Creates a new product in the catalog (Admin only).
 */
export async function POST(req: Request) {
  try {
    const authResult = await requireAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.status }
      );
    }

    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid product payload' },
        { status: 400 }
      );
    }

    const {
      id,
      slug,
      name,
      category,
      price,
      currency,
      description,
      details,
      material,
      gsm,
      fit,
      color,
      sizes,
      images,
      lookbookImages,
      stock,
      tags,
      featured,
      japaneseTitle,
      character,
      rank,
      collection,
    } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Product name is required' },
        { status: 400 }
      );
    }

    if (!slug || typeof slug !== 'string' || slug.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Product slug is required' },
        { status: 400 }
      );
    }

    if (typeof price !== 'number' || price < 0) {
      return NextResponse.json(
        { success: false, message: 'A valid positive price is required' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Product description is required' },
        { status: 400 }
      );
    }

    const cleanSlug = slug.trim().toLowerCase();
    const cleanId = (id && typeof id === 'string' && id.trim().length > 0)
      ? id.trim()
      : `prod-${Date.now()}`;

    await connectToDatabase();

    // Check slug uniqueness
    const existing = await Product.findOne({ slug: cleanSlug });
    if (existing) {
      return NextResponse.json(
        { success: false, message: `Product with slug "${cleanSlug}" already exists` },
        { status: 409 }
      );
    }

    const newProduct = await Product.create({
      id: cleanId,
      slug: cleanSlug,
      name: name.trim(),
      category: category ? String(category).trim() : 'Hoodies',
      price,
      currency: currency ? String(currency).trim() : 'INR',
      formattedPrice: `₹${price.toLocaleString('en-IN')}`,
      description: description.trim(),
      details: Array.isArray(details) ? details : [],
      material: material ? String(material).trim() : '',
      gsm: typeof gsm === 'number' ? gsm : undefined,
      fit: fit ? String(fit).trim() : '',
      color: color ? String(color).trim() : '',
      sizes: Array.isArray(sizes) && sizes.length > 0 ? sizes : ['S', 'M', 'L', 'XL'],
      images: Array.isArray(images) && images.length > 0 ? images : ['/assets/products/hoodie_01.png'],
      lookbookImages: Array.isArray(lookbookImages) ? lookbookImages : [],
      stock: typeof stock === 'number' && stock >= 0 ? stock : 0,
      tags: Array.isArray(tags) ? tags : [],
      featured: Boolean(featured),
      japaneseTitle: japaneseTitle ? String(japaneseTitle).trim() : '',
      character: character ? String(character).trim() : 'UNKNOWN',
      rank: rank ? String(rank).trim() : 'STANDARD',
      collection: collection ? String(collection).trim() : 'CORE COLLECTION',
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Product created successfully',
        product: newProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create product' },
      { status: 500 }
    );
  }
}
