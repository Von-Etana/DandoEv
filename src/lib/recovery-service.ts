import prisma from './prisma';
import logger from './logger';
import { enqueueNotification } from './queue';

/**
 * Service to manage defaulted loan recovery cases.
 */
export async function transitionRecoveryStage(
  caseId: string, 
  newStage: string, 
  actorId?: string, 
  notes?: string
) {
  const log = logger.child({ service: 'recovery-service', caseId, newStage });
  log.info('Transitioning recovery stage');

  try {
    const recoveryCase = await prisma.recoveryCase.update({
      where: { id: caseId },
      data: {
        stage: newStage as any,
        activities: {
          create: {
            action: `stage_transition`,
            actorId,
            notes: `Stage changed to ${newStage.replace('_', ' ')}. ${notes || ''}`
          }
        }
      },
      include: { loan: { include: { user: true } } }
    });

    // Handle stage-specific side effects
    switch (newStage) {
      case 'guarantor_escalation':
        await notifyGuarantorsOfEscalation(recoveryCase.loanId);
        break;
      case 'demand_letter':
        // logic to generate and send PDF
        break;
      case 'legal_action':
        await notifyBuyerOfLegalAction(recoveryCase.loan.userId);
        break;
    }

    return recoveryCase;
  } catch (error: any) {
    log.error({ error: error.message }, 'Failed to transition recovery stage');
    throw error;
  }
}

async function notifyGuarantorsOfEscalation(loanId: string) {
  const guarantors = await prisma.guarantor.findMany({
    where: { loanId, status: 'accepted' }
  });

  for (const g of guarantors) {
    await enqueueNotification({
      userId: g.applicantUserId, // Using applicantUserId for context
      type: 'recovery_guarantor_escalation',
      title: 'URGENT: Borrower Account Escalated',
      message: `As a guarantor, please be informed that the loan account for which you stood surety has been escalated. Please contact the borrower immediately to resolve this.`,
      channels: ['email', 'whatsapp', 'sms']
    });
  }
}

async function notifyBuyerOfLegalAction(userId: string) {
  await enqueueNotification({
    userId,
    type: 'recovery_legal_action',
    title: 'NOTICE OF LEGAL ACTION ⚖️',
    message: `Your account has been moved to our legal recovery department. Continued failure to settle will result in further legal proceedings.`,
    channels: ['email', 'whatsapp', 'sms']
  });
}
