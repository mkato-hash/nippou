import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends NextApiRequest {
  userId?: string;
  userRole?: string;
  userEmail?: string;
}

export const authenticate = (req: AuthRequest, res: NextApiResponse, next: () => void) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No authorization token' });
  }

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    req.userEmail = decoded.email;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorizeMentor = (req: AuthRequest, res: NextApiResponse, next: () => void) => {
  if (req.userRole !== 'MENTOR') {
    return res.status(403).json({ error: 'You do not have permission to access this resource' });
  }
  next();
};
