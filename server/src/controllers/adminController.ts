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
    
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { commodity: { name: { contains: search, mode: 'insensitive' } } }
      ];
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
      // Create a shorter ID for display based on UUID (first 8 chars)
      const shortId = `TX-${t.id.substring(0, 6).toUpperCase()}`;
      
      return {
        id: shortId,
        fullId: t.id,
        commodity: t.commodity.name,
        location: t.market,
        price: t.price,
        // Format date string to match mock data like "2024-05-17 08:30"
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
