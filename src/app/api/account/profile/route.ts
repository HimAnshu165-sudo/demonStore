import 'server-only';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import UserModel from '@/models/User';
import { getAuthenticatedUser, sanitizeUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/account/profile
 * Retrieves the profile of the current authenticated user.
 */
export async function GET(req: Request) {
  try {
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
        { success: false, message: 'User account not found' },
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
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve profile' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/account/profile
 * Updates allowed profile fields (e.g. name) for the authenticated user.
 */
export async function PATCH(req: Request) {
  try {
    const session = await getAuthenticatedUser(req);

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid request payload' },
        { status: 400 }
      );
    }

    const { name } = body;

    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json(
        { success: false, message: 'Name must be at least 2 characters long' },
        { status: 400 }
      );
    }

    if (name.trim().length > 100) {
      return NextResponse.json(
        { success: false, message: 'Name cannot exceed 100 characters' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updatedUser = await UserModel.findByIdAndUpdate(
      session.userId,
      { $set: { name: name.trim() } },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User account not found' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Profile updated successfully',
        user: sanitizeUser(updatedUser),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
