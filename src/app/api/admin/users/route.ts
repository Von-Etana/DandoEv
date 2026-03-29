import { NextRequest, NextResponse } from 'next/server';
import { withRoles, type ApiContext } from '@/lib/api-handler';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';
import { UserRole, CustomerStatus, KycStatus } from '@prisma/client';

/**
 * GET /api/admin/users — List and filter users
 */
export const GET = withRoles(
  ['super_admin', 'compliance_officer', 'finance_admin'],
  async (req: NextRequest, ctx: ApiContext) => {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const role = searchParams.get('role') as UserRole | null;
    const customerStatus = searchParams.get('customerStatus') as CustomerStatus | null;
    const kycStatus = searchParams.get('kycStatus') as KycStatus | null;
    const search = searchParams.get('search') || '';

    const skip = (page - 1) * limit;

    try {
      const where: any = {};
      if (role) where.role = role;
      if (customerStatus) where.customerStatus = customerStatus;
      if (kycStatus) where.kycStatus = kycStatus;
      if (search) {
        where.OR = [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            email: true,
            phone: true,
            firstName: true,
            lastName: true,
            role: true,
            customerStatus: true,
            kycStatus: true,
            createdAt: true,
            monoStatus: true,
          },
        }),
        prisma.user.count({ where }),
      ]);

      return NextResponse.json({
        success: true,
        data: users,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      logger.error({ error }, 'Failed to fetch admin users');
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
  }
);
