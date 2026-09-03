import 'server-only';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { Product } from '@/models/Product';
import UserModel from '@/models/User';
import { requireAdmin, ACTIVE_USER_WINDOW_MINUTES, LOW_STOCK_THRESHOLD } from '@/lib/auth';

export const dynamic = 'force-dynamic';

function parseDateRange(rangeParam: string | null): { startDate: Date; rangeKey: string } {
  const now = new Date();
  const range = (rangeParam || '30d').toLowerCase().trim();

  let days = 30;
  if (range === '7d') days = 7;
  else if (range === '30d') days = 30;
  else if (range === '90d') days = 90;
  else if (range === '1y' || range === '365d') days = 365;
  else days = 30;

  const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  return { startDate, rangeKey: `${days}d` };
}

/**
 * GET /api/admin/analytics
 * Returns aggregated analytics metrics over a specified date range (Admin only).
 * Query parameters: ?range=7d | 30d | 90d | 1y
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

    const { searchParams } = new URL(req.url);
    const { startDate, rangeKey } = parseDateRange(searchParams.get('range'));

    await connectToDatabase();

    const activeUserCutoff = new Date(
      Date.now() - ACTIVE_USER_WINDOW_MINUTES * 60 * 1000
    );

    const [
      revenueTimeline,
      orderStatusDistribution,
      userRegistrationsTimeline,
      bestSellingProducts,
      categoryPerformance,
      lowStockProducts,
      activeUsersCount,
    ] = await Promise.all([
      // 1. Revenue and Orders Timeline (Excluding cancelled orders)
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            status: { $ne: 'cancelled' },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            revenue: { $sum: '$total' },
            ordersCount: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            date: '$_id',
            revenue: '$revenue',
            ordersCount: '$ordersCount',
          },
        },
      ]),

      // 2. Order Status Distribution within date range
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalValue: { $sum: '$total' },
          },
        },
        {
          $project: {
            _id: 0,
            status: '$_id',
            count: '$count',
            totalValue: '$totalValue',
          },
        },
      ]),

      // 3. User Registration Timeline
      UserModel.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            date: '$_id',
            count: '$count',
          },
        },
      ]),

      // 4. Best Selling Products (Aggregated from valid orders)
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            status: { $ne: 'cancelled' },
          },
        },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.productId',
            slug: { $first: '$items.slug' },
            name: { $first: '$items.name' },
            image: { $first: '$items.image' },
            quantitySold: { $sum: '$items.quantity' },
            revenue: {
              $sum: { $multiply: ['$items.price', '$items.quantity'] },
            },
          },
        },
        { $sort: { quantitySold: -1, revenue: -1 } },
        { $limit: 10 },
        {
          $project: {
            _id: 0,
            productId: '$_id',
            slug: 1,
            name: 1,
            image: 1,
            quantitySold: 1,
            revenue: 1,
          },
        },
      ]),

      // 5. Category Performance (lookup category from products or aggregate from items)
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            status: { $ne: 'cancelled' },
          },
        },
        { $unwind: '$items' },
        {
          $lookup: {
            from: 'products',
            localField: 'items.slug',
            foreignField: 'slug',
            as: 'productDoc',
          },
        },
        {
          $unwind: {
            path: '$productDoc',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $group: {
            _id: { $ifNull: ['$productDoc.category', 'Uncategorized'] },
            quantitySold: { $sum: '$items.quantity' },
            revenue: {
              $sum: { $multiply: ['$items.price', '$items.quantity'] },
            },
            ordersCount: { $sum: 1 },
          },
        },
        { $sort: { revenue: -1 } },
        {
          $project: {
            _id: 0,
            category: '$_id',
            quantitySold: 1,
            revenue: 1,
            ordersCount: 1,
          },
        },
      ]),

      // 6. Low Stock Products alert list
      Product.find(
        { stock: { $lte: LOW_STOCK_THRESHOLD } },
        { _id: 0, id: 1, slug: 1, name: 1, category: 1, stock: 1, price: 1, images: 1 }
      )
        .sort({ stock: 1 })
        .limit(20)
        .lean(),

      // 7. Active users count
      UserModel.countDocuments({
        lastSeen: { $gte: activeUserCutoff },
        status: { $ne: 'disabled' },
      }),
    ]);

    // Calculate aggregated totals in range
    const totalRangeRevenue = revenueTimeline.reduce((acc, curr) => acc + curr.revenue, 0);
    const totalRangeOrders = revenueTimeline.reduce((acc, curr) => acc + curr.ordersCount, 0);
    const totalRangeNewUsers = userRegistrationsTimeline.reduce((acc, curr) => acc + curr.count, 0);
    const averageOrderValue = totalRangeOrders > 0 ? Math.round(totalRangeRevenue / totalRangeOrders) : 0;

    return NextResponse.json(
      {
        success: true,
        range: rangeKey,
        startDate: startDate.toISOString(),
        summary: {
          totalRevenue: totalRangeRevenue,
          formattedRevenue: `₹${totalRangeRevenue.toLocaleString('en-IN')}`,
          totalOrders: totalRangeOrders,
          averageOrderValue,
          formattedAOV: `₹${averageOrderValue.toLocaleString('en-IN')}`,
          newUsersCount: totalRangeNewUsers,
          activeUsersCount,
          lowStockCount: lowStockProducts.length,
        },
        revenue: {
          timeline: revenueTimeline,
          total: totalRangeRevenue,
        },
        orders: {
          statusDistribution: orderStatusDistribution,
          timeline: revenueTimeline.map((item) => ({
            date: item.date,
            count: item.ordersCount,
          })),
        },
        users: {
          timeline: userRegistrationsTimeline,
          totalNewUsers: totalRangeNewUsers,
          activeUsers: activeUsersCount,
        },
        products: {
          bestSellers: bestSellingProducts,
          categoryPerformance,
          lowStockAlerts: lowStockProducts,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/admin/analytics:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate analytics report' },
      { status: 500 }
    );
  }
}
