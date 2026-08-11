import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';
import { Role } from '../types';

export const authorizeRoles = (...allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User is not authenticated.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access Denied. Role '${req.user.role}' is not authorized for this operation. Required: [${allowedRoles.join(', ')}]`,
      });
    }

    next();
  };
};
