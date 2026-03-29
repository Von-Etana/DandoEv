import { NextRequest, NextResponse } from 'next/server';
import { withAuth, type ApiContext } from '@/lib/api-handler';
import { uploadFile } from '@/lib/storage';
import prisma from '@/lib/prisma';
import logger from '@/lib/logger';
import { DocumentType } from '@prisma/client';

/**
 * POST /api/kyc/upload-base64
 * Body: { base64: "...", type: "national_id" }
 */
export const POST = withAuth(async (req: NextRequest, ctx: ApiContext) => {
  const userId = ctx.user.sub;
  const log = logger.child({ route: 'kyc/upload-base64', userId });

  try {
    const { base64, type, loanId } = await req.json();

    if (!base64 || !type) {
      return NextResponse.json({ error: 'Base64 data and document type are required' }, { status: 400 });
    }

    // 1. Clean up base64 prefix if exists (e.g. "data:image/png;base64,")
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    // 2. Upload to storage
    const fileName = `${userId}_${type}_${Date.now()}`;
    const uploadResult = await uploadFile(buffer, 'kyc-documents', fileName);

    // 3. Create KycDocument record
    const kycDoc = await prisma.kycDocument.create({
      data: {
        userId,
        loanId,
        type: type as DocumentType,
        fileUrl: uploadResult.url,
        fileName: fileName,
        verificationStatus: 'pending'
      }
    });

    log.info({ docId: kycDoc.id, type: kycDoc.type }, 'Mobile KYC document uploaded successfully');
    return NextResponse.json({
      success: true,
      data: kycDoc
    });

  } catch (error: any) {
    log.error({ error: error.message }, 'Failed to upload mobile KYC document');
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
});
