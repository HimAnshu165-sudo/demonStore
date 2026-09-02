import 'server-only';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{
    orderId: string;
  }>;
}

/**
 * GET /api/account/orders/[orderId]
 * Retrieves a single order belonging to the current authenticated user.
 */
export async function GET(req: Request, { params }: RouteParams) {
  try {
    const session = await getAuthenticatedUser(req);

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const { orderId } = await params;

    if (!orderId || typeof orderId !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Invalid order ID' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Query for order matching both orderId AND userId for strict isolation
    const order = await Order.findOne(
      {
        orderId: orderId.trim(),
        userId: session.userId,
      },
      { _id: 0, __v: 0 }
    ).lean();

    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
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
    console.error('Error fetching user order by ID:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve order' },
      { status: 500 }
    );
  }
}
