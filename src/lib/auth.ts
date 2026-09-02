import 'server-only';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { IUser } from '@/models/User';

// Environment secret with development fallback
const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || process.env.JWT_SECRET || 'demon_store_infinity_castle_secret_key_2026_drop'
);

export const AUTH_COOKIE_NAME = 'demon_auth_token';
export const TOKEN_EXPIRATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface AuthUserPayload {
  userId: string;
  email: string;
  name: string;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role?: 'user' | 'admin';
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Hashes a plaintext password securely using bcrypt with 12 salt rounds.
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || password.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Verifies a plaintext password against a stored bcrypt hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (!password || !hash) {
    return false;
  }
  return bcrypt.compare(password, hash);
}

/**
 * Generates a signed JWT session token containing user identification.
 */
export async function createSessionToken(payload: AuthUserPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_SECRET);
}

/**
 * Verifies and decodes a signed JWT session token.
 */
export async function verifySessionToken(token: string): Promise<AuthUserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (!payload || !payload.userId || !payload.email || !payload.name) {
      return null;
    }
    return {
      userId: String(payload.userId),
      email: String(payload.email),
      name: String(payload.name),
    };
  } catch {
    return null;
  }
}

/**
 * Standard cookie configuration for session storage.
 */
export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: TOKEN_EXPIRATION_SECONDS,
  };
}

/**
 * Strips passwordHash and returns a clean, safe user representation.
 */
export function sanitizeUser(user: IUser & { _id?: any }): SafeUser {
  return {
    id: user._id ? user._id.toString() : '',
    name: user.name,
    email: user.email,
    role: user.role || 'user',
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

/**
 * Reads and verifies the authenticated user from cookies or an optional Request object.
 */
export async function getAuthenticatedUser(req?: Request): Promise<AuthUserPayload | null> {
  try {
    let token: string | undefined;

    if (req) {
      const cookieHeader = req.headers.get('cookie') || '';
      const match = cookieHeader
        .split(';')
        .map((c) => c.trim())
        .find((c) => c.startsWith(`${AUTH_COOKIE_NAME}=`));
      if (match) {
        token = match.substring(AUTH_COOKIE_NAME.length + 1);
      }
    } else {
      const cookieStore = await cookies();
      token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    }

    if (!token) {
      return null;
    }

    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

/**
 * Verifies that the incoming request is authenticated and has 'admin' role.
 * Returns { success: true, user, session } or { success: false, status, message }.
 */
export async function requireAdmin(req?: Request): Promise<
  | { success: true; user: IUser; session: AuthUserPayload }
  | { success: false; status: 401 | 403; message: string }
> {
  const session = await getAuthenticatedUser(req);

  if (!session) {
    return {
      success: false,
      status: 401,
      message: 'Unauthorized. Please log in.',
    };
  }

  const UserModel = (await import('@/models/User')).default;
  const { connectToDatabase } = await import('@/lib/mongodb');

  await connectToDatabase();

  const user = await UserModel.findById(session.userId);

  if (!user) {
    return {
      success: false,
      status: 401,
      message: 'User account not found.',
    };
  }

  if (user.role !== 'admin') {
    return {
      success: false,
      status: 403,
      message: 'Forbidden. Administrator privileges required.',
    };
  }

  return {
    success: true,
    user,
    session,
  };
}
