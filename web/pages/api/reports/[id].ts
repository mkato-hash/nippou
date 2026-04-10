import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import prisma from '../../../lib/prisma';

interface AuthRequest extends NextApiRequest {
  userId?: string;
  userRole?: string;
}

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

  const { id } = req.query;

  if (req.method === 'GET') {
    // Get report detail
    try {
      const report = await prisma.report.findUnique({
        where: { id: id as string },
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

      // Check permission (owner or mentor)
      if (req.userId !== report.userId && req.userRole !== 'MENTOR') {
        return res.status(403).json({ error: 'You do not have permission to access this report' });
      }

      res.json(report);
    } catch (error) {
      console.error('Get report error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'PATCH') {
    // Mark as read (mentor)
    try {
      if (req.userRole !== 'MENTOR') {
        return res.status(403).json({ error: 'You do not have permission' });
      }

      const report = await prisma.report.update({
        where: { id: id as string },
        data: { isRead: true },
      });

      res.json(report);
    } catch (error) {
      console.error('Update report error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
