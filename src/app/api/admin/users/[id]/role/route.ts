import 'server-only';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectToDatabase } from '@/lib/mongodb';
import UserModel from '@/models/User';
import { requireAdmin, sanitizeUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

interface RouteParams {
  params: Promise<{ id: string }>;
}

const VALID_ROLES = ['user', 'admin'] as const;

/**
 * PATCH /api/admin/users/[id]/role
 * Updates a user's role (Admin only).
 * Protects the platform from demoting the last remaining active administrator.
 */
export async function PATCH(req: Request, { params }: RouteParams) {
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

    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid JSON request payload' },
        { status: 400 }
      );
    }

    const { role } = body;

    if (!role || !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid role specified. Allowed values: ${VALID_ROLES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const targetUser = await UserModel.findById(id.trim());

    if (!targetUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Protection: Prevent demoting the last active administrator
    if (targetUser.role === 'admin' && role === 'user') {
      const activeAdminCount = await UserModel.countDocuments({
        role: 'admin',
        status: { $ne: 'disabled' },
      });

      if (activeAdminCount <= 1) {
        return NextResponse.json(
          {
            success: false,
            message: 'Operation rejected: Cannot demote the last remaining active administrator account.',
          },
          { status: 400 }
        );
      }
    }

    targetUser.role = role;
    await targetUser.save();

    return NextResponse.json(
      {
        success: true,
        message: `User role updated successfully to "${role}"`,
        user: sanitizeUser(targetUser),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PATCH /api/admin/users/[id]/role:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update user role' },
      { status: 500 }
    );
  }
}
