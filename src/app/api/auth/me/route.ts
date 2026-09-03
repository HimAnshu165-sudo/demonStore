import 'server-only';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { authenticateUser, sanitizeUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const authResult = await authenticateUser(req);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: authResult.status }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: sanitizeUser(authResult.user),
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
