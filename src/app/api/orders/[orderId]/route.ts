import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/models/Order';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ orderId: string }>;
}

/**
 * GET /api/orders/[orderId]
 * Retrieves a single order by its unique order code (e.g. ORD-XXXXXX-XXXX).
 */
export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { orderId } = await params;

    if (!orderId || typeof orderId !== 'string' || !orderId.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid or missing order identifier',
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const order = await Order.findOne(
      { orderId: orderId.trim() },
      { _id: 0, __v: 0 }
    ).lean();

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          message: 'Order not found',
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        order,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/orders/[orderId]:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve order',
      },
      { status: 500 }
    );
  }
}
