import 'server-only';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { Order } from '@/models/Order';
import UserModel from '@/models/User';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/dashboard
 * Aggregates live platform metrics and statistics (Admin only).
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

    const [
      totalProducts,
      totalOrders,
      totalUsers,
      pendingOrders,
      shippedOrders,
      deliveredOrders,
      revenueResult,
    ] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      UserModel.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'shipped' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
      ]),
    ]);

    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    return NextResponse.json(
      {
        success: true,
        stats: {
          totalProducts,
          totalOrders,
          totalUsers,
          pendingOrders,
          shippedOrders,
          deliveredOrders,
          totalRevenue,
          formattedRevenue: `₹${totalRevenue.toLocaleString('en-IN')}`,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve dashboard metrics' },
      { status: 500 }
    );
  }
}
