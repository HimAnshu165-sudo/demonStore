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

const VALID_STATUSES = ['active', 'disabled'] as const;

/**
 * PATCH /api/admin/users/[id]/status
 * Updates a user's account status (Admin only).
 * Protects the platform from disabling the last remaining active administrator.
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

    const { status } = body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: `Invalid status specified. Allowed values: ${VALID_STATUSES.join(', ')}`,
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

    // Protection: Prevent disabling the last active administrator
    if (targetUser.role === 'admin' && status === 'disabled') {
      const activeAdminCount = await UserModel.countDocuments({
        role: 'admin',
        status: 'active',
      });

      if (activeAdminCount <= 1 && targetUser.status === 'active') {
        return NextResponse.json(
          {
            success: false,
            message: 'Operation rejected: Cannot disable the last remaining active administrator account.',
          },
          { status: 400 }
        );
      }
    }

    targetUser.status = status;
    await targetUser.save();

    return NextResponse.json(
      {
        success: true,
        message: `User status updated successfully to "${status}"`,
        user: sanitizeUser(targetUser),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in PATCH /api/admin/users/[id]/status:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update user status' },
      { status: 500 }
    );
  }
}
