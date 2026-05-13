import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllCommodities = async (req: Request, res: Response) => {
  try {
    const commodities = await prisma.commodity.findMany({
      include: {
        prices: {
          orderBy: { date: 'desc' },
          take: 2, // Ambil 2 harga terakhir untuk menghitung persentase perubahan
        }
      }
    });

    // Format data untuk mempermudah frontend
    const formattedData = commodities.map(item => {
      const currentPrice = item.prices[0]?.price || 0;
      const previousPrice = item.prices[1]?.price || currentPrice;
      const changeAmount = currentPrice - previousPrice;
      const changePercent = previousPrice === 0 ? 0 : (changeAmount / previousPrice) * 100;

      return {
        id: item.slug,
        name: item.name,
        unit: item.unit,
        price: currentPrice,
        changeAmount,
        changePercent: parseFloat(changePercent.toFixed(2)),
      };
    });

    res.json({ success: true, data: formattedData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getCommodityBySlug = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const commodity = await prisma.commodity.findUnique({
      where: { slug },
      include: {
        prices: {
          orderBy: { date: 'desc' }, // Terbaru ke terlama
          take: 60, // Ambil 60 hari terakhir
        }
      }
    });

    if (!commodity) {
      return res.status(404).json({ success: false, message: 'Komoditas tidak ditemukan' });
    }

    // Format harga untuk chart { time, open, high, low, close }
    // Karena ini data harga tunggal harian, kita simulasikan o/h/l/c berdasarkan variansi tipis (untuk efek visual)
    const prices = (commodity as any).prices || [];
    const chartData = prices.reverse().map((p: any) => {
      const base = p.price;
      const variance = base * 0.02; // 2% variasi
      return {
        time: p.date.toISOString().split('T')[0],
        open: base - (Math.random() * variance * 0.5),
        high: base + (Math.random() * variance),
        low: base - (Math.random() * variance),
        close: base
      };
    });

    res.json({
      success: true,
      data: {
        id: commodity.slug,
        name: commodity.name,
        unit: commodity.unit,
        prices: chartData
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
