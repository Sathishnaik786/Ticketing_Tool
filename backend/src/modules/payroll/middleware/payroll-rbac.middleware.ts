import { Request, Response, NextFunction } from 'express';
import { hasPermission } from '../config/rbac.config';

export const checkPayrollPermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!user || !user.role) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!hasPermission(user.role, permission)) {
      return res.status(403).json({ 
        message: `Forbidden: You do not have permission to ${permission}` 
      });
    }

    next();
  };
};
