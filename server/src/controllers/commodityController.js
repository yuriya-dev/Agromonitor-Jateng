"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommodityPrediction = exports.getCommodityBySlug = exports.getAllCommodities = void 0;
const storageData_1 = require("../utils/storageData");
const getAllCommodities = async (req, res) => {
    try {
        const region = typeof req.query.pasar === 'string' ? req.query.pasar : undefined;
        const date = typeof req.query.date === 'string' ? req.query.date : undefined;
        const commodities = (0, storageData_1.getAllCommoditySummaries)(region, date);
        res.json({ success: true, data: commodities });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.getAllCommodities = getAllCommodities;
const getCommodityBySlug = async (req, res) => {
    try {
        const slug = req.params.slug;
        const region = typeof req.query.pasar === 'string' ? req.query.pasar : undefined;
        const date = typeof req.query.date === 'string' ? req.query.date : undefined;
        const commodity = (0, storageData_1.getCommodityHistoryBySlug)(slug, region, date);
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
exports.getCommodityBySlug = getCommodityBySlug;
// Prediksi Harga Menggunakan Regresi Linier dan Moving Average (Simulasi ARIMA/Prophet)
const getCommodityPrediction = async (req, res) => {
    try {
        const slug = req.params.slug;
        const region = typeof req.query.pasar === 'string' ? req.query.pasar : undefined;
        const days = parseInt(req.query.days) || 14; // Default 14 hari
        const prediction = (0, storageData_1.getPredictionBySlug)(slug, days, region);
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
            }
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server Error during prediction' });
    }
};
exports.getCommodityPrediction = getCommodityPrediction;
//# sourceMappingURL=commodityController.js.map