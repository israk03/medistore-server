import { Request, Response, NextFunction } from 'express';
import * as AuthService from './auth.service';
import { sendResponse } from '../../utils/sendResponse';
import { AppError } from '../../utils/AppError';

// ── REGISTER ───────────────────────────────────────────────────────────────
export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    // Controller only checks request presence (light validation)
    if (!name || !email || !password) {
      return next(new AppError('name, email, and password are required', 400));
    }
    
    const result = await AuthService.registerUser({
      name,
      email,
      password,
      role
    });

    sendResponse(res, 201, 'Registration successful', result);
  } catch (err) {
    next(err);
  }
};

// ── LOGIN ─────────────────────────────────────────────────────────────────
export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('email and password are required', 400));
    }

    const result = await AuthService.loginUser({
      email,
      password,
    });

    sendResponse(res, 200, 'Login successful', result);
  } catch (err) {
    next(err);
  }
};

// ── GET CURRENT USER ───────────────────────────────────────────────────────
export const getMe = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      return next(new AppError('Unauthorized', 401));
    }

    const user = await AuthService.getCurrentUser(req.user.id);

    sendResponse(res, 200, 'User fetched successfully', user);
  } catch (err) {
    next(err);
  }
};