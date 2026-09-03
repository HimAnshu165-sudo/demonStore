import 'server-only';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const VALID_ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;

interface RouteParams {
  params: Promise<{
    orderId: string;
  }>;
}

function buildOrderQuery(identifier: string) {
  const clean = identifier.trim();
  const orConditions: any[] = [{ orderId: clean }];
  if (mongoose.Types.ObjectId.isValid(clean)) {
    orConditions.push({ _id: new mongoose.Types.ObjectId(clean) });
  }
  return { $or: orConditions };
}

/**
 * PATCH /api/admin/orders/[orderId]/status
 * Dedicated endpoint to update order status (Admin only).
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

    const { orderId } = await params;

    if (!orderId || typeof orderId !== 'string' || !orderId.trim()) {
      return NextResponse.json(
        { success: false, message: 'Invalid order ID' },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid request payload' },
        { status: 400 }
      );
    }

    const { status } = body;

    if (!status || !VALID_ORDER_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid order status. Allowed: ${VALID_ORDER_STATUSES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updatedOrder = await Order.findOneAndUpdate(
      buildOrderQuery(orderId),
      { $set: { status } },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedOrder) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: `Order status updated to "${status}" successfully`,
        order: updatedOrder,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PATCH /api/admin/orders/[orderId]/status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update order status' },
      { status: 500 }
    );
  }
}
