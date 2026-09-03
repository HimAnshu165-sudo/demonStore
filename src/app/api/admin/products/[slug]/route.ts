import 'server-only';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{
    slug: string;
  }>;
}

function buildProductQuery(identifier: string) {
  const clean = identifier.trim();
  const orConditions: any[] = [
    { slug: clean.toLowerCase() },
    { id: clean },
  ];

  if (mongoose.Types.ObjectId.isValid(clean)) {
    orConditions.push({ _id: new mongoose.Types.ObjectId(clean) });
  }

  return { $or: orConditions };
}

/**
 * GET /api/admin/products/[slug] (or by product ID)
 * Retrieves complete single product details (Admin only).
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const authResult = await requireAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.status }
      );
    }

    const { slug } = await params;

    if (!slug || typeof slug !== 'string' || !slug.trim()) {
      return NextResponse.json(
        { success: false, message: 'Invalid product identifier' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const product = await Product.findOne(buildProductQuery(slug), { __v: 0 }).lean();

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
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
    console.error('Error fetching admin product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve product' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/products/[slug] (or by product ID)
 * Updates an existing product (Admin only).
 */
export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const authResult = await requireAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.status }
      );
    }

    const { slug } = await params;

    if (!slug || typeof slug !== 'string' || !slug.trim()) {
      return NextResponse.json(
        { success: false, message: 'Invalid product identifier' },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid update payload' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const allowedUpdates: Record<string, any> = {};

    if (typeof body.name === 'string' && body.name.trim().length > 0) {
      allowedUpdates.name = body.name.trim();
    }
    if (typeof body.price === 'number' && body.price >= 0) {
      allowedUpdates.price = body.price;
      allowedUpdates.formattedPrice = `₹${body.price.toLocaleString('en-IN')}`;
    }
    if (typeof body.description === 'string') {
      allowedUpdates.description = body.description.trim();
    }
    if (typeof body.category === 'string') {
      allowedUpdates.category = body.category.trim();
    }
    if (typeof body.stock === 'number' && body.stock >= 0) {
      allowedUpdates.stock = body.stock;
    }
    if (Array.isArray(body.sizes)) {
      allowedUpdates.sizes = body.sizes;
    }
    if (Array.isArray(body.images)) {
      allowedUpdates.images = body.images;
    }
    if (Array.isArray(body.lookbookImages)) {
      allowedUpdates.lookbookImages = body.lookbookImages;
    }
    if (Array.isArray(body.tags)) {
      allowedUpdates.tags = body.tags;
    }
    if (typeof body.featured === 'boolean') {
      allowedUpdates.featured = body.featured;
    }
    if (Array.isArray(body.details)) {
      allowedUpdates.details = body.details;
    }
    if (typeof body.material === 'string') {
      allowedUpdates.material = body.material.trim();
    }
    if (typeof body.gsm === 'number') {
      allowedUpdates.gsm = body.gsm;
    }
    if (typeof body.fit === 'string') {
      allowedUpdates.fit = body.fit.trim();
    }
    if (typeof body.color === 'string') {
      allowedUpdates.color = body.color.trim();
    }
    if (typeof body.japaneseTitle === 'string') {
      allowedUpdates.japaneseTitle = body.japaneseTitle.trim();
    }
    if (typeof body.character === 'string') {
      allowedUpdates.character = body.character.trim();
    }
    if (typeof body.rank === 'string') {
      allowedUpdates.rank = body.rank.trim();
    }
    if (typeof body.collection === 'string') {
      allowedUpdates.collection = body.collection.trim();
    }

    const updatedProduct = await Product.findOneAndUpdate(
      buildProductQuery(slug),
      { $set: allowedUpdates },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedProduct) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Product updated successfully',
        product: updatedProduct,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update product' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/products/[slug] (or by product ID)
 * Deletes a product by slug, ID, or ObjectId (Admin only).
 */
export async function DELETE(req: Request, { params }: RouteParams) {
  try {
    const authResult = await requireAdmin(req);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.status }
      );
    }

    const { slug } = await params;

    if (!slug || typeof slug !== 'string' || !slug.trim()) {
      return NextResponse.json(
        { success: false, message: 'Invalid product identifier' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const deleted = await Product.findOneAndDelete(buildProductQuery(slug));

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Product deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete product' },
      { status: 500 }
    );
  }
}

