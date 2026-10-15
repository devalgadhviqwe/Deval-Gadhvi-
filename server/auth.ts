import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db';
import { AdminRole } from './types';

const JWT_SECRET = process.env.JWT_SECRET || 'newark-medical-associates-secure-secret-2026';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthUser;
  } catch {
    return null;
  }
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function requireAuth(roles: AdminRole[] = ['super_admin', 'editor', 'viewer']) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const token = authHeader.split(' ')[1];
    const user = verifyToken(token);

    if (!user) {
      return res.status(401).json({ error: 'Invalid or expired session token' });
    }

    // Role verification
    if (!roles.includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions for this operation' });
    }

    req.user = user;
    next();
  };
}
