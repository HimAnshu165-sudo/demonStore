import 'server-only';
import { NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/auth';
import UserModel from '@/models/User';
import { connectToDatabase } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

/**
 * POST /api/users/heartbeat
 * Periodic heartbeat for active user activity tracking.
 * Requires an authenticated user session.
 */
export async function POST(req: Request) {
  try {
    const authResult = await authenticateUser(req);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.status }
      );
    }

    await connectToDatabase();

    const now = new Date();
    await UserModel.updateOne(
      { _id: authResult.user._id },
      { $set: { lastSeen: now } }
    );

    return NextResponse.json(
      {
        success: true,
        message: 'Heartbeat acknowledged',
        lastSeen: now,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in POST /api/users/heartbeat:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process heartbeat' },
      { status: 500 }
    );
  }
}
