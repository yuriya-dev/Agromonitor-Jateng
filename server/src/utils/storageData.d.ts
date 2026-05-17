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
export declare function getAllCommoditySummaries(region?: string, dateFilter?: string): CommoditySummary[];
export declare function getCommodityHistoryBySlug(slug: string, region?: string, dateFilter?: string): CommodityHistory | null;
export declare function getPredictionBySlug(slug: string, days: number, region?: string): {
    commodityId: string;
    commodityName: string;
    unit: string;
    modelUsed: string;
    metrics: {
        mape: number;
        rmse: number;
        confidenceLevel: string;
    };
    forecast: {
        time: string;
        value: number;
        upperBound: number;
        lowerBound: number;
    }[];
} | null;
