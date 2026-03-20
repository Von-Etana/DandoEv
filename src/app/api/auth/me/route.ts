import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken, extractBearerToken } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Try Bearer token first, then cookie fallback
    const authHeader = req.headers.get('authorization');
    const token = extractBearerToken(authHeader) || req.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        customerStatus: true,
        kycStatus: true,
        profileImageUrl: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }
}
