import 'server-only';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import UserModel from '@/models/User';
import {
  verifyPassword,
  createSessionToken,
  getAuthCookieOptions,
  sanitizeUser,
  AUTH_COOKIE_NAME,
} from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, message: 'Invalid request payload' },
        { status: 400 }
      );
    }

    const { email, password } = body;

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    await connectToDatabase();

    // Query user and explicitly select passwordHash
    const user = await UserModel.findOne({ email: normalizedEmail }).select('+passwordHash');

    if (!user) {
      // Generic error message to prevent email enumeration
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password against stored bcrypt hash
    const isPasswordValid = await verifyPassword(password, user.passwordHash);

    if (!isPasswordValid) {
      // Generic error message to prevent password enumeration
      return NextResponse.json(
        { success: false, message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if account is disabled
    if (user.status === 'disabled') {
      return NextResponse.json(
        { success: false, message: 'Account is disabled. Please contact platform support.' },
        { status: 403 }
      );
    }

    // Update lastSeen timestamp
    user.lastSeen = new Date();
    await user.save();

    const safeUser = sanitizeUser(user);

    // Generate JWT session token
    const token = await createSessionToken({
      userId: safeUser.id,
      email: safeUser.email,
      name: safeUser.name,
    });

    const response = NextResponse.json(
      {
        success: true,
        message: 'Login successful',
        user: safeUser,
      },
      { status: 200 }
    );

    // Set secure HTTP-only session cookie
    response.cookies.set(AUTH_COOKIE_NAME, token, getAuthCookieOptions());

    return response;
  } catch (error) {
    console.error('Error during login:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process login. Please try again.' },
      { status: 500 }
    );
  }
}
