import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { queryOne } from '@/lib/db/turso';

// User type (matches Pix3lBoard users table)
export interface User {
  id: string;
  email: string;
  name: string | null;
  is_admin: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  name: string | null;
  is_admin: number;
  is_approved: number;
  created_at: string;
  updated_at: string;
}

// JWT helpers
const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');
  return new TextEncoder().encode(secret);
};

export async function createToken(userId: string): Promise<string> {
  return new SignJWT({ userId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret());
}

export async function verifyToken(token: string): Promise<{ userId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return { userId: payload.userId as string };
  } catch {
    return null;
  }
}

export async function login(
  email: string,
  password: string
): Promise<{ user: User; token: string } | { error: string }> {
  const row = await queryOne<UserRow>(
    'SELECT * FROM users WHERE email = :email',
    { email: email.toLowerCase() }
  );

  if (!row) {
    return { error: 'Invalid email or password' };
  }

  const valid = await bcrypt.compare(password, row.password_hash);

  if (!valid || !row.is_approved) {
    return { error: 'Invalid email or password' };
  }

  const user: User = {
    id: row.id,
    email: row.email,
    name: row.name,
    is_admin: Boolean(row.is_admin),
    is_approved: Boolean(row.is_approved),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };

  const token = await createToken(row.id);
  return { user, token };
}

export async function getUserById(id: string): Promise<User | null> {
  const row = await queryOne<UserRow>(
    'SELECT id, email, name, is_admin, is_approved, created_at, updated_at FROM users WHERE id = :id',
    { id }
  );

  if (!row) return null;

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    is_admin: Boolean(row.is_admin),
    is_approved: Boolean(row.is_approved),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}
