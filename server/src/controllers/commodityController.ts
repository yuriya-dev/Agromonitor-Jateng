import { Request, Response } from 'express';
import {
  getAllCommoditySummaries,
  getCommodityHistoryBySlug,
  getPredictionBySlug,
} from '../utils/storageData';

export const getAllCommodities = async (req: Request, res: Response) => {
  try {
    const region = typeof req.query.pasar === 'string' ? req.query.pasar : undefined;
    const date = typeof req.query.date === 'string' ? req.query.date : undefined;
    const commodities = getAllCommoditySummaries(region, date);

    res.json({ success: true, data: commodities });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getCommodityBySlug = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const region = typeof req.query.pasar === 'string' ? req.query.pasar : undefined;
    const date = typeof req.query.date === 'string' ? req.query.date : undefined;
    const commodity = getCommodityHistoryBySlug(slug, region, date);

    if (!commodity) {
      return res.status(404).json({ success: false, message: 'Komoditas tidak ditemukan' });
    }

    res.json({
      success: true,
      data: {
        id: commodity.id,
        name: commodity.name,
        unit: commodity.unit,
        prices: commodity.prices
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Prediksi Harga Menggunakan Regresi Linier dan Moving Average (Simulasi ARIMA/Prophet)
export const getCommodityPrediction = async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug as string;
    const region = typeof req.query.pasar === 'string' ? req.query.pasar : undefined;
    const days = parseInt(req.query.days as string) || 14; // Default 14 hari

    const prediction = await getPredictionBySlug(slug, days, region);

    if (!prediction) {
      return res.status(404).json({ success: false, message: 'Data tidak cukup untuk melakukan prediksi' });
    }

    res.json({
      success: true,
      data: {
        commodityId: prediction.commodityId,
        commodityName: prediction.commodityName,
        modelUsed: prediction.modelUsed,
        metrics: prediction.metrics,
        forecast: prediction.forecast,
        trendDirection: prediction.trendDirection,
        priceChangePercent: prediction.priceChangePercent,
        volatility: prediction.volatility,
        alertTrigger: prediction.alertTrigger,
        dynamicNote: prediction.dynamicNote,
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error during prediction' });
  }
};
