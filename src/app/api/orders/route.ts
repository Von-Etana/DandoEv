import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withIdempotency, withValidation, type ApiContext } from '@/lib/api-handler';
import { createOrderSchema, type CreateOrderInput } from '@/lib/schemas';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import logger from '@/lib/logger';

type TxClient = Prisma.TransactionClient;

/**
 * GET /api/orders — List orders for authenticated user (or all for admins)
 */
export const GET = withAuth(
  async (req: NextRequest, ctx: ApiContext) => {
    try {
      const isAdmin = ['super_admin', 'operations_admin'].includes(ctx.user.role);
      const orders = await prisma.order.findMany({
        where: isAdmin ? {} : { userId: ctx.user.sub },
        include: {
          bike: { select: { name: true, brand: true, images: true } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ success: true, data: orders });
    } catch (error) {
      logger.error({ error }, 'Failed to fetch orders');
      return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
  }
);

/**
 * POST /api/orders — Create a new order
 */
export const POST = withAuth(
  withIdempotency(
    withValidation(
      createOrderSchema,
      async (req: NextRequest, ctx: ApiContext & { validatedBody: CreateOrderInput }) => {
        const log = logger.child({ requestId: ctx.requestId, route: 'orders' });
        const data = ctx.validatedBody;

        try {
          // ---- Verify bike exists and is in stock ----
          const bike = await prisma.bike.findUnique({
            where: { id: data.bikeId },
          });

          if (!bike) {
            return NextResponse.json({ error: 'Bike not found' }, { status: 404 });
          }

          if (bike.availability !== 'in_stock' || bike.stockQuantity < data.quantity) {
            return NextResponse.json({ error: 'Bike is not available in the requested quantity' }, { status: 409 });
          }

          // ---- Create order in a transaction ----
          const order = await prisma.$transaction(async (tx: TxClient) => {
            const unitPrice = Number(bike.price);
            const totalAmount = unitPrice * data.quantity;

            const newOrder = await tx.order.create({
              data: {
                userId: ctx.user.sub,
                bikeId: data.bikeId,
                quantity: data.quantity,
                unitPrice,
                totalAmount,
                paymentMethod: data.paymentMethod,
                status: 'pending',
                deliveryAddress: data.deliveryAddress,
                deliveryCity: data.deliveryCity,
                deliveryState: data.deliveryState,
                deliveryPhone: data.deliveryPhone,
                loanId: data.loanId || null,
                notes: data.notes || null,
              },
            });

            // Decrement stock
            await tx.bike.update({
              where: { id: data.bikeId },
              data: { stockQuantity: { decrement: data.quantity } },
            });

            return newOrder;
          });

          log.info({ orderId: order.id }, 'Order created');

          return NextResponse.json(
            { success: true, orderId: order.id, message: 'Order created successfully' },
            { status: 201 }
          );
        } catch (error) {
          log.error({ error }, 'Order creation error');
          return NextResponse.json({ error: 'Failed to process order' }, { status: 500 });
        }
      }
    )
  )
);
