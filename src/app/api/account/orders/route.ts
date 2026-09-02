import 'server-only';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { getAuthenticatedUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/account/orders
 * Retrieves all orders placed by the current authenticated user.
 */
export async function GET(req: Request) {
  try {
    const session = await getAuthenticatedUser(req);

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const orders = await Order.find(
      { userId: session.userId },
      { _id: 0, __v: 0 }
    )
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        count: orders.length,
        orders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve orders' },
      { status: 500 }
    );
  }
}
