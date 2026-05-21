import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../prisma/client';

import { AppError } from '../../utils/AppError';

import { Role } from '@prisma/client';
import { config } from '../../config/env';

// ── Types ──────────────────────────────────────────────────────────────────

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: Role;
}

interface LoginInput {
  email: string;
  password: string;
}

interface JwtPayload {
  id: string;
  role: Role;
}

// ── Helpers ────────────────────────────────────────────────────────────────

const generateToken = (payload: JwtPayload): string => {
  if (!config.jwtSecret) {
    throw new Error('JWT_SECRET is not defined');
  }

  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: '7d',
  });
};

const sanitizeUser = (user: {
  id: string;
  name: string;
  email: string;
  role: Role;
  isBanned: boolean;
  createdAt: Date;
}) => {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isBanned: user.isBanned,
    createdAt: user.createdAt,
  };
};

// ── Services ───────────────────────────────────────────────────────────────

// registerUser
export const registerUser = async (input: RegisterInput) => {
  let { name, email, password, role } = input;

  // Normalize email
  email = email.toLowerCase();

  // Basic validation
  if (!name || !email || !password) {
    throw new AppError('All fields are required', 400);
  }

  if(role === Role.ADMIN) {
    throw new AppError('Cannot register as ADMIN', 403);
  }

  if (password.length < 6) {
    throw new AppError('Password must be at least 6 characters', 400);
  }

  // Check existing user
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError('Email already in use', 409);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Force CUSTOMER role (security)
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role
    },
  });

  const token = generateToken({
    id: user.id,
    role: user.role,
  });

  return {
    user: sanitizeUser(user),
    token,
  };
};


// loginUser
export const loginUser = async (input: LoginInput) => {
  let { email, password } = input;

  // Normalize email
  email = email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
  });

  // Prevent user enumeration
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (user.isBanned) {
    throw new AppError('Your account has been banned. Contact support.', 403);
  }

   if (!user.password || user.password === "") {
  throw new AppError(
    'This account was created with Google. Please use Google Sign In.',
    400
  );
}

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  const token = generateToken({
    id: user.id,
    role: user.role,
  });

  return {
    user: sanitizeUser(user),
    token,
  };
};


// getCurrentUser
export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBanned: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
};

// updateProfile
export const updateProfile = async (
  userId: string,
  input: { name?: string; email?: string }
) => {
  const { name, email } = input;

  // Find existing user
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new AppError('User not found', 404);
  }

  let normalizedEmail = existingUser.email;

  // Normalize & validate email if updating
  if (email) {
    normalizedEmail = email.toLowerCase();

    // Check if another user already uses this email
    const emailExists = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        NOT: {
          id: userId,
        },
      },
    });

    if (emailExists) {
      throw new AppError('Email already in use', 409);
    }
  }

  // Update user
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: name ?? existingUser.name,
      email: normalizedEmail,
    },
  });

  return sanitizeUser(updatedUser);
};