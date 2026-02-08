import { NextRequest } from 'next/server';
import { verifyToken, getUserById, User } from './auth';

export async function requireAuth(request: NextRequest): Promise<{ user: User } | { error: string; status: number }> {
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    return { error: 'Authentication required', status: 401 };
  }

  const payload = await verifyToken(token);
  if (!payload) {
    return { error: 'Invalid or expired token', status: 401 };
  }

  const user = await getUserById(payload.userId);
  if (!user) {
    return { error: 'User not found', status: 401 };
  }

  return { user };
}

export async function requireAdmin(request: NextRequest): Promise<{ user: User } | { error: string; status: number }> {
  const result = await requireAuth(request);
  if ('error' in result) return result;

  if (!result.user.is_admin) {
    return { error: 'Admin access required', status: 403 };
  }

  return result;
}
