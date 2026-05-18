import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardMetrics = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const totalDataHariIni = await prisma.price.count({
      where: {
        createdAt: {
          gte: today,
        },
      },
    });
    
    // For demo purposes: if no data created today, show total data
    const totalData = await prisma.price.count();
    const displayTotal = totalDataHariIni > 0 ? totalDataHariIni : totalData;

    const gagalValidasi = await prisma.price.count({
      where: {
        status: {
          in: ['FAIL', 'PENDING_REVIEW']
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalDataHariIni: displayTotal,
        syncStatus: '100%',
        gagalValidasi,
        mlStatus: 'ARIMA'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 5;
    const search = req.query.search as string || '';
    const filterStatus = req.query.status as string || '';
    
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { commodity: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }
    
    if (filterStatus && filterStatus !== 'SEMUA') {
      whereClause.status = filterStatus;
    }

    const [transactions, total] = await Promise.all([
      prisma.price.findMany({
        where: whereClause,
        include: {
          commodity: true,
        },
        orderBy: {
          date: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.price.count({
        where: whereClause,
      })
    ]);

    const formattedTransactions = transactions.map(t => {
      const shortId = `TX-${t.id.substring(0, 6).toUpperCase()}`;
      
      return {
        id: shortId,
        fullId: t.id,
        commodity: t.commodity.name,
        location: t.market,
        price: t.price,
        date: t.date.toISOString().replace('T', ' ').substring(0, 16),
        status: t.status,
        source: t.source
      };
    });

    res.json({
      success: true,
      data: formattedTransactions,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string || '';
    
    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedUsers = users.map(u => ({
      id: `USR-${u.id.substring(0, 4).toUpperCase()}`,
      fullId: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      status: u.status,
      lastLogin: u.lastLogin ? u.lastLogin.toISOString().replace('T', ' ').substring(0, 16) : '-',
    }));

    res.json({
      success: true,
      data: formattedUsers,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, status } = req.body;
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email sudah terdaftar' });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password, // In a real app, hash this!
        role,
        status,
      }
    });

    res.json({ success: true, data: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, email, role, status, password } = req.body;

    const dataToUpdate: any = { name, email, role, status };
    if (password) {
      dataToUpdate.password = password; // Should hash in real app
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: dataToUpdate
    });

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    
    // Mock current logged in user protection (Budi Santoso)
    const userToDelete = await prisma.user.findUnique({ where: { id } });
    
    if (!userToDelete) {
      return res.status(404).json({ success: false, message: 'User tidak ditemukan' });
    }

    if (userToDelete.email === 'budi@admin.com') {
      return res.status(403).json({ success: false, message: 'Admin root tidak dapat menghapus dirinya sendiri' });
    }

    await prisma.user.delete({ where: { id } });

    res.json({ success: true, message: 'User berhasil dihapus' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
