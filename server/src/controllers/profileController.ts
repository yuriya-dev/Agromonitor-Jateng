import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/profile?email=...
export const getProfile = async (req: Request, res: Response) => {
  try {
    const email = req.query.email as string;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email parameter is required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.json({ success: true, data: null, message: 'User not found' });
    }

    res.json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        whatsapp: user.whatsapp,
        preferences: user.preferences ? user.preferences.split(',') : [],
        notifyDaily: user.notifyDaily,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// POST /api/profile
export const saveProfile = async (req: Request, res: Response) => {
  try {
    const { name, email, whatsapp, preferences, notifyDaily } = req.body;
    
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const prefString = Array.isArray(preferences) ? preferences.join(',') : '';

    const user = await prisma.user.upsert({
      where: { email },
      create: {
        name,
        email,
        whatsapp: whatsapp || null,
        preferences: prefString,
        notifyDaily: !!notifyDaily,
        role: 'VIEWER',
        status: 'ACTIVE',
      },
      update: {
        name,
        whatsapp: whatsapp || null,
        preferences: prefString,
        notifyDaily: !!notifyDaily,
      },
    });

    res.json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        whatsapp: user.whatsapp,
        preferences: user.preferences ? user.preferences.split(',') : [],
        notifyDaily: user.notifyDaily,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
