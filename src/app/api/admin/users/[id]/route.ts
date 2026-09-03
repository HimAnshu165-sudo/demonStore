import 'server-only';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import UserModel from '@/models/User';
import { Order } from '@/models/Order';
import { requireAdmin, sanitizeUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/users/[id]
 * Retrieves detailed user profile and aggregated order metrics (Admin only).
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

    const { id } = await params;

    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id.trim())) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID format' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const user = await UserModel.findById(id.trim(), { passwordHash: 0, __v: 0 }).lean();

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const userIdStr = user._id.toString();
    const userEmail = user.email.toLowerCase().trim();

    // Aggregate order metrics matching by userId or user email
    const [orderMetrics, recentOrders] = await Promise.all([
      Order.aggregate([
        {
          $match: {
            $or: [{ userId: userIdStr }, { 'customer.email': userEmail }],
            status: { $ne: 'cancelled' },
          },
        },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: '$total' },
          },
        },
      ]),
      Order.find(
        {
          $or: [{ userId: userIdStr }, { 'customer.email': userEmail }],
        },
        { _id: 0, orderId: 1, total: 1, status: 1, createdAt: 1, items: 1 }
      )
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
    ]);

    const totalOrders = orderMetrics.length > 0 ? orderMetrics[0].totalOrders : 0;
    const totalSpent = orderMetrics.length > 0 ? orderMetrics[0].totalSpent : 0;

    return NextResponse.json(
      {
        success: true,
        user: {
          ...sanitizeUser(user),
          stats: {
            totalOrders,
            totalSpent,
            formattedTotalSpent: `₹${totalSpent.toLocaleString('en-IN')}`,
          },
          recentOrders,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/admin/users/[id]:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve user details' },
      { status: 500 }
    );
  }
}
