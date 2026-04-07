import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { REFRESH_TOKEN_MAX_AGE } from '../config/constants';
import { env } from '../config/env';
import * as authService from '../services/auth';
import { ApiError } from '../utils/ApiError';

function requireOAuth(provider: 'google' | 'github') {
  if (provider === 'google' && (!env.OAUTH_GOOGLE_CLIENT_ID || !env.OAUTH_GOOGLE_CLIENT_SECRET)) {
    throw new ApiError(503, 'Google OAuth is not configured on this server');
  }
  if (provider === 'github' && (!env.OAUTH_GITHUB_CLIENT_ID || !env.OAUTH_GITHUB_CLIENT_SECRET)) {
    throw new ApiError(503, 'GitHub OAuth is not configured on this server');
  }
}

const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  password: z.string().min(8).max(128),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

function setRefreshCookie(res: Response, token: string) {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: REFRESH_TOKEN_MAX_AGE,
    path: '/api/v1/auth',
  });
}

export const register = asyncHandler(async (req: Request, res: Response) => {
  const data = registerSchema.parse(req.body);
  const result = await authService.registerUser(data.email, data.username, data.password);
  setRefreshCookie(res, result.refreshToken);
  res.status(201).json({ user: result.user, accessToken: result.accessToken });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const data = loginSchema.parse(req.body);
  const result = await authService.loginUser(data.email, data.password);
  setRefreshCookie(res, result.refreshToken);
  res.json({ user: result.user, accessToken: result.accessToken });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.refreshToken;
  if (!token) return res.status(401).json({ error: 'No refresh token' });
  const tokens = await authService.refreshTokens(token);
  setRefreshCookie(res, tokens.refreshToken);
  res.json({ accessToken: tokens.accessToken });
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  res.clearCookie('refreshToken', { path: '/api/v1/auth' });
  res.json({ message: 'Logged out' });
});

export const oauthGoogle = asyncHandler(async (_req: Request, res: Response) => {
  requireOAuth('google');
  const params = new URLSearchParams({
    client_id: env.OAUTH_GOOGLE_CLIENT_ID,
    redirect_uri: `${env.CLIENT_WEB_URL}/auth/oauth/google/callback`,
    response_type: 'code',
    scope: 'openid email profile',
  });
  res.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

export const oauthGoogleCallback = asyncHandler(async (req: Request, res: Response) => {
  requireOAuth('google');
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'Missing code' });

  // Exchange code for tokens
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code,
      client_id: env.OAUTH_GOOGLE_CLIENT_ID,
      client_secret: env.OAUTH_GOOGLE_CLIENT_SECRET,
      redirect_uri: `${env.CLIENT_WEB_URL}/auth/oauth/google/callback`,
      grant_type: 'authorization_code',
    }),
  });
  const tokenData = await tokenRes.json() as any;

  // Get user info
  const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const profile = await userRes.json() as any;

  const result = await authService.findOrCreateOAuthUser('google', {
    email: profile.email,
    name: profile.name,
    avatarUrl: profile.picture,
  });

  setRefreshCookie(res, result.refreshToken);
  res.redirect(`${env.CLIENT_WEB_URL}/auth/callback?token=${result.accessToken}`);
});

export const oauthGithub = asyncHandler(async (_req: Request, res: Response) => {
  requireOAuth('github');
  const params = new URLSearchParams({
    client_id: env.OAUTH_GITHUB_CLIENT_ID,
    scope: 'user:email',
  });
  res.redirect(`https://github.com/login/oauth/authorize?${params}`);
});

export const oauthGithubCallback = asyncHandler(async (req: Request, res: Response) => {
  requireOAuth('github');
  const { code } = req.query;
  if (!code) return res.status(400).json({ error: 'Missing code' });

  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: env.OAUTH_GITHUB_CLIENT_ID,
      client_secret: env.OAUTH_GITHUB_CLIENT_SECRET,
      code,
    }),
  });
  const tokenData = await tokenRes.json() as any;

  const userRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const profile = await userRes.json() as any;

  const emailRes = await fetch('https://api.github.com/user/emails', {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const emails = await emailRes.json() as any[];
  const primaryEmail = emails.find((e: any) => e.primary)?.email || profile.email;

  const result = await authService.findOrCreateOAuthUser('github', {
    email: primaryEmail,
    name: profile.login,
    avatarUrl: profile.avatar_url,
  });

  setRefreshCookie(res, result.refreshToken);
  res.redirect(`${env.CLIENT_WEB_URL}/auth/callback?token=${result.accessToken}`);
});
