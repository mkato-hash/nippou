import type { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import prisma from '../../../../lib/prisma';

interface AuthRequest extends NextApiRequest {
  userId?: string;
  userRole?: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
}

interface AddCommentRequest {
  content: string;
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

  if (req.method === 'POST') {
    // Add comment (mentor)
    try {
      if (req.userRole !== 'MENTOR') {
        return res.status(403).json({ error: 'You do not have permission' });
      }

      const { content } = req.body as AddCommentRequest;

      if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Comment content is required' });
      }

      const report = await prisma.report.findUnique({
        where: { id: id as string },
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
        where: { id: id as string },
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
        comments: comments,
      });
    } catch (error) {
      console.error('Add comment error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
