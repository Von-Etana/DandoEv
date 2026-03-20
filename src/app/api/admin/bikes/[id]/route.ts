import { NextRequest, NextResponse } from 'next/server';
import { withRoles, withValidation } from '@/lib/api-handler';
import { updateBikeSchema } from '@/lib/schemas';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

// ---- PUT: Update Bike ----
const putHandler = withValidation(updateBikeSchema, async (req, ctx) => {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop()!; // Extracts 'id' from path
  const data = ctx.validatedBody;
  const log = logger.child({ requestId: ctx.requestId, action: 'update_bike', bikeId: id });

  try {
    // Check if bike exists
    const existing = await prisma.bike.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Bike not found' }, { status: 404 });
    }

    const updated = await prisma.bike.update({
      where: { id },
      data: {
        name: data.name,
        brand: data.brand,
        model: data.model !== undefined ? data.model : undefined,
        description: data.description !== undefined ? data.description : undefined,
        price: data.price !== undefined ? data.price : undefined,
        category: data.category !== undefined ? data.category : undefined,
        stockQuantity: data.stockQuantity !== undefined ? data.stockQuantity : undefined,
        availability: data.availability !== undefined ? data.availability : undefined,
        bnplEligible: data.bnplEligible !== undefined ? data.bnplEligible : undefined,
        bnplMinDownPayment: data.bnplMinDownPayment !== undefined ? data.bnplMinDownPayment : undefined,
        features: data.features !== undefined ? data.features : undefined,
        colors: data.colors !== undefined ? data.colors : undefined,
      },
    });

    log.info('Bike updated successfully');

    await prisma.auditLog.create({
      data: {
        userId: ctx.user.sub,
        action: 'UPDATED_BIKE',
        resource: 'bike',
        resourceId: id,
        details: `Updated bike: ${updated.name}`,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    log.error({ error }, 'Failed to update bike');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

// ---- DELETE: Remove Bike ----
const deleteHandler = async (req: NextRequest) => {
  const url = new URL(req.url);
  const id = url.pathname.split('/').pop()!; // Extracts 'id' from path
  // Since we don't use withValidation here, we don't automatically get `ctx.user.sub` from withRoles without wrapping it
  // However withRoles passes req, and CAN pass ctx if we chain together.
  return withRoles(['super_admin', 'operations_admin'], async (req, ctx) => {
      const log = logger.child({ requestId: ctx.requestId, action: 'delete_bike', bikeId: id });
    try {
        const existing = await prisma.bike.findUnique({ where: { id } });
        if (!existing) {
          return NextResponse.json({ error: 'Bike not found' }, { status: 404 });
        }

        await prisma.bike.delete({ where: { id } });
        log.info('Bike deleted successfully');

        await prisma.auditLog.create({
          data: {
            userId: ctx.user.sub,
            action: 'DELETED_BIKE',
            resource: 'bike',
            resourceId: id,
            details: `Deleted bike: ${existing.name}`,
          },
        });

        return NextResponse.json({ success: true, message: 'Bike deleted' });
      } catch (error) {
        log.error({ error }, 'Failed to delete bike');
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
      }
  })(req);
};

export const PUT = withRoles(['super_admin', 'operations_admin'], putHandler);
export const DELETE = deleteHandler; // Wrapped inside internally
