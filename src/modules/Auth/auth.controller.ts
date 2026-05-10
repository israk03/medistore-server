import { Request, Response, NextFunction } from 'express';
import * as AuthService from './auth.service';
import { sendResponse } from '../../utils/sendResponse';
import { AppError } from '../../utils/AppError';
import { OAuth2Client } from "google-auth-library";
//import prisma from '../../prisma/client'
import jwt from 'jsonwebtoken';
import { prisma } from '../../prisma/client';

// Google registration/login
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);

export const googleLogin = async (
  req: Request,
  res: Response
) => {
  try {
    const { credential } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const email = payload?.email;
    const name = payload?.name;
    const picture = payload?.picture;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Invalid Google account",
      });
    }

    let user = await prisma.user.findUnique({
  where: { email },
});

    // Create new user if not exists
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name || "Google User",
          email,
          avatarUrl: picture,
          role: "CUSTOMER",
          password: "", 
          
        },
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      }
    );

    return res.status(200).json({
      success: true,
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Google authentication failed",
    });
  }
};

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