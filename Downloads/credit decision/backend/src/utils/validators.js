const logger = require('../utils/logger');

/**
 * Safe database transaction handler
 * Ensures atomicity of multi-step operations
 */
async function withTransaction(prisma, callback) {
    const tx = await prisma.$transaction(async (tx) => {
        try {
            const result = await callback(tx);
            return result;
        } catch (error) {
            logger.error('Transaction error:', error);
            throw error;
        }
    });
    return tx;
}

/**
 * Validate application state transitions
 */
const ApplicationStatusFlow = {
    DRAFT: ['SUBMITTED', 'REJECTED'],
    SUBMITTED: ['UNDER_REVIEW', 'REJECTED', 'MORE_INFO_REQUIRED'],
    MORE_INFO_REQUIRED: ['SUBMITTED', 'REJECTED'],
    UNDER_REVIEW: ['APPROVED', 'REJECTED', 'MORE_INFO_REQUIRED'],
    APPROVED: ['SANCTIONED', 'REJECTED'],
    SANCTIONED: ['DISBURSED', 'CANCELLED'],
    DISBURSED: [],
    REJECTED: [],
    CANCELLED: []
};

/**
 * Validate if status transition is allowed
 */
function canTransitionStatus(currentStatus, newStatus) {
    if (!ApplicationStatusFlow[currentStatus]) {
        return false;
    }
    return ApplicationStatusFlow[currentStatus].includes(newStatus);
}

/**
 * Get all valid next statuses for current status
 */
function getValidNextStatuses(currentStatus) {
    return ApplicationStatusFlow[currentStatus] || [];
}

/**
 * Application stage progression
 */
const ApplicationStages = {
    INTAKE: 1,
    DOCUMENT_COLLECTION: 2,
    KYC_VERIFICATION: 3,
    SCORING: 4,
    CREDIT_APPRAISAL: 5,
    COMMITTEE_APPROVAL: 6,
    SANCTIONING: 7,
    DISBURSEMENT: 8
};

/**
 * Get stage details
 */
function getStageInfo(stageKey) {
    const stages = {
        INTAKE: {
            order: 1,
            name: 'Intake',
            description: 'Application intake and initial screening'
        },
        DOCUMENT_COLLECTION: {
            order: 2,
            name: 'Document Collection',
            description: 'Collect and verify supporting documents'
        },
        KYC_VERIFICATION: {
            order: 3,
            name: 'KYC Verification',
            description: 'Know Your Customer verification'
        },
        SCORING: {
            order: 4,
            name: 'Scoring',
            description: 'Risk scoring and financial analysis'
        },
        CREDIT_APPRAISAL: {
            order: 5,
            name: 'Credit Appraisal',
            description: 'Detailed credit appraisal and memo generation'
        },
        COMMITTEE_APPROVAL: {
            order: 6,
            name: 'Committee Approval',
            description: 'Credit committee review and approval'
        },
        SANCTIONING: {
            order: 7,
            name: 'Sanctioning',
            description: 'Loan sanctioning and offer generation'
        },
        DISBURSEMENT: {
            order: 8,
            name: 'Disbursement',
            description: 'Fund disbursement'
        }
    };
    return stages[stageKey] || null;
}

/**
 * Calculate application completion percentage
 */
function getCompletionPercentage(currentStage) {
    const stageInfo = getStageInfo(currentStage);
    if (!stageInfo) return 0;
    return Math.round((stageInfo.order / Object.keys(ApplicationStages).length) * 100);
}

module.exports = {
    withTransaction,
    ApplicationStatusFlow,
    canTransitionStatus,
    getValidNextStatuses,
    ApplicationStages,
    getStageInfo,
    getCompletionPercentage
};
