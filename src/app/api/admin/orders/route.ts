import 'server-only';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Order } from '@/models/Order';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const VALID_ORDER_STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const;

/**
 * GET /api/admin/orders
 * Retrieves paginated customer orders with search, status filtering, date filtering, and sorting (Admin only).
 * Query parameters:
 * ?page=1&limit=20&search=keyword&status=pending&startDate=2026-01-01&endDate=2026-12-31&sortBy=createdAt&sortOrder=desc
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

    // 1. Pagination parameters (bounded)
    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    const limitParam = parseInt(searchParams.get('limit') || '20', 10);
    const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit = Number.isInteger(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 20;
    const skip = (page - 1) * limit;

    // 2. Filter & Search criteria
    const search = searchParams.get('search')?.trim();
    const status = searchParams.get('status')?.trim().toLowerCase();
    const startDateParam = searchParams.get('startDate')?.trim();
    const endDateParam = searchParams.get('endDate')?.trim();
    const sortByParam = searchParams.get('sortBy')?.trim() || 'createdAt';
    const sortOrderParam = searchParams.get('sortOrder')?.trim().toLowerCase() === 'asc' ? 1 : -1;

    const query: Record<string, any> = {};

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { orderId: { $regex: escapedSearch, $options: 'i' } },
        { 'customer.email': { $regex: escapedSearch, $options: 'i' } },
        { 'customer.firstName': { $regex: escapedSearch, $options: 'i' } },
        { 'customer.lastName': { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    if (status && VALID_ORDER_STATUSES.includes(status as any)) {
      query.status = status;
    }

    // Date range filter
    if (startDateParam || endDateParam) {
      query.createdAt = {};
      if (startDateParam) {
        const start = new Date(startDateParam);
        if (!isNaN(start.getTime())) {
          query.createdAt.$gte = start;
        }
      }
      if (endDateParam) {
        const end = new Date(endDateParam);
        if (!isNaN(end.getTime())) {
          // If date string has no time, set to end of day
          if (!endDateParam.includes('T')) {
            end.setHours(23, 59, 59, 999);
          }
          query.createdAt.$lte = end;
        }
      }
      if (Object.keys(query.createdAt).length === 0) {
        delete query.createdAt;
      }
    }

    const allowedSortFields: Record<string, string> = {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      total: 'total',
      status: 'status',
    };
    const sortField = allowedSortFields[sortByParam] || 'createdAt';

    await connectToDatabase();

    const [totalOrders, orders] = await Promise.all([
      Order.countDocuments(query),
      Order.find(query, { __v: 0 })
        .sort({ [sortField]: sortOrderParam })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return NextResponse.json(
      {
        success: true,
        count: orders.length,
        pagination: {
          page,
          limit,
          total: totalOrders,
          totalPages: Math.ceil(totalOrders / limit) || 1,
        },
        orders,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/admin/orders:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve orders' },
      { status: 500 }
    );
  }
}

