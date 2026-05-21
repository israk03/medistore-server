import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AuthPayload } from '../types/express';
import { AppError } from '../utils/AppError';
import { prisma } from '../prisma/client';
import { Role } from '@prisma/client';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return next(new AppError('No token provided', 401));
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return next(new AppError('Invalid token format', 401));
  }

  try {
    if (!config.jwtSecret) {
      throw new Error('JWT_SECRET is not defined');
    }

    const decoded = jwt.verify(token, config.jwtSecret) as AuthPayload;

    if (!decoded || !decoded.id || !decoded.role) {
      return next(new AppError('Invalid token payload', 401));
    }

    // Check user in DB
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true, isBanned: true },
    });

    if (!user) {
      return next(new AppError('User no longer exists', 401));
    }

    if (user.isBanned) {
      return next(new AppError('Account is banned', 403));
    }

    req.user = {
      id: user.id,
      role: user.role,
    };

    next();
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Token expired, please login again', 401));
    }
    return next(new AppError('Invalid token', 401));
  }
};

export const authorize = (...roles: AuthPayload['role'][]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role as Role)) {
      return next(new AppError('Forbidden: insufficient permissions', 403));
    }


    
    next();
  };
};