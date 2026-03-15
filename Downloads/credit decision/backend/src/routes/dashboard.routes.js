const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth.middleware');
const { getPrismaClient, getMongoModels } = require('../config/database');
const logger = require('../utils/logger');

// GET /dashboard/overview - Executive dashboard
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    const prisma = getPrismaClient();

    const [
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      totalExposure,
      avgScore,
      recentApplications
    ] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({ where: { status: 'PENDING' } }),
      prisma.application.count({ where: { status: 'APPROVED' } }),
      prisma.application.count({ where: { status: 'REJECTED' } }),
      prisma.application.aggregate({
        _sum: { loanAmount: true },
        where: { status: 'APPROVED' }
      }),
      prisma.application.aggregate({
        _avg: { finalScore: true },
        where: { finalScore: { not: null } }
      }),
      prisma.application.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          company: { select: { name: true, sector: true } }
        }
      })
    ]);

    const approvalRate = totalApplications > 0
      ? ((approvedApplications / totalApplications) * 100).toFixed(1)
      : 0;

    res.json({
      success: true,
      data: {
        summary: {
          totalApplications,
          pendingApplications,
          approvedApplications,
          rejectedApplications,
          totalExposure: totalExposure._sum.loanAmount || 0,
          averageScore: avgScore._avg.finalScore?.toFixed(1) || 'N/A',
          approvalRate: `${approvalRate}%`
        },
        recentApplications,
        trends: await getTrends(prisma)
      }
    });
  } catch (error) {
    logger.error('Error fetching dashboard overview:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch dashboard' }
    });
  }
});

// GET /dashboard/portfolio - Portfolio analytics
router.get('/portfolio', authenticateToken, async (req, res) => {
  try {
    const prisma = getPrismaClient();

    // Sector-wise exposure
    const sectorExposure = await prisma.application.groupBy({
      by: ['companyId'],
      where: { status: 'APPROVED' },
      _sum: { loanAmount: true }
    });

    // Get company sectors
    const companyIds = sectorExposure.map(s => s.companyId);
    const companies = await prisma.company.findMany({
      where: { id: { in: companyIds } },
      select: { id: true, sector: true }
    });

    // Aggregate by sector
    const sectorMap = {};
    sectorExposure.forEach(item => {
      const company = companies.find(c => c.id === item.companyId);
      const sector = company?.sector || 'UNKNOWN';
      sectorMap[sector] = (sectorMap[sector] || 0) + (item._sum.loanAmount || 0);
    });

    // Risk grade distribution
    const riskDistribution = await prisma.application.groupBy({
      by: ['riskGrade'],
      _count: { id: true },
      where: { riskGrade: { not: null } }
    });

    // Score distribution
    const scoreDistribution = await prisma.$queryRaw`
      SELECT 
        CASE 
          WHEN "finalScore" >= 85 THEN '85-100'
          WHEN "finalScore" >= 75 THEN '75-85'
          WHEN "finalScore" >= 65 THEN '65-75'
          WHEN "finalScore" >= 55 THEN '55-65'
          WHEN "finalScore" >= 45 THEN '45-55'
          ELSE '0-45'
        END as range,
        COUNT(*) as count
      FROM "Application"
      WHERE "finalScore" IS NOT NULL
      GROUP BY range
      ORDER BY range DESC
    `;

    res.json({
      success: true,
      data: {
        sectorExposure: Object.entries(sectorMap).map(([sector, amount]) => ({
          sector,
          amount
        })),
        riskDistribution: riskDistribution.map(r => ({
          grade: r.riskGrade,
          count: r._count.id
        })),
        scoreDistribution
      }
    });
  } catch (error) {
    logger.error('Error fetching portfolio analytics:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch portfolio' }
    });
  }
});

// GET /dashboard/performance - Team performance
router.get('/performance', authenticateToken, async (req, res) => {
  try {
    const prisma = getPrismaClient();

    // Application counts by assigned officer
    const officerPerformance = await prisma.application.groupBy({
      by: ['assignedTo'],
      _count: { id: true },
      _sum: { loanAmount: true },
      where: { assignedTo: { not: null } }
    });

    // Get officer details
    const officerIds = officerPerformance.map(o => o.assignedTo).filter(Boolean);
    const officers = await prisma.user.findMany({
      where: { id: { in: officerIds } },
      select: { id: true, name: true, department: true }
    });

    // Processing time analysis
    const processingTimes = await prisma.$queryRaw`
      SELECT 
        AVG(EXTRACT(DAY FROM ("decisionDate" - "createdAt"))) as avg_days,
        MIN(EXTRACT(DAY FROM ("decisionDate" - "createdAt"))) as min_days,
        MAX(EXTRACT(DAY FROM ("decisionDate" - "createdAt"))) as max_days
      FROM "Application"
      WHERE "decisionDate" IS NOT NULL
    `;

    res.json({
      success: true,
      data: {
        officerPerformance: officerPerformance.map(o => {
          const officer = officers.find(u => u.id === o.assignedTo);
          return {
            officerId: o.assignedTo,
            officerName: officer?.name || 'Unknown',
            department: officer?.department || 'N/A',
            applicationsProcessed: o._count.id,
            totalAmount: o._sum.loanAmount || 0
          };
        }),
        processingTimes: processingTimes[0] || { avg_days: 0, min_days: 0, max_days: 0 }
      }
    });
  } catch (error) {
    logger.error('Error fetching performance:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch performance' }
    });
  }
});

