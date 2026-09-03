import 'server-only';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import UserModel from '@/models/User';
import { requireAdmin, sanitizeUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/users
 * Retrieves paginated users with search, role/status filtering, and sorting (Admin only).
 * Query parameters:
 * ?page=1&limit=20&search=keyword&role=admin|user&status=active|disabled&sortBy=createdAt&sortOrder=desc
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

    // 1. Pagination parameters (bounded to prevent unbounded retrieval)
    const pageParam = parseInt(searchParams.get('page') || '1', 10);
    const limitParam = parseInt(searchParams.get('limit') || '20', 10);
    const page = Number.isInteger(pageParam) && pageParam > 0 ? pageParam : 1;
    const limit = Number.isInteger(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 20;
    const skip = (page - 1) * limit;

    // 2. Search & Filter criteria
    const search = searchParams.get('search')?.trim();
    const roleFilter = searchParams.get('role')?.trim().toLowerCase();
    const statusFilter = searchParams.get('status')?.trim().toLowerCase();
    const sortByParam = searchParams.get('sortBy')?.trim() || 'createdAt';
    const sortOrderParam = searchParams.get('sortOrder')?.trim().toLowerCase() === 'asc' ? 1 : -1;

    const query: Record<string, any> = {};

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { email: { $regex: escapedSearch, $options: 'i' } },
      ];
    }

    if (roleFilter && ['user', 'admin'].includes(roleFilter)) {
      query.role = roleFilter;
    }

    if (statusFilter && ['active', 'disabled'].includes(statusFilter)) {
      query.status = statusFilter;
    }

    // Supported sort keys
    const allowedSortFields: Record<string, string> = {
      createdAt: 'createdAt',
      updatedAt: 'updatedAt',
      lastSeen: 'lastSeen',
      name: 'name',
      email: 'email',
    };
    const sortField = allowedSortFields[sortByParam] || 'createdAt';

    await connectToDatabase();

    const [totalUsers, users] = await Promise.all([
      UserModel.countDocuments(query),
      UserModel.find(query, { passwordHash: 0, __v: 0 })
        .sort({ [sortField]: sortOrderParam })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    const sanitizedUsers = users.map((u) => sanitizeUser(u));

    return NextResponse.json(
      {
        success: true,
        count: sanitizedUsers.length,
        pagination: {
          page,
          limit,
          total: totalUsers,
          totalPages: Math.ceil(totalUsers / limit) || 1,
        },
        users: sanitizedUsers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/admin/users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve users' },
      { status: 500 }
    );
  }
}

