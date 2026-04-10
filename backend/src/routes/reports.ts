import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorizeMentor, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

interface CreateReportRequest {
  trainingContent: string;
  progressStatus: string;
  problems: string;
  tomorrowPlan: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
}

interface AddCommentRequest {
  content: string;
}

// 日報提出（新人）
router.post('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { trainingContent, progressStatus, problems, tomorrowPlan } = req.body as CreateReportRequest;

    if (!trainingContent || !progressStatus || !problems || !tomorrowPlan) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const report = await prisma.report.create({
      data: {
        userId: req.userId!,
        trainingContent,
        progressStatus,
        problems,
        tomorrowPlan,
      },
    });

    res.status(201).json(report);
  } catch (error) {
    console.error('Create report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 日報一覧取得（メンター）
router.get('/', authenticate, authorizeMentor, async (req: AuthRequest, res: Response) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    res.json(reports);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 日報詳細取得
router.get('/:id', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const report = await prisma.report.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // 本人かメンターのみ閲覧可能
    if (req.userId !== report.userId && req.userRole !== 'MENTOR') {
      return res.status(403).json({ error: 'You do not have permission to access this report' });
    }

    res.json(report);
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 既読マーク（メンター）
router.patch('/:id/read', authenticate, authorizeMentor, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const report = await prisma.report.update({
      where: { id },
      data: { isRead: true },
    });

    res.json(report);
  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 自分の日報一覧取得（新人）
router.get('/me/reports', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const reports = await prisma.report.findMany({
      where: { userId: req.userId },
      orderBy: { submittedAt: 'desc' },
    });

    res.json(reports);
  } catch (error) {
    console.error('Get my reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// コメント追加（メンター）
router.post('/:id/comments', authenticate, authorizeMentor, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body as AddCommentRequest;

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Comment content is required' });
    }

    const report = await prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    const comments: Comment[] = JSON.parse(report.comments || '[]');
    const newComment: Comment = {
      id: Math.random().toString(36).substring(7),
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };

    comments.push(newComment);

    const updatedReport = await prisma.report.update({
      where: { id },
      data: { comments: JSON.stringify(comments) },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.status(201).json({
      report: updatedReport,
      comment: newComment,
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
