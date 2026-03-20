// ============================================================
// Authentication Utilities
// - Access token (JWT, 15 min) + Refresh token (opaque, 7 days)
// - Password hashing with bcrypt (cost 12)
// - Refresh token rotation with family-based reuse detection
// ============================================================
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import prisma from './prisma';

// ---- Configuration ----

const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-me';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me';
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY || '15m';
const REFRESH_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in ms
const BCRYPT_ROUNDS = 12;

// ---- Types ----

export interface JwtPayload {
  sub: string;      // user ID
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

// ---- Password Hashing ----

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ---- Access Token ----

export function generateAccessToken(user: { id: string; email: string; role: string }): string {
  return jwt.sign(
    { sub: user.id, email: user.email, role: user.role },
    ACCESS_SECRET,
    { expiresIn: 15 * 60 }
  );
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
}

// ---- Refresh Token ----

/**
 * Generate a cryptographically random refresh token, hash it, and store in DB.
 * Returns the raw (unhashed) token for the client.
 */
export async function generateRefreshToken(userId: string, familyId?: string): Promise<string> {
  const rawToken = crypto.randomBytes(64).toString('hex');
  const tokenHash = await bcrypt.hash(rawToken, 10);
  const family = familyId || crypto.randomUUID();

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      familyId: family,
      expiresAt: new Date(Date.now() + REFRESH_EXPIRY_MS),
    },
  });

  // Encode userId and familyId into the token so we can look it up
  return `${userId}.${family}.${rawToken}`;
}

/**
 * Rotate a refresh token: validate the old one, revoke it, issue a new one.
 * If a revoked token is reused, the entire family is invalidated (security).
 */
export async function rotateRefreshToken(rawRefreshToken: string): Promise<TokenPair | null> {
  const parts = rawRefreshToken.split('.');
  if (parts.length !== 3) return null;

  const [userId, familyId, tokenValue] = parts;

  // Find all tokens in this family for this user
  const tokens = await prisma.refreshToken.findMany({
    where: { userId, familyId },
    orderBy: { createdAt: 'desc' },
  });

  if (tokens.length === 0) return null;

  // Check if the token matches any non-revoked token
  let matchedToken = null;
  for (const t of tokens) {
    if (!t.revoked && new Date() < t.expiresAt) {
      const isMatch = await bcrypt.compare(tokenValue, t.tokenHash);
      if (isMatch) {
        matchedToken = t;
        break;
      }
    }
  }

  if (!matchedToken) {
    // Possible reuse attack — revoke entire family
    const hasRevokedMatch = await Promise.any(
      tokens.filter(t => t.revoked).map(async t => bcrypt.compare(tokenValue, t.tokenHash))
    ).catch(() => false);

    if (hasRevokedMatch) {
      await prisma.refreshToken.updateMany({
        where: { familyId },
        data: { revoked: true },
      });
    }
    return null;
  }

  // Revoke the old token
  await prisma.refreshToken.update({
    where: { id: matchedToken.id },
    data: { revoked: true },
  });

  // Fetch user for new access token
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return null;

  // Issue new pair
  const accessToken = generateAccessToken({ id: user.id, email: user.email, role: user.role });
  const refreshToken = await generateRefreshToken(userId, familyId);

  return { accessToken, refreshToken };
}

/**
 * Revoke all refresh tokens in a family (used on logout).
 */
export async function revokeTokenFamily(userId: string, familyId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, familyId },
    data: { revoked: true },
  });
}

/**
 * Revoke ALL refresh tokens for a user (password change, account compromise).
 */
export async function revokeAllUserTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId },
    data: { revoked: true },
  });
}

/**
 * Extract bearer token from Authorization header.
 */
export function extractBearerToken(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}
