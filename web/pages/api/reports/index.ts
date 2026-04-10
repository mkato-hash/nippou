import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

interface AuthRequest extends NextApiRequest {
  userId?: string;
  userRole?: string;
}

interface CreateReportRequest {
  trainingContent: string;
  progressStatus: string;
  problems: string;
  tomorrowPlan: string;
}

// Middleware to authenticate
function authenticate(req: AuthRequest, res: NextApiResponse): boolean {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'No authorization token' });
    return false;
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    return true;
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
    return false;
  }
}

export default async function handler(req: AuthRequest, res: NextApiResponse) {
  if (!authenticate(req, res)) {
    return;
  }

  if (req.method === 'POST') {
    // Create report (trainee)
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
  } else if (req.method === 'GET') {
    // Get reports (mentor)
    try {
      if (req.userRole !== 'MENTOR') {
        return res.status(403).json({ error: 'You do not have permission to access this resource' });
      }

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
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
