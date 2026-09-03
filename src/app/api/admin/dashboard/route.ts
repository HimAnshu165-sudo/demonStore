import 'server-only';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Product } from '@/models/Product';
import { Order } from '@/models/Order';
import UserModel from '@/models/User';
import { requireAdmin, ACTIVE_USER_WINDOW_MINUTES, LOW_STOCK_THRESHOLD } from '@/lib/auth';

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

    const activeUserCutoff = new Date(
      Date.now() - ACTIVE_USER_WINDOW_MINUTES * 60 * 1000
    );

    const [
      totalProducts,
      totalOrders,
      totalUsers,
      activeUsers,
      pendingOrders,
      confirmedOrders,
      shippedOrders,
      deliveredOrders,
      lowStockProducts,
      revenueResult,
    ] = await Promise.all([
      Product.countDocuments(),
      Order.countDocuments(),
      UserModel.countDocuments(),
      UserModel.countDocuments({
        lastSeen: { $gte: activeUserCutoff },
        status: { $ne: 'disabled' },
      }),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'confirmed' }),
      Order.countDocuments({ status: 'shipped' }),
      Order.countDocuments({ status: 'delivered' }),
      Product.countDocuments({ stock: { $lte: LOW_STOCK_THRESHOLD } }),
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
          totalUsers,
          activeUsers,
          totalProducts,
          totalOrders,
          totalRevenue,
          formattedRevenue: `₹${totalRevenue.toLocaleString('en-IN')}`,
          pendingOrders,
          confirmedOrders,
          shippedOrders,
          deliveredOrders,
          completedOrders: deliveredOrders,
          lowStockProducts,
          activeWindowMinutes: ACTIVE_USER_WINDOW_MINUTES,
          lowStockThreshold: LOW_STOCK_THRESHOLD,
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

