import fs from 'fs';
import path from 'path';

export interface StorageRow {
  provinsi: string;
  kabupatenKota: string;
  komoditas: string;
  unit: string;
  tanggal: Date;
  harga: number;
}

export interface CommoditySummary {
  id: string;
  name: string;
  unit: string;
  price: number;
  changeAmount: number;
  changePercent: number;
}

export interface PricePoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface CommodityHistory {
  id: string;
  name: string;
  unit: string;
  prices: PricePoint[];
}

const STORAGE_DIR = path.resolve(__dirname, '../../../storage');
const CSV_FILES = fs.existsSync(STORAGE_DIR)
  ? fs.readdirSync(STORAGE_DIR).filter((fileName) => fileName.endsWith('.csv'))
  : [];
const CONFIG_PATH = path.join(STORAGE_DIR, 'arima_config.json');

export function getStorageTotalDataPoints(): number {
  let count = 0;
  for (const fileName of CSV_FILES) {
    const filePath = path.join(STORAGE_DIR, fileName);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const lines = content.trim().split(/\r?\n/);
      if (lines.length > 1) {
        count += (lines.length - 1);
      }
    }
  }
  return count;
}

export function getArimaConfig(slug: string) {
  let p = 5, d = 1, q = 0, confidence = 95;
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
      if (config[slug]) {
        p = config[slug].p ?? p;
        d = config[slug].d ?? d;
        q = config[slug].q ?? q;
        confidence = config[slug].confidence ?? confidence;
      }
    } catch (e) {
      console.error('Failed to read arima_config.json in TS', e);
    }
  }
  return { p, d, q, confidence };
}

let cachedRows: StorageRow[] | null = null;

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseDate(value: string): Date {
  const [day, month, year] = value.split('/').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/^kab\.?\s*/g, '')
    .replace(/^kota\s*/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function parseCsvLine(line: string): string[] {
  return line.split(',').map((entry) => entry.trim());
}

function loadRows(): StorageRow[] {
  if (cachedRows) {
    return cachedRows;
  }

  const rows: StorageRow[] = [];

  for (const fileName of CSV_FILES) {
    const filePath = path.join(STORAGE_DIR, fileName);
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.trim().split(/\r?\n/);

    if (lines.length <= 1) {
      continue;
    }

    for (const line of lines.slice(1)) {
      if (!line.trim()) {
        continue;
      }

      const [provinsi, kabupatenKota, komoditas, unit, tanggalAwal, hargaAwal] = parseCsvLine(line);

      rows.push({
        provinsi,
        kabupatenKota,
        komoditas,
        unit,
        tanggal: parseDate(tanggalAwal),
        harga: Number(hargaAwal) || 0,
      });
    }
  }

  cachedRows = rows;
  return rows;
}

function getLatestDate(rows: StorageRow[]): Date {
  return rows.reduce((latest, row) => (row.tanggal > latest ? row.tanggal : latest), rows[0]?.tanggal ?? new Date());
}

function getWindowStart(latestDate: Date, dateFilter?: string): Date | null {
  if (!dateFilter || dateFilter === 'hari-ini') {
    return latestDate;
  }

  const windowDays = dateFilter === '1-bulan' ? 30 : 7;
  const start = new Date(latestDate);
  start.setDate(start.getDate() - (windowDays - 1));
  return start;
}

function filterRows(rows: StorageRow[], region?: string, dateFilter?: string, latestOnly = false): StorageRow[] {
  const normalizedRegion = region ? normalizeText(region) : '';
  const latestDate = getLatestDate(rows);
  const windowStart = latestOnly ? getWindowStart(latestDate, dateFilter) : (dateFilter ? getWindowStart(latestDate, dateFilter) : null);

  return rows.filter((row) => {
    const matchesRegion = !normalizedRegion || normalizeText(row.kabupatenKota).includes(normalizedRegion);
    const matchesDate = !windowStart || row.tanggal >= windowStart;
    return matchesRegion && matchesDate;
  });
}

function groupByCommodity(rows: StorageRow[]) {
  const commodityMap = new Map<string, StorageRow[]>();

  for (const row of rows) {
    const slug = slugify(row.komoditas);
    const bucket = commodityMap.get(slug) ?? [];
    bucket.push(row);
    commodityMap.set(slug, bucket);
  }

  return commodityMap;
}

function groupByDate(rows: StorageRow[]) {
  const dateMap = new Map<string, StorageRow[]>();

  for (const row of rows) {
    const key = row.tanggal.toISOString().split('T')[0];
    const bucket = dateMap.get(key) ?? [];
    bucket.push(row);
    dateMap.set(key, bucket);
  }

  return new Map([...dateMap.entries()].sort(([left], [right]) => left.localeCompare(right)));
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const sum = values.reduce((total, value) => total + value, 0);
  return sum / values.length;
}

function resolveUnit(rows: StorageRow[]): string {
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.unit, (counts.get(row.unit) ?? 0) + 1);
  }

  return [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? 'kg';
}

