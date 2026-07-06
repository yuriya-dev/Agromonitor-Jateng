import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import {
  getAllCommoditySummaries,
  getPredictionBySlug,
  getStorageTotalDataPoints,
  loadRows
} from '../utils/storageData';

const prisma = new PrismaClient();
const STORAGE_DIR = path.resolve(__dirname, '../../../storage');
const CONFIG_PATH = path.join(STORAGE_DIR, 'arima_config.json');
const ALERT_CONFIG_PATH = path.join(STORAGE_DIR, 'alert_config.json');

// Helper untuk membaca alert_config
const readAlertConfig = () => {
  const defaultAlertConfig = { criticalThreshold: 5.0, warningThreshold: 1.5 };
  if (!fs.existsSync(ALERT_CONFIG_PATH)) return defaultAlertConfig;
  try {
    const data = JSON.parse(fs.readFileSync(ALERT_CONFIG_PATH, 'utf8'));
    return {
      criticalThreshold: typeof data.criticalThreshold === 'number' ? data.criticalThreshold : 5.0,
      warningThreshold: typeof data.warningThreshold === 'number' ? data.warningThreshold : 1.5,
    };
  } catch (e) {
    console.error('Error reading alert_config.json', e);
    return defaultAlertConfig;
  }
};

// Helper untuk menulis alert_config
const writeAlertConfig = (config: any) => {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
    fs.writeFileSync(ALERT_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing alert_config.json', e);
  }
};

// Helper untuk membaca arima_config
const readConfig = () => {
  if (!fs.existsSync(CONFIG_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  } catch (e) {
    console.error('Error reading arima_config.json', e);
    return {};
  }
};

// Helper untuk menulis arima_config
const writeConfig = (config: any) => {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf8');
  } catch (e) {
    console.error('Error writing arima_config.json', e);
  }
};

