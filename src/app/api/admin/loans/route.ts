import { NextRequest, NextResponse } from 'next/server';
import { withRoles, type ApiContext } from '@/lib/api-handler';
import prisma from '@/lib/prisma';

/**
 * GET /api/admin/loans — List all loan applications for admin review
 */
export const GET = withRoles(
  ['super_admin', 'finance_admin', 'compliance_officer'],
  async (req: NextRequest, ctx: ApiContext) => {
    try {
      const url = new URL(req.url);
      const status = url.searchParams.get('status');
      const search = url.searchParams.get('search');
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      const skip = (page - 1) * limit;

      const where: any = {};
      if (status) where.status = status;
      if (search) {
        where.OR = [
          { user: { firstName: { contains: search, mode: 'insensitive' } } },
          { user: { lastName: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { user: { phone: { contains: search, mode: 'insensitive' } } },
        ];
      }

      const [loans, total] = await Promise.all([
        prisma.loan.findMany({
          where,
          include: {
            user: {
              select: {
                id: true, firstName: true, lastName: true, email: true,
                phone: true, kycStatus: true, customerStatus: true,
              },
            },
            bike: { select: { name: true, brand: true, price: true } },
            guarantors: true,
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: limit,
        }),
        prisma.loan.count({ where }),
      ]);

      return NextResponse.json({
        success: true,
        data: loans,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      return NextResponse.json({ error: 'Failed to fetch loans' }, { status: 500 });
    }
  }
);
