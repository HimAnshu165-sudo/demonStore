import 'server-only';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import UserModel from '@/models/User';
import { getAuthenticatedUser, sanitizeUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    // Read and verify JWT session from cookie or request header
    const session = await getAuthenticatedUser(req);

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    await connectToDatabase();

    const user = await UserModel.findById(session.userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User account not found. Please log in again.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: sanitizeUser(user),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/auth/me:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve authenticated user' },
      { status: 500 }
    );
  }
}
