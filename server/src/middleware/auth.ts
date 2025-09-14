import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: any;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ');

    if (!token) {
      return res.status(401).json({ success: false, error: 'Access token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
      if (err) {
        return res.status(403).json({ success: false, error: 'Invalid token' });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    next(error);
  }
};

export const authorizeRole = (role: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== role) {
      return res.status(403).json({ 
        success: false, 
        error: 'Access denied' 
      });
    }
    next();
  };
};
