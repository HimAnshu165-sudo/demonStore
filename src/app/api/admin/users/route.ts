import 'server-only';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import UserModel from '@/models/User';
import { requireAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/users
 * Retrieves all registered users without sensitive credentials (Admin only).
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

    const users = await UserModel.find({}, { passwordHash: 0, __v: 0 })
      .sort({ createdAt: -1 })
      .lean();

    const sanitizedUsers = users.map((u) => ({
      id: u._id ? u._id.toString() : '',
      name: u.name,
      email: u.email,
      role: u.role || 'user',
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

    return NextResponse.json(
      {
        success: true,
        count: sanitizedUsers.length,
        users: sanitizedUsers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve users' },
      { status: 500 }
    );
  }
}