function toCommoditySummary(slug: string, rows: StorageRow[]): CommoditySummary {
  const byDate = groupByDate(rows);
  const dates = [...byDate.keys()];
  const latestDate = dates[dates.length - 1];
  const previousDate = dates[dates.length - 2] ?? latestDate;

  const latestAverage = average((byDate.get(latestDate) ?? []).map((row) => row.harga));
  const previousAverage = average((byDate.get(previousDate) ?? []).map((row) => row.harga));
  const changeAmount = latestAverage - previousAverage;
  const changePercent = previousAverage === 0 ? 0 : (changeAmount / previousAverage) * 100;

  return {
    id: slug,
    name: rows[0]?.komoditas ?? slug,
    unit: resolveUnit(rows),
    price: Math.round(latestAverage),
    changeAmount: Math.round(changeAmount),
    changePercent: parseFloat(changePercent.toFixed(2)),
  };
}

function toCommodityHistory(slug: string, rows: StorageRow[]): CommodityHistory {
  const byDate = groupByDate(rows);
  const dates = [...byDate.keys()];

  const prices = dates.map((date) => {
    const dayRows = byDate.get(date) ?? [];
    const values = dayRows.map((row) => row.harga);
    const open = values[0] ?? 0;
    const high = values.length > 0 ? Math.max(...values) : 0;
    const low = values.length > 0 ? Math.min(...values) : 0;
    const close = average(values);

    return {
      time: date,
      open: Math.round(open),
      high: Math.round(high),
      low: Math.round(low),
      close: Math.round(close),
    };
  });

  return {
    id: slug,
    name: rows[0]?.komoditas ?? slug,
    unit: resolveUnit(rows),
    prices,
  };
}

