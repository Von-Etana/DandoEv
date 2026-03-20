import { NextRequest, NextResponse } from 'next/server';
import { withRoles, withValidation } from '@/lib/api-handler';
import { createBikeSchema } from '@/lib/schemas';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

// ---- GET: List all bikes for admin ----
const getHandler = async (req: NextRequest) => {
  try {
    const bikes = await prisma.bike.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(bikes);
  } catch (error) {
    logger.error({ error }, 'Failed to fetch bikes for admin');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
};

// ---- POST: Create New Bike ----
const postHandler = withValidation(createBikeSchema, async (req, ctx) => {
  const log = logger.child({ requestId: ctx.requestId, action: 'create_bike' });
  const data = ctx.validatedBody;

  try {
    const bike = await prisma.bike.create({
      data: {
        name: data.name,
        brand: data.brand,
        model: data.model || null,
        description: data.description || null,
        price: data.price, // Prisma Decimal converts automatically from number
        category: data.category || null,
        stockQuantity: data.stockQuantity,
        availability: data.availability,
        bnplEligible: data.bnplEligible,
        bnplMinDownPayment: data.bnplMinDownPayment,
        features: data.features || [],
        colors: data.colors || [],
        images: [], // Images can be uploaded separately via Supabase later
      },
    });

    log.info({ bikeId: bike.id }, 'Bike created successfully');

    // Optional: Log to audit_logs
    await prisma.auditLog.create({
      data: {
        userId: ctx.user.sub,
        action: 'CREATED_BIKE',
        resource: 'bike',
        resourceId: bike.id,
        details: `Created bike: ${bike.name}`,
      },
    });

    return NextResponse.json(bike, { status: 201 });
  } catch (error) {
    log.error({ error }, 'Failed to create bike');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

// Chain with Roles auth
export const GET = withRoles(['super_admin', 'operations_admin'], getHandler);
export const POST = withRoles(['super_admin', 'operations_admin'], postHandler);
