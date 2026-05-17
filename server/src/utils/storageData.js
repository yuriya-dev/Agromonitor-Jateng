"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCommoditySummaries = getAllCommoditySummaries;
exports.getCommodityHistoryBySlug = getCommodityHistoryBySlug;
exports.getPredictionBySlug = getPredictionBySlug;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const STORAGE_DIR = path_1.default.resolve(__dirname, '../../../storage');
const CSV_FILES = fs_1.default.existsSync(STORAGE_DIR)
    ? fs_1.default.readdirSync(STORAGE_DIR).filter((fileName) => fileName.endsWith('.csv'))
    : [];
let cachedRows = null;
function slugify(value) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
function parseDate(value) {
    const [day, month, year] = value.split('/').map(Number);
    return new Date(Date.UTC(year, month - 1, day));
}
function normalizeText(value) {
    return value
        .toLowerCase()
        .replace(/^kab\.?\s*/g, '')
        .replace(/^kota\s*/g, '')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
}
function parseCsvLine(line) {
    return line.split(',').map((entry) => entry.trim());
}
function loadRows() {
    if (cachedRows) {
        return cachedRows;
    }
    const rows = [];
    for (const fileName of CSV_FILES) {
        const filePath = path_1.default.join(STORAGE_DIR, fileName);
        const content = fs_1.default.readFileSync(filePath, 'utf8');
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
function getLatestDate(rows) {
    return rows.reduce((latest, row) => (row.tanggal > latest ? row.tanggal : latest), rows[0]?.tanggal ?? new Date());
}
function getWindowStart(latestDate, dateFilter) {
    if (!dateFilter || dateFilter === 'hari-ini') {
        return latestDate;
    }
    const windowDays = dateFilter === '1-bulan' ? 30 : 7;
    const start = new Date(latestDate);
    start.setDate(start.getDate() - (windowDays - 1));
    return start;
}
function filterRows(rows, region, dateFilter, latestOnly = false) {
    const normalizedRegion = region ? normalizeText(region) : '';
    const latestDate = getLatestDate(rows);
    const windowStart = latestOnly ? getWindowStart(latestDate, dateFilter) : (dateFilter ? getWindowStart(latestDate, dateFilter) : null);
    return rows.filter((row) => {
        const matchesRegion = !normalizedRegion || normalizeText(row.kabupatenKota).includes(normalizedRegion);
        const matchesDate = !windowStart || row.tanggal >= windowStart;
        return matchesRegion && matchesDate;
    });
}
function groupByCommodity(rows) {
    const commodityMap = new Map();
    for (const row of rows) {
        const slug = slugify(row.komoditas);
        const bucket = commodityMap.get(slug) ?? [];
        bucket.push(row);
        commodityMap.set(slug, bucket);
    }
    return commodityMap;
}
function groupByDate(rows) {
    const dateMap = new Map();
    for (const row of rows) {
        const key = row.tanggal.toISOString().split('T')[0];
        const bucket = dateMap.get(key) ?? [];
        bucket.push(row);
        dateMap.set(key, bucket);
    }
    return new Map([...dateMap.entries()].sort(([left], [right]) => left.localeCompare(right)));
}
function average(values) {
    if (values.length === 0) {
        return 0;
    }
    const sum = values.reduce((total, value) => total + value, 0);
    return sum / values.length;
}
function resolveUnit(rows) {
    const counts = new Map();
    for (const row of rows) {
        counts.set(row.unit, (counts.get(row.unit) ?? 0) + 1);
    }
    return [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? 'kg';
}
function toCommoditySummary(slug, rows) {
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
function toCommodityHistory(slug, rows) {
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
function buildPrediction(rows, days) {
    const byDate = groupByDate(rows);
    const dates = [...byDate.keys()];
    const series = dates.map((date) => average((byDate.get(date) ?? []).map((row) => row.harga)));
    if (series.length < 2) {
        return { metrics: { mape: 0, rmse: 0 }, forecast: [] };
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
    const forecast = [];
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
    return {
        metrics: {
            mape: parseFloat(mape.toFixed(2)),
            rmse: parseFloat(rmse.toFixed(2)),
        },
        forecast,
    };
}
function getAllCommoditySummaries(region, dateFilter) {
    const rows = filterRows(loadRows(), region, dateFilter, true);
    const grouped = groupByCommodity(rows);
    return [...grouped.entries()]
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([slug, commodityRows]) => toCommoditySummary(slug, commodityRows));
}
function getCommodityHistoryBySlug(slug, region, dateFilter) {
    const normalizedSlug = slugify(slug);
    const rows = loadRows()
        .filter((row) => !region || normalizeText(row.kabupatenKota).includes(normalizeText(region)))
        .filter((row) => slugify(row.komoditas) === normalizedSlug);
    if (rows.length === 0) {
        return null;
    }
    return toCommodityHistory(normalizedSlug, rows);
}
function getPredictionBySlug(slug, days, region) {
    const normalizedSlug = slugify(slug);
    const rows = loadRows()
        .filter((row) => !region || normalizeText(row.kabupatenKota).includes(normalizeText(region)))
        .filter((row) => slugify(row.komoditas) === normalizedSlug);
    if (rows.length < 2) {
        return null;
    }
    const history = toCommodityHistory(normalizedSlug, rows);
    const prediction = buildPrediction(rows, days);
    return {
        commodityId: normalizedSlug,
        commodityName: history.name,
        unit: history.unit,
        modelUsed: 'ARIMA-like trend baseline on storage data',
        metrics: {
            mape: prediction.metrics.mape,
            rmse: prediction.metrics.rmse,
            confidenceLevel: '95%',
        },
        forecast: prediction.forecast,
    };
}
//# sourceMappingURL=storageData.js.map