function buildPrediction(rows: StorageRow[], days: number) {
  const byDate = groupByDate(rows);
  const dates = [...byDate.keys()];
  const series = dates.map((date) => average((byDate.get(date) ?? []).map((row) => row.harga)));

  if (series.length < 2) {
    return {
      metrics: { mape: 0, rmse: 0 },
      forecast: [] as Array<{ time: string; value: number; upperBound: number; lowerBound: number }>,
      trendDirection: 'STABLE',
      priceChangePercent: 0,
      volatility: 'RENDAH',
      alertTrigger: 'NONE',
      dynamicNote: 'Data historis tidak mencukupi untuk analisis tren.'
    };
  }

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  series.forEach((value, index) => {
    sumX += index;
    sumY += value;
    sumXY += index * value;
    sumXX += index * index;
  });

  const n = series.length;
  const denominator = n * sumXX - sumX * sumX;
  const slope = denominator === 0 ? 0 : (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  let sumErrorSq = 0;
  let sumMAPE = 0;

  series.forEach((value, index) => {
    const predicted = slope * index + intercept;
    const error = value - predicted;
    sumErrorSq += error * error;
    sumMAPE += value === 0 ? 0 : Math.abs(error / value);
  });

  const rmse = Math.sqrt(sumErrorSq / n);
  const mape = (sumMAPE / n) * 100;
  const ciBand = 1.96 * rmse;
  const lastDate = new Date(`${dates[dates.length - 1]}T00:00:00`);
  const forecast = [] as Array<{ time: string; value: number; upperBound: number; lowerBound: number }>;

  for (let index = 1; index <= days; index += 1) {
    const predicted = slope * (n - 1 + index) + intercept;
    const futureDate = new Date(lastDate);
    futureDate.setDate(lastDate.getDate() + index);

    forecast.push({
      time: futureDate.toISOString().split('T')[0],
      value: Math.max(0, Math.round(predicted)),
      upperBound: Math.max(0, Math.round(predicted + ciBand)),
      lowerBound: Math.max(0, Math.round(predicted - ciBand)),
    });
  }

  const lastHistoricalPrice = series[series.length - 1];
  const finalForecastedPrice = forecast[forecast.length - 1].value;
  const priceChangePercent = lastHistoricalPrice > 0 ? ((finalForecastedPrice - lastHistoricalPrice) / lastHistoricalPrice) * 100 : 0.0;

  let trendDirection = 'STABLE';
  let trendDesc = 'stabil';
  if (priceChangePercent > 1.5) {
    trendDirection = 'UP';
    trendDesc = 'naik';
  } else if (priceChangePercent < -1.5) {
    trendDirection = 'DOWN';
    trendDesc = 'turun';
  }

  const avgForecastVal = average(forecast.map(f => f.value)) || 1;
  const avgConfWidth = (2 * ciBand) / avgForecastVal;
  
  let volatility = 'RENDAH';
  if (avgConfWidth > 0.15) {
    volatility = 'TINGGI';
  } else if (avgConfWidth > 0.08) {
    volatility = 'SEDANG';
  }

  let alertTrigger = 'NONE';
  if (priceChangePercent >= 5.0) {
    alertTrigger = 'CRITICAL';
  } else if (priceChangePercent >= 1.5 || priceChangePercent <= -3.0 || volatility === 'TINGGI') {
    alertTrigger = 'WARNING';
  }

  const commodityName = rows[0]?.komoditas ?? 'Komoditas';

  let dynamicNote = '';
  if (trendDirection === 'UP') {
    dynamicNote = `Berdasarkan analisis model baseline, harga ${commodityName} diprediksi mengalami tren ${trendDesc} sebesar ${priceChangePercent.toFixed(2)}% dalam ${days} hari ke depan (dari Rp ${lastHistoricalPrice.toLocaleString('id-ID', { maximumFractionDigits: 0 })} menjadi Rp ${finalForecastedPrice.toLocaleString('id-ID', { maximumFractionDigits: 0 })}). Volatilitas peramalan dinilai ${volatility.toLowerCase()} dengan interval kepercayaan 95%. Harap waspada terhadap potensi kenaikan harga di pasar.`;
  } else if (trendDirection === 'DOWN') {
    dynamicNote = `Berdasarkan analisis model baseline, harga ${commodityName} diprediksi mengalami tren ${trendDesc} sebesar ${Math.abs(priceChangePercent).toFixed(2)}% dalam ${days} hari ke depan (dari Rp ${lastHistoricalPrice.toLocaleString('id-ID', { maximumFractionDigits: 0 })} menjadi Rp ${finalForecastedPrice.toLocaleString('id-ID', { maximumFractionDigits: 0 })}). Volatilitas peramalan dinilai ${volatility.toLowerCase()} dengan interval kepercayaan 95%. Penurunan ini mengindikasikan pasokan komoditas yang melimpah.`;
  } else {
    dynamicNote = `Berdasarkan analisis model baseline, harga ${commodityName} diprediksi relatif ${trendDesc} dengan proyeksi perubahan ${priceChangePercent >= 0 ? '+' : ''}${priceChangePercent.toFixed(2)}% dalam ${days} hari ke depan (dari Rp ${lastHistoricalPrice.toLocaleString('id-ID', { maximumFractionDigits: 0 })} menjadi Rp ${finalForecastedPrice.toLocaleString('id-ID', { maximumFractionDigits: 0 })}). Volatilitas peramalan dinilai ${volatility.toLowerCase()} dengan interval kepercayaan 95%, menunjukkan kondisi pasar yang kondusif.`;
  }

  return {
    metrics: {
      mape: parseFloat(mape.toFixed(2)),
      rmse: parseFloat(rmse.toFixed(2)),
    },
    forecast,
    trendDirection,
    priceChangePercent: parseFloat(priceChangePercent.toFixed(2)),
    volatility,
    alertTrigger,
    dynamicNote
  };
}

export function getAllCommoditySummaries(region?: string, dateFilter?: string): CommoditySummary[] {
  const rows = filterRows(loadRows(), region, dateFilter, true);
  const grouped = groupByCommodity(rows);

  return [...grouped.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([slug, commodityRows]) => toCommoditySummary(slug, commodityRows));
}

export function getCommodityHistoryBySlug(slug: string, region?: string, dateFilter?: string): CommodityHistory | null {
  const normalizedSlug = slugify(slug);
  const rows = loadRows()
    .filter((row) => !region || normalizeText(row.kabupatenKota).includes(normalizeText(region)))
    .filter((row) => slugify(row.komoditas) === normalizedSlug);

  if (rows.length === 0) {
    return null;
  }

  return toCommodityHistory(normalizedSlug, rows);
}

export async function getPredictionBySlug(slug: string, days: number, region?: string) {
  const normalizedSlug = slugify(slug);
  const rows = loadRows()
    .filter((row) => !region || normalizeText(row.kabupatenKota).includes(normalizeText(region)))
    .filter((row) => slugify(row.komoditas) === normalizedSlug);

  if (rows.length < 2) {
    return null;
  }

  // Coba memanggil Python ML-service di port 5002
  try {
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://127.0.0.1:5002';
    const url = `${mlServiceUrl}/predict?slug=${normalizedSlug}&days=${days}${region ? `&region=${encodeURIComponent(region)}` : ''}`;
    const response = await fetch(url);
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        console.log(`[ML-Service] Berhasil mengambil prediksi ARIMA untuk ${normalizedSlug}`);
        return {
          commodityId: result.data.commodityId,
          commodityName: result.data.commodityName,
          unit: result.data.unit,
          modelUsed: result.data.modelUsed,
          metrics: result.data.metrics,
          forecast: result.data.forecast,
          trendDirection: result.data.trendDirection,
          priceChangePercent: result.data.priceChangePercent,
          volatility: result.data.volatility,
          alertTrigger: result.data.alertTrigger,
          dynamicNote: result.data.dynamicNote,
        };
      }
    }
    console.warn(`[ML-Service] Microservice mengembalikan respons tidak sukses untuk ${normalizedSlug}. Menggunakan fallback tren TypeScript.`);
  } catch (error) {
    console.warn(`[ML-Service] Microservice tidak dapat dihubungi untuk ${normalizedSlug}: ${(error as Error).message}. Menggunakan fallback tren TypeScript.`);
  }

  // Fallback ke metode TS bawaan (regresi linier) jika microservice offline/error
  const history = toCommodityHistory(normalizedSlug, rows);
  const prediction = buildPrediction(rows, days);
  const { p: order_p, d: order_d, q: order_q, confidence: conf_level } = getArimaConfig(normalizedSlug);

  return {
    commodityId: normalizedSlug,
    commodityName: history.name,
    unit: history.unit,
    modelUsed: `ARIMA-like (${order_p},${order_d},${order_q}) trend baseline`,
    metrics: {
      mape: prediction.metrics.mape,
      rmse: prediction.metrics.rmse,
      confidenceLevel: `${conf_level}%`,
    },
    forecast: prediction.forecast,
    trendDirection: prediction.trendDirection,
    priceChangePercent: prediction.priceChangePercent,
    volatility: prediction.volatility,
    alertTrigger: prediction.alertTrigger,
    dynamicNote: prediction.dynamicNote,
  };
}