// GET /dashboard/pipeline - Application pipeline
router.get('/pipeline', authenticateToken, async (req, res) => {
  try {
    const prisma = getPrismaClient();

    // Stage-wise counts
    const stageCounts = await prisma.application.groupBy({
      by: ['stage'],
      _count: { id: true }
    });

    // Status-wise counts
    const statusCounts = await prisma.application.groupBy({
      by: ['status'],
      _count: { id: true }
    });

    // Priority breakdown
    const priorityCounts = await prisma.application.groupBy({
      by: ['priority'],
      _count: { id: true },
      where: { status: 'PENDING' }
    });

    // Pending more than 7 days
    const oldPending = await prisma.application.count({
      where: {
        status: 'PENDING',
        createdAt: { lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }
    });

    res.json({
      success: true,
      data: {
        stages: stageCounts.map(s => ({
          stage: s.stage,
          count: s._count.id
        })),
        statuses: statusCounts.map(s => ({
          status: s.status,
          count: s._count.id
        })),
        priorities: priorityCounts.map(p => ({
          priority: p.priority,
          count: p._count.id
        })),
        oldPending
      }
    });
  } catch (error) {
    logger.error('Error fetching pipeline:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch pipeline' }
    });
  }
});

// GET /analytics/turnaround-time - Processing time metrics
router.get('/analytics/turnaround-time', authenticateToken, async (req, res) => {
  try {
    const prisma = getPrismaClient();

    const { startDate, endDate } = req.query;
    const where = {};

    if (startDate || endDate) {
      where.decisionDate = {};
      if (startDate) where.decisionDate.gte = new Date(startDate);
      if (endDate) where.decisionDate.lte = new Date(endDate);
    }

    const metrics = await prisma.$queryRaw`
      SELECT 
        EXTRACT(MONTH FROM "decisionDate") as month,
        EXTRACT(YEAR FROM "decisionDate") as year,
        COUNT(*) as total,
        AVG(EXTRACT(DAY FROM ("decisionDate" - "createdAt"))) as avg_turnaround
      FROM "Application"
      WHERE "decisionDate" IS NOT NULL
      GROUP BY month, year
      ORDER BY year DESC, month DESC
      LIMIT 12
    `;

    res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('Error fetching turnaround time:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch turnaround metrics' }
    });
  }
});

// GET /analytics/score-distribution - Score distribution
router.get('/analytics/score-distribution', authenticateToken, async (req, res) => {
  try {
    const prisma = getPrismaClient();

    const distribution = await prisma.$queryRaw`
      SELECT 
        CASE 
          WHEN "finalScore" >= 85 THEN 'Excellent (85-100)'
          WHEN "finalScore" >= 75 THEN 'Good (75-85)'
          WHEN "finalScore" >= 65 THEN 'Acceptable (65-75)'
          WHEN "finalScore" >= 55 THEN 'Marginal (55-65)'
          WHEN "finalScore" >= 45 THEN 'Watchlist (45-55)'
          ELSE 'Reject (0-45)'
        END as category,
        COUNT(*) as count,
        AVG("loanAmount") as avg_amount
      FROM "Application"
      WHERE "finalScore" IS NOT NULL
      GROUP BY category
      ORDER BY category
    `;

    res.json({
      success: true,
      data: distribution
    });
  } catch (error) {
    logger.error('Error fetching score distribution:', error);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch score distribution' }
    });
  }
});

// Helper function to get trends
async function getTrends(prisma) {
  try {
    const last6Months = await prisma.$queryRaw`
      SELECT 
        TO_CHAR("createdAt", 'Mon YYYY') as month,
        COUNT(*) as applications,
        SUM(CASE WHEN status = 'APPROVED' THEN 1 ELSE 0 END) as approved,
        SUM("loanAmount") as exposure
      FROM "Application"
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR("createdAt", 'Mon YYYY'), DATE_TRUNC('month', "createdAt")
      ORDER BY DATE_TRUNC('month', "createdAt")
    `;

    return last6Months;
  } catch (error) {
    return [];
  }
}

module.exports = router;