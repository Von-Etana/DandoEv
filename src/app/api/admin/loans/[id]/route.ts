import { NextRequest, NextResponse } from 'next/server';
import { withRoles, withValidation, type ApiContext } from '@/lib/api-handler';
import { loanActionSchema, type LoanActionInput } from '@/lib/schemas';
import { enqueueNotification } from '@/lib/queue';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

// ---- Valid state transitions ----
const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ['under_review', 'rejected'],
  under_review: ['approved', 'rejected'],
  approved: ['active', 'rejected'],
  active: ['completed', 'defaulted'],
};

/**
 * GET /api/admin/loans/[id] — Get single loan details
 */
export const GET = withRoles(
  ['super_admin', 'finance_admin', 'compliance_officer'],
  async (req: NextRequest, ctx: ApiContext) => {
    const id = req.nextUrl.pathname.split('/').pop()!;

    const loan = await prisma.loan.findUnique({
      where: { id },
      include: {
        user: true,
        bike: true,
        guarantors: true,
        repayments: { orderBy: { dueDate: 'asc' } },
        documents: true,
      },
    });

    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: loan });
  }
);

/**
 * PATCH /api/admin/loans/[id] — Approve or reject a loan application
 * Enforces state machine transitions.
 */
export const PATCH = withRoles(
  ['super_admin', 'finance_admin'],
  withValidation(
    loanActionSchema,
    async (req: NextRequest, ctx: ApiContext & { validatedBody: LoanActionInput }) => {
      const log = logger.child({ requestId: ctx.requestId, route: 'admin/loans/[id]' });
      const id = req.nextUrl.pathname.split('/').pop()!;
      const { action, adminNotes, rejectionReason } = ctx.validatedBody;

      try {
        const loan = await prisma.loan.findUnique({
          where: { id },
          include: { user: true },
        });

        if (!loan) {
          return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
        }

        // ---- Enforce state transitions ----
        const targetStatus = action === 'approve' ? 'approved' : 'rejected';
        const allowed = ALLOWED_TRANSITIONS[loan.status];

        if (!allowed || !allowed.includes(targetStatus)) {
          return NextResponse.json(
            {
              error: `Invalid state transition: ${loan.status} → ${targetStatus}`,
              allowedTransitions: allowed || [],
            },
            { status: 409 }
          );
        }

        // ---- Update loan ----
        const updatedLoan = await prisma.loan.update({
          where: { id },
          data: {
            status: targetStatus,
            adminNotes,
            rejectionReason: action === 'reject' ? rejectionReason : null,
            approvedBy: action === 'approve' ? ctx.user.sub : null,
            approvedAt: action === 'approve' ? new Date() : null,
          },
        });

        // ---- Audit log ----
        await prisma.auditLog.create({
          data: {
            userId: ctx.user.sub,
            action: `loan_${action}`,
            resource: 'loan',
            resourceId: id,
            details: `Loan ${action}ed. ${adminNotes || ''}`.trim(),
          },
        });

        // ---- Notify applicant ----
        const notificationType = action === 'approve' ? 'loan_approved' : 'loan_rejected';
        const notificationTitle = action === 'approve' ? 'Loan Approved! 🎉' : 'Loan Application Update';
        const notificationMessage = action === 'approve'
          ? 'Your BNPL application has been approved. Your bike will be processed for delivery.'
          : `Your BNPL application was not approved. ${rejectionReason || 'Please contact support for details.'}`;

        await enqueueNotification({
          userId: loan.userId,
          type: notificationType,
          title: notificationTitle,
          message: notificationMessage,
          channels: ['email', 'push'],
        });

        log.info({ loanId: id, action, by: ctx.user.sub }, `Loan ${action}ed`);

        return NextResponse.json({
          success: true,
          message: `Loan ${action}ed successfully`,
          data: updatedLoan,
        });
      } catch (error) {
        log.error({ error, loanId: id }, 'Loan action error');
        return NextResponse.json({ error: 'Failed to process loan action' }, { status: 500 });
      }
    }
  )
);