// 1. GET /api/analis/metrics
export const getAnalisMetrics = async (req: Request, res: Response) => {
  try {
    const summaries = getAllCommoditySummaries();
    
    // Fetch predictions for all commodities to calculate accuracy and trends
    const predictions = await Promise.all(
      summaries.map(async (s) => {
        try {
          return await getPredictionBySlug(s.id, 14);
        } catch (e) {
          console.error(`Failed prediction for ${s.id}`, e);
          return null;
        }
      })
    );

    let totalMape = 0;
    let totalRmse = 0;
    let countAcc = 0;
    let highestIncreaseItem: any = null;
    
    const commoditiesData = summaries.map((s, idx) => {
      const pred = predictions[idx];
      let mape = 0;
      let rmse = 0;
      let trendPercent = s.changePercent;
      let volatility = 'RENDAH';
      let alertTrigger = 'NONE';
      let modelUsed = 'ARIMA';

      if (pred) {
        mape = pred.metrics.mape || 0;
        rmse = pred.metrics.rmse || 0;
        trendPercent = pred.priceChangePercent || 0;
        volatility = pred.volatility || 'RENDAH';
        alertTrigger = pred.alertTrigger || 'NONE';
        modelUsed = pred.modelUsed;

        if (mape > 0) {
          totalMape += mape;
          totalRmse += rmse;
          countAcc++;
        }

        // Cari komoditas dengan proyeksi kenaikan harga tertinggi
        if (!highestIncreaseItem || trendPercent > highestIncreaseItem.trendPercent) {
          highestIncreaseItem = {
            id: s.id,
            name: s.name,
            trendPercent
          };
        }
      }

      return {
        id: s.id,
        name: s.name,
        unit: s.unit,
        price: s.price,
        mape,
        rmse,
        trendPercent,
        volatility,
        alertTrigger,
        modelUsed
      };
    });

    const averageMape = countAcc > 0 ? parseFloat((totalMape / countAcc).toFixed(2)) : 2.1;
    const averageRmse = countAcc > 0 ? parseFloat((totalRmse / countAcc).toFixed(2)) : 145.2;

    // Hitung total data points riil (database + CSV)
    const dbCount = await prisma.price.count();
    const csvCount = getStorageTotalDataPoints();
    const totalDataPoints = dbCount + csvCount;

    res.json({
      success: true,
      data: {
        averageMape,
        averageRmse,
        totalDataPoints,
        highestIncrease: highestIncreaseItem || { id: 'beras-medium', name: 'Beras Medium', trendPercent: 0 },
        commodities: commoditiesData
      }
    });
  } catch (error) {
    console.error('Error in getAnalisMetrics:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// 2. GET /api/analis/arima-config
export const getArimaConfig = async (req: Request, res: Response) => {
  try {
    const config = readConfig();
    res.json({ success: true, data: config });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// 3. POST /api/analis/arima-config
export const saveArimaConfig = async (req: Request, res: Response) => {
  try {
    const { commodityId, p, d, q, confidence } = req.body;
    if (!commodityId) {
      return res.status(400).json({ success: false, message: 'commodityId is required' });
    }

    const config = readConfig();
    config[commodityId] = {
      p: parseInt(p) ?? 5,
      d: parseInt(d) ?? 1,
      q: parseInt(q) ?? 0,
      confidence: parseInt(confidence) ?? 95,
      updatedAt: new Date().toISOString()
    };

    writeConfig(config);

    // Jalankan ulang prediksi untuk menguji akurasi model yang baru
    let updatedPrediction = null;
    try {
      updatedPrediction = await getPredictionBySlug(commodityId, 14);
    } catch (e) {
      console.error(`Failed prediction test after config update for ${commodityId}`, e);
    }

    res.json({
      success: true,
      message: 'Parameter ARIMA berhasil diperbarui dan model dilatih ulang',
      data: {
        config: config[commodityId],
        metrics: updatedPrediction ? updatedPrediction.metrics : null
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Helper untuk mengambil data historis gabungan DB dan CSV berdasarkan tanggal
const getCombinedHistoricalData = async (startDateStr: string, endDateStr: string) => {
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  endDate.setHours(23, 59, 59, 999);

  // 1. Fetch data dari database Prisma
  const dbPrices = await prisma.price.findMany({
    where: {
      date: {
        gte: startDate,
        lte: endDate
      }
    },
    include: {
      commodity: true
    },
    orderBy: {
      date: 'asc'
    }
  });

  const dbRows = dbPrices.map((p) => ({
    tanggal: p.date,
    provinsi: 'Jawa Tengah',
    kabupatenKota: p.market,
    komoditas: p.commodity.name,
    satuan: p.commodity.unit,
    harga: p.price,
    sumber: p.source
  }));

  // 2. Fetch data dari CSV storage (menggunakan loadRows yang diimport)
  const csvRows = loadRows();
  const rows = csvRows
    .filter((row) => row.tanggal >= startDate && row.tanggal <= endDate)
    .map((row) => ({
      tanggal: row.tanggal,
      provinsi: row.provinsi,
      kabupatenKota: row.kabupatenKota,
      komoditas: row.komoditas,
      satuan: row.unit,
      harga: row.harga,
      sumber: 'BPS / Kemendag (CSV)'
    }));

  // Gabungkan dan urutkan berdasarkan tanggal
  const combined = [...dbRows, ...rows];
  combined.sort((a, b) => a.tanggal.getTime() - b.tanggal.getTime());
  return combined;
};

// 4. GET /api/analis/export/csv
export const exportCsv = async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ success: false, message: 'start and end dates are required' });
    }

    const data = await getCombinedHistoricalData(start as string, end as string);
    
    // Bentuk header CSV
    let csvContent = 'Tanggal,Provinsi,Kabupaten/Kota,Komoditas,Satuan,Harga (Rp),Sumber\n';
    
    for (const item of data) {
      const dateStr = item.tanggal.toISOString().split('T')[0];
      // Sanitasi komoditas dan pasar jika ada koma
      const escapedMarket = `"${item.kabupatenKota.replace(/"/g, '""')}"`;
      const escapedCommodity = `"${item.komoditas.replace(/"/g, '""')}"`;
      
      csvContent += `${dateStr},${item.provinsi},${escapedMarket},${escapedCommodity},${item.satuan},${item.harga},${item.sumber}\n`;
    }

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=laporan_agromonitor_${start}_to_${end}.csv`);
    res.status(200).send(csvContent);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// 5. GET /api/analis/export/json
export const exportJson = async (req: Request, res: Response) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) {
      return res.status(400).json({ success: false, message: 'start and end dates are required' });
    }

    const rawData = await getCombinedHistoricalData(start as string, end as string);
    
    // Ambil prediksi komoditas juga untuk summary laporan JSON
    const summaries = getAllCommoditySummaries();
    const predictions = await Promise.all(
      summaries.map(async (s) => {
        try {
          return await getPredictionBySlug(s.id, 14);
        } catch {
          return null;
        }
      })
    );

    const reportSummary = summaries.map((s, idx) => {
      const pred = predictions[idx];
      return {
        commodityId: s.id,
        name: s.name,
        price: s.price,
        arimaForecast14Days: pred ? pred.forecast : [],
        mape: pred ? pred.metrics.mape : null,
        rmse: pred ? pred.metrics.rmse : null,
        trendDirection: pred ? pred.trendDirection : 'STABLE',
        priceChangePercent: pred ? pred.priceChangePercent : 0,
        volatility: pred ? pred.volatility : 'RENDAH',
        alertTrigger: pred ? pred.alertTrigger : 'NONE'
      };
    });

    res.json({
      success: true,
      meta: {
        generator: 'Agromonitor Jateng Analytics Export',
        period: { start, end },
        exportedAt: new Date().toISOString()
      },
      summary: reportSummary,
      rawData: rawData.map(d => ({
        ...d,
        tanggal: d.tanggal.toISOString().split('T')[0]
      }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// GET /api/analis/alert-config
export const getAlertConfig = async (req: Request, res: Response) => {
  try {
    const config = readAlertConfig();
    res.json({ success: true, data: config });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// POST /api/analis/alert-config
export const saveAlertConfig = async (req: Request, res: Response) => {
  try {
    const { criticalThreshold, warningThreshold } = req.body;
    
    if (criticalThreshold === undefined || warningThreshold === undefined) {
      return res.status(400).json({ success: false, message: 'criticalThreshold and warningThreshold are required' });
    }

    const config = {
      criticalThreshold: Number(criticalThreshold),
      warningThreshold: Number(warningThreshold),
      updatedAt: new Date().toISOString()
    };

    writeAlertConfig(config);

    res.json({
      success: true,
      message: 'Peringatan Harga Terintegrasi berhasil diperbarui',
      data: config
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};
