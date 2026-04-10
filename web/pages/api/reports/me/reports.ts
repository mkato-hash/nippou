import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import prisma from '../../../../lib/prisma';

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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!authenticate(req, res)) {
    return;
  }

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
}
