import { NextRequest, NextResponse } from 'next/server';
import { withAuth, withIdempotency, withValidation, type ApiContext } from '@/lib/api-handler';
import { createLoanSchema, type CreateLoanInput } from '@/lib/schemas';
import prisma from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import logger from '@/lib/logger';

type TxClient = Prisma.TransactionClient;

/**
 * GET /api/loans — List loans for authenticated user (or all for admins)
 */
export const GET = withAuth(
  async (req: NextRequest, ctx: ApiContext) => {
    try {
      const isAdmin = ['super_admin', 'finance_admin', 'compliance_officer'].includes(ctx.user.role);
      const loans = await prisma.loan.findMany({
        where: isAdmin ? {} : { userId: ctx.user.sub },
        include: {
          bike: { select: { name: true, brand: true, price: true, images: true } },
          guarantors: true,
          repayments: { orderBy: { dueDate: 'asc' } },
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json({ success: true, data: loans });
    } catch (error) {
      logger.error({ error }, 'Failed to fetch loans');
      return NextResponse.json({ error: 'Failed to fetch loans' }, { status: 500 });
    }
  }
);

/**
 * POST /api/loans — Submit a new BNPL application
 */
export const POST = withAuth(
  withIdempotency(
    withValidation(
      createLoanSchema,
      async (req: NextRequest, ctx: ApiContext & { validatedBody: CreateLoanInput }) => {
        const log = logger.child({ requestId: ctx.requestId, route: 'loans' });
        const data = ctx.validatedBody;

        try {
          // ---- Create loan in a transaction ----
          const result = await prisma.$transaction(async (tx: TxClient) => {
            // Create the loan
            const loan = await tx.loan.create({
              data: {
                userId: ctx.user.sub,
                bikeId: data.bikeId,
                downPayment: data.downPayment,
                loanAmount: data.loanAmount,
                interestRate: data.interestRate,
                serviceFee: data.serviceFee,
                tenure: data.tenure,
                monthlyRepayment: data.monthlyRepayment,
                totalRepayable: data.totalRepayable,
                status: 'under_review',
                kycVerified: false,
                guarantorsVerified: false,
              },
            });

            // Update user profile with financial data if provided
            const userUpdate: Record<string, unknown> = {
              customerStatus: 'bnpl_applicant',
            };
            if (data.dateOfBirth) userUpdate.dateOfBirth = new Date(data.dateOfBirth);
            if (data.address) userUpdate.address = data.address;
            if (data.state) userUpdate.state = data.state;
            if (data.city) userUpdate.city = data.city;
            if (data.employmentStatus) userUpdate.employmentStatus = data.employmentStatus;
            if (data.monthlyIncome) userUpdate.monthlyIncome = data.monthlyIncome;
            if (data.employerName) userUpdate.employerName = data.employerName;
            if (data.employerAddress) userUpdate.employerAddress = data.employerAddress;
            if (data.bvn) userUpdate.bvn = data.bvn;
            if (data.ninNumber) userUpdate.ninNumber = data.ninNumber;
            if (data.bankName) userUpdate.bankName = data.bankName;
            if (data.bankAccountNumber) userUpdate.bankAccountNumber = data.bankAccountNumber;
            if (data.bankAccountName) userUpdate.bankAccountName = data.bankAccountName;

            await tx.user.update({
              where: { id: ctx.user.sub },
              data: userUpdate,
            });

            // Create guarantors
            if (data.guarantors?.length) {
              await tx.guarantor.createMany({
                data: data.guarantors.map((g) => ({
                  loanId: loan.id,
                  applicantUserId: ctx.user.sub,
                  fullName: g.fullName,
                  email: g.email || null,
                  phone: g.phone,
                  relationship: g.relationship,
                  status: 'invited',
                })),
              });
            }

            // Create KYC documents references
            if (data.documents?.length) {
              await tx.kycDocument.createMany({
                data: data.documents.map((d) => ({
                  userId: ctx.user.sub,
                  loanId: loan.id,
                  type: d.type,
                  fileUrl: d.fileUrl,
                  fileName: d.fileName,
                  verificationStatus: 'pending',
                })),
              });
            }

            return loan;
          });

          log.info({ loanId: result.id }, 'BNPL application submitted');

          return NextResponse.json(
            { success: true, loanId: result.id, message: 'Application submitted for review' },
            { status: 201 }
          );
        } catch (error) {
          log.error({ error }, 'Loan submission error');
          return NextResponse.json({ error: 'Failed to submit BNPL application' }, { status: 500 });
        }
      }
    )
  )
);
