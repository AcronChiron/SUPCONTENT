import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { env } from '../config/env';
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from '../config/constants';
import { ApiError } from '../utils/ApiError';

export function generateTokens(userId: string, role: string) {
  const accessToken = jwt.sign({ userId, role }, env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign({ userId, role }, env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
  return { accessToken, refreshToken };
}

export async function registerUser(email: string, username: string, password: string) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
  });
  if (existing) {
    throw ApiError.conflict(existing.email === email ? 'Email already in use' : 'Username already taken');
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, username, passwordHash },
    select: { id: true, email: true, username: true, role: true, avatarUrl: true, createdAt: true },
  });

  const tokens = generateTokens(user.id, user.role);
  return { user, ...tokens };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) {
    throw ApiError.unauthorized('Invalid credentials');
  }
  if (user.isBanned) {
    throw ApiError.forbidden('Account is banned');
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw ApiError.unauthorized('Invalid credentials');
  }

  const tokens = generateTokens(user.id, user.role);
  return {
    user: { id: user.id, email: user.email, username: user.username, role: user.role, avatarUrl: user.avatarUrl },
    ...tokens,
  };
}

export async function refreshTokens(token: string) {
  try {
    const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as { userId: string; role: string };
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user || user.isBanned) {
      throw ApiError.unauthorized('Invalid refresh token');
    }
    return generateTokens(user.id, user.role);
  } catch {
    throw ApiError.unauthorized('Invalid refresh token');
  }
}

export async function findOrCreateOAuthUser(provider: string, profile: { email: string; name: string; avatarUrl?: string }) {
  let user = await prisma.user.findUnique({ where: { email: profile.email } });
  if (!user) {
    const username = profile.name.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 1000);
    user = await prisma.user.create({
      data: {
        email: profile.email,
        username,
        avatarUrl: profile.avatarUrl,
      },
    });
  }
  if (user.isBanned) {
    throw ApiError.forbidden('Account is banned');
  }
  return { user, ...generateTokens(user.id, user.role) };
}
