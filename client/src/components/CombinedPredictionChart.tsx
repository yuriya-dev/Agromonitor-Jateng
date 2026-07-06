"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { createChart, ColorType, IChartApi, LineSeries } from "lightweight-charts";
import { Info, Calendar, RefreshCw } from "lucide-react";
import { API_BASE } from "@/lib/api-config";

interface HistoricalDataPoint {
  time: string;
  close: number;
  open: number;
  high: number;
  low: number;
}

interface PredictionDataPoint {
  time: string;
  value: number;
  upperBound: number;
  lowerBound: number;
}

interface PredictionMetrics {
  mape: number;
  rmse: number;
  confidenceLevel: string;
}

interface CombinedPredictionChartProps {
  commodityId: string;
  name: string;
  pasar?: string;
  commoditiesList?: Array<{ id: string; name: string; unit?: string }>;
  onCommodityChange?: (id: string, name: string) => void;
}

export default function CombinedPredictionChart({
  commodityId,
  name,
  pasar,
  commoditiesList,
  onCommodityChange,
}: CombinedPredictionChartProps) {
  const [historicalDays, setHistoricalDays] = useState<number>(30); // 30, 60, 90, 180
  const [forecastDays, setForecastDays] = useState<number>(14); // 7, 14, 30
  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [predictionData, setPredictionData] = useState<{
    forecast: PredictionDataPoint[];
    fittedValues?: Array<{ time: string; value: number }>;
    metrics: PredictionMetrics;
    modelUsed: string;
    dynamicNote?: string;
    priceChangePercent?: number;
  } | null>(null);

  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch historical data
      const histUrl = `${API_BASE}/commodities/${commodityId}${pasar ? `?pasar=${encodeURIComponent(pasar)}` : ''}`;
      const histRes = await fetch(histUrl);
      const histJson = await histRes.json();
      
      // 2. Fetch prediction data
      const predUrl = `${API_BASE}/commodities/${commodityId}/predict?days=${forecastDays}${pasar ? `&pasar=${encodeURIComponent(pasar)}` : ''}`;
      const predRes = await fetch(predUrl);
      const predJson = await predRes.json();

      if (histJson.success && histJson.data) {
        setHistoricalData(histJson.data.prices || []);
      } else {
        throw new Error("Gagal mengambil data harga historis");
      }

      if (predJson.success && predJson.data) {
        setPredictionData(predJson.data);
      } else {
        throw new Error("Gagal mengambil data prediksi ML");
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat grafik.");
    } finally {
      setLoading(false);
    }
  }, [commodityId, forecastDays, pasar]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (!chartContainerRef.current || historicalData.length === 0 || !predictionData) return;

    // Filter historical data based on historicalDays selection
    let filteredHist = historicalData;
    if (historicalDays > 0 && historicalData.length > 0) {
      const latestDateStr = historicalData[historicalData.length - 1].time;
      const latestDate = new Date(latestDateStr);
      const cutoffDate = new Date(latestDate);
      cutoffDate.setDate(cutoffDate.getDate() - historicalDays);

      filteredHist = historicalData.filter((item) => new Date(item.time) >= cutoffDate);
    }

    // Create Chart Instance
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#FFFFFF" },
        textColor: "#000000",
      },
      grid: {
        vertLines: { color: "#F0F0F0" },
        horzLines: { color: "#F0F0F0" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 380,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 1,
      },
    });

    chartRef.current = chart;

    const processSeriesData = (data: Array<{ time: string; value: number }>) => {
      if (!data || data.length === 0) return [];
      const mapped = data.map(item => ({
        time: typeof item.time === 'string' ? item.time.split('T')[0] : item.time,
        value: Number(item.value)
      }));
      mapped.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
      const result: Array<{ time: string; value: number }> = [];
      const seen = new Set<string>();
      for (const pt of mapped) {
        if (!seen.has(pt.time)) {
          seen.add(pt.time);
          result.push(pt);
        }
      }
      return result;
    };

    const confidenceLabel = predictionData.metrics?.confidenceLevel || "95%";

    // 1. Seri Harga Asli (Historis) - Biru Solid / Tebal
    const histSeries = chart.addSeries(LineSeries, {
      color: "#2563eb", // Vibrant Blue
      lineWidth: 3,
      title: "Harga Asli (Historis)",
    });
    const cleanHist = processSeriesData(filteredHist.map(h => ({ time: h.time, value: h.close })));
    histSeries.setData(cleanHist);

    // Connect last historical point to forecast start for continuous line presentation
    const lastHistPoint = cleanHist.length > 0 ? cleanHist[cleanHist.length - 1] : null;
    
    const rawForecastPoints = predictionData.forecast.map(p => ({ time: p.time, value: p.value }));
    const rawUpperPoints = predictionData.forecast.map(p => ({ time: p.time, value: p.upperBound }));
    const rawLowerPoints = predictionData.forecast.map(p => ({ time: p.time, value: p.lowerBound }));

    if (lastHistPoint) {
      const connectPoint = { time: lastHistPoint.time, value: lastHistPoint.value };
      rawForecastPoints.unshift(connectPoint);
      rawUpperPoints.unshift(connectPoint);
      rawLowerPoints.unshift(connectPoint);
    }

    const cleanForecast = processSeriesData(rawForecastPoints);
    const cleanUpper = processSeriesData(rawUpperPoints);
    const cleanLower = processSeriesData(rawLowerPoints);

    // 2. Seri Batas Atas Interval Kepercayaan - Merah Putus-putus
    const upperSeries = chart.addSeries(LineSeries, {
      color: "#ef4444", // Red
      lineWidth: 2,
      lineStyle: 2, // Dashed
      title: `Batas Atas (${confidenceLabel})`,
    });
    upperSeries.setData(cleanUpper);

    // 3. Seri Batas Bawah Interval Kepercayaan - Hijau Putus-putus
    const lowerSeries = chart.addSeries(LineSeries, {
      color: "#10b981", // Emerald Green
      lineWidth: 2,
      lineStyle: 2, // Dashed
      title: `Batas Bawah (${confidenceLabel})`,
    });
    lowerSeries.setData(cleanLower);

    // 4. Seri Prediksi Utama (ARIMA) - Hitam Solid / Tebal
    const predSeries = chart.addSeries(LineSeries, {
      color: "#000000", // Black
      lineWidth: 3,
      title: "Proyeksi Prediksi",
    });
    predSeries.setData(cleanForecast);

    // 5. Seri Prediksi Historis (Fitted Values) - Abu-abu Putus-putus
    const fittedSeries = chart.addSeries(LineSeries, {
      color: "#9ca3af", // Gray
      lineWidth: 2.5,
      lineStyle: 2, // Dashed
      title: "Prediksi Historis (Model Fit)",
    });
    let filteredFitted = predictionData.fittedValues || [];
    if (historicalDays > 0 && filteredFitted.length > 0) {
      const latestDateStr = historicalData[historicalData.length - 1].time;
      const latestDate = new Date(latestDateStr);
      const cutoffDate = new Date(latestDate);
      cutoffDate.setDate(cutoffDate.getDate() - historicalDays);

      filteredFitted = filteredFitted.filter((item: { time: string; value: number }) => new Date(item.time) >= cutoffDate);
    }
    const cleanFitted = processSeriesData(filteredFitted);
    fittedSeries.setData(cleanFitted);

    chart.timeScale().fitContent();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        if (width > 0) {
          chart.applyOptions({ width });
        }
      }
    });

    if (chartContainerRef.current) {
      resizeObserver.observe(chartContainerRef.current);
    }

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [historicalData, predictionData, historicalDays]);

  const currentPrice = historicalData.length > 0 ? historicalData[historicalData.length - 1].close : 0;
  const projectedPrice = predictionData && predictionData.forecast.length > 0 ? predictionData.forecast[predictionData.forecast.length - 1].value : 0;

  return (
    <div className="bg-white border-2 border-border-color shadow-brutal p-6">
      {/* Top Controls Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center border-b-2 border-border-color pb-6 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-bold uppercase tracking-tight text-2xl">Grafik Prediksi & Harga Asli</h3>
            <span className="bg-black text-white text-[10px] font-mono font-bold px-2 py-0.5 uppercase">TERINTEGRASI</span>
          </div>
          <p className="text-xs font-mono text-accent-grey mt-1">
            Visualisasi terpadu pergerakan harga riil historis dan proyeksi masa depan untuk <strong className="text-foreground">{name.toUpperCase()}</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {commoditiesList && onCommodityChange && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase text-accent-grey">Pilih Komoditas:</span>
              <select
                value={commodityId}
                onChange={(e) => {
                  const selected = commoditiesList.find(c => c.id === e.target.value);
                  if (selected) {
                    onCommodityChange(selected.id, selected.name);
                  }
                }}
                className="border-2 border-border-color bg-surface p-2 font-mono text-sm font-bold outline-none cursor-pointer hover:bg-white transition-colors shadow-sm"
              >
                {commoditiesList.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={fetchData}
            className="border-2 border-border-color bg-surface p-2 hover:bg-white hover:shadow-brutal transition-all active:translate-y-1 active:shadow-none"
            title="Muat Ulang Data"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Range Selection Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-surface p-3 border border-border-color">
        <div className="flex items-center space-x-2">
          <Calendar size={16} className="text-accent-grey" />
          <span className="text-xs font-mono font-bold uppercase">Rentang Historis:</span>
          {[
            { label: "30 HARI", val: 30 },
            { label: "60 HARI", val: 60 },
            { label: "90 HARI", val: 90 },
            { label: "SEMUA", val: 0 },
          ].map(h => (
            <button
              key={h.label}
              onClick={() => setHistoricalDays(h.val)}
              className={`text-xs font-mono px-2.5 py-1 border border-border-color font-bold transition-colors ${
                historicalDays === h.val ? "bg-blue-600 text-white" : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              {h.label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-bold uppercase">Proyeksi ML:</span>
          {[7, 14, 30].map(d => (
            <button
              key={d}
              onClick={() => setForecastDays(d)}
              className={`text-xs font-mono px-2.5 py-1 border border-border-color font-bold transition-colors ${
                forecastDays === d ? "bg-black text-white" : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              +{d} HARI
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="w-full h-[380px] flex items-center justify-center font-mono border-2 border-dashed border-border-color">
          MEMUAT GRAFIK HISTORIS & PREDIKSI...
        </div>
      ) : error ? (
        <div className="w-full h-[150px] flex items-center justify-center font-mono text-accent-red border-2 border-dashed border-border-color">
          {error}
        </div>
      ) : predictionData ? (
        <>
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-blue-50/50 border-2 border-blue-200">
              <div className="text-[10px] font-mono text-blue-800 font-bold uppercase">Harga Asli Terakhir</div>
              <div className="font-mono font-bold text-xl mt-1 text-blue-900">
                Rp {currentPrice.toLocaleString("id-ID")}
              </div>
            </div>

            <div className="p-4 bg-surface border-2 border-border-color">
              <div className="text-[10px] font-mono text-accent-grey font-bold uppercase">Proyeksi H+{forecastDays}</div>
              <div className="font-mono font-bold text-xl mt-1 flex items-center gap-1">
                Rp {Math.round(projectedPrice).toLocaleString("id-ID")}
                {predictionData.priceChangePercent !== undefined && (
                  <span className={`text-xs ${predictionData.priceChangePercent > 0 ? "text-accent-red" : "text-accent-green"}`}>
                    ({predictionData.priceChangePercent > 0 ? `+${predictionData.priceChangePercent.toFixed(1)}%` : `${predictionData.priceChangePercent.toFixed(1)}%`})
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 bg-surface border-2 border-border-color">
              <div className="text-[10px] font-mono text-accent-grey font-bold uppercase">Akurasi MAPE</div>
              <div className="font-mono font-bold text-xl mt-1 text-accent-green">
                {predictionData.metrics.mape}%
              </div>
            </div>

            <div className="p-4 bg-surface border-2 border-border-color">
              <div className="text-[10px] font-mono text-accent-grey font-bold uppercase">Interval Kepercayaan</div>
              <div className="font-mono font-bold text-xl mt-1">
                {predictionData.metrics.confidenceLevel || "95%"}
              </div>
            </div>
          </div>

          {/* Legend Explanation */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-surface border-x-2 border-t-2 border-border-color text-xs font-mono font-bold">
            <div className="flex items-center space-x-2">
              <span className="w-4 h-1 bg-blue-600 inline-block"></span>
              <span>Harga Asli / Riil (Historis)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-4 h-0.5 bg-gray-400 inline-block border-b-2 border-dashed border-gray-400"></span>
              <span>Prediksi Historis (Model Fit)</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-4 h-1 bg-black inline-block"></span>
              <span>Proyeksi Utama ARIMA</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-4 h-0.5 bg-red-500 inline-block border-b-2 border-dashed border-red-500"></span>
              <span>Batas Atas ({predictionData.metrics.confidenceLevel || "95%"})</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-4 h-0.5 bg-emerald-500 inline-block border-b-2 border-dashed border-emerald-500"></span>
              <span>Batas Bawah ({predictionData.metrics.confidenceLevel || "95%"})</span>
            </div>
          </div>

          {/* Chart Container */}
          <div className="w-full border-2 border-border-color mb-6 p-2 bg-white">
            <div ref={chartContainerRef} className="w-full" />
          </div>

          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-sm font-mono text-gray-800 flex items-start shadow-sm">
            <Info size={20} className="mr-3 flex-shrink-0 mt-0.5 text-yellow-600" />
            <div>
              <strong>Catatan Integrasi Grafik:</strong> Grafik di atas menyatukan deret data harga riil historis (garis biru), prediksi model historis/fitted values (garis putus-abu), serta proyeksi prediksi ARIMA masa depan (garis hitam) lengkap dengan batas atas (garis merah) & bawah (garis hijau) interval kepercayaan. Rentang waktu disesuaikan secara otomatis sesuai dengan filter yang aktif.
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
