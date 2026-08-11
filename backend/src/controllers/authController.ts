import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config';
import { AuthenticatedRequest } from '../middleware/auth';

const prisma = new PrismaClient();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export const login = async (req: Request, res: Response) => {
  const { email, password } = loginSchema.parse(req.body);
  const cleanEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  if (!user) {
    return res.status(401).json({ success: false, error: 'No account found with this email. Please sign up first.' });
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    return res.status(401).json({ success: false, error: 'Invalid email or password.' });
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn: '24h' }
  );

  return res.json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  return res.json({ success: true, data: user });
};

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(4, 'Password must be at least 4 characters'),
  role: z.enum(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']).default('ADMIN'),
});

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = registerSchema.parse(req.body);
  const cleanEmail = email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({
    where: { email: cleanEmail },
  });

  if (existingUser) {
    return res.status(400).json({ success: false, error: 'User with this email already exists.' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      name,
      email: cleanEmail,
      passwordHash,
      role,
    },
  });

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    config.jwtSecret,
    { expiresIn: '24h' }
  );

  return res.status(201).json({
    success: true,
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
};

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().min(4, 'New password must be at least 4 characters').optional(),
});

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized' });
  }

  const { name, currentPassword, newPassword } = updateProfileSchema.parse(req.body);

  const dbUser = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (!dbUser) {
    return res.status(404).json({ success: false, error: 'User account not found.' });
  }

  const updateData: any = {};

  if (name && name.trim()) {
    updateData.name = name.trim();
  }

  if (newPassword) {
    if (currentPassword) {
      const isValid = await bcrypt.compare(currentPassword, dbUser.passwordHash);
      if (!isValid) {
        return res.status(400).json({ success: false, error: 'Current password is incorrect.' });
      }
    }
    const newHash = await bcrypt.hash(newPassword, 10);
    updateData.passwordHash = newHash;
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ success: false, error: 'No fields provided to update.' });
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.user.id },
    data: updateData,
    select: { id: true, name: true, email: true, role: true },
  });

  // Generate fresh token with updated name
  const token = jwt.sign(
    {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
    },
    config.jwtSecret,
    { expiresIn: '24h' }
  );

  return res.json({
    success: true,
    message: 'Profile & password updated successfully!',
    data: {
      token,
      user: updatedUser,
    },
  });
};
