"use client";

import React, { useEffect, useRef, useState } from "react";
import { createChart, ColorType, IChartApi, LineSeries } from "lightweight-charts";
import { Info } from "lucide-react";
import { API_BASE } from "@/lib/api-config";

interface PredictionData {
  time: string;
  value: number;
  upperBound: number;
  lowerBound: number;
}

interface PredictionResponse {
  success: boolean;
  data?: {
    modelUsed: string;
    metrics: {
      mape: number;
      rmse: number;
      confidenceLevel: string;
    };
    forecast: PredictionData[];
    trendDirection?: string;
    priceChangePercent?: number;
    volatility?: string;
    alertTrigger?: string;
    dynamicNote?: string;
  };
}

interface PredictionSectionProps {
  commodityId: string;
  name: string;
  pasar?: string;
  commoditiesList?: Array<{ id: string; name: string }>;
  onCommodityChange?: (id: string, name: string) => void;
}

export default function PredictionSection({ commodityId, name, pasar, commoditiesList, onCommodityChange }: PredictionSectionProps) {
  const [days, setDays] = useState<number>(14);
  const [loading, setLoading] = useState<boolean>(true);
  const [prediction, setPrediction] = useState<PredictionResponse["data"] | null>(null);
  
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set("days", days.toString());
        if (pasar) {
          queryParams.set("pasar", pasar);
        }
        const res = await fetch(`${API_BASE}/commodities/${commodityId}/predict?${queryParams.toString()}`);
        const data: PredictionResponse = await res.json();
        
        if (data.success && data.data) {
          setPrediction(data.data);
        }
      } catch (error) {
        console.error("Gagal mengambil data prediksi", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrediction();
  }, [commodityId, days, pasar]);

  useEffect(() => {
    if (!chartContainerRef.current || !prediction || prediction.forecast.length === 0) return;

    // Create Chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "#FFFFFF" },
        textColor: "#000000",
      },
      grid: {
        vertLines: { color: "#E0E0E0" },
        horzLines: { color: "#E0E0E0" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 320,
      timeScale: {
        timeVisible: true,
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

    const confidenceLabel = prediction.metrics?.confidenceLevel || "95%";

    // Garis Batas Atas (Merah)
    const upperSeries = chart.addSeries(LineSeries, {
      color: "#ef4444",
      lineWidth: 2,
      lineStyle: 2, // Dashed
      title: `Batas Atas (${confidenceLabel})`,
    });
    upperSeries.setData(processSeriesData(prediction.forecast.map(p => ({ time: p.time, value: p.upperBound }))));

    // Garis Batas Bawah (Hijau)
    const lowerSeries = chart.addSeries(LineSeries, {
      color: "#10b981",
      lineWidth: 2,
      lineStyle: 2, // Dashed
      title: `Batas Bawah (${confidenceLabel})`,
    });
    lowerSeries.setData(processSeriesData(prediction.forecast.map(p => ({ time: p.time, value: p.lowerBound }))));

    // Garis Prediksi Utama (Hitam Solid)
    const mainSeries = chart.addSeries(LineSeries, {
      color: "#000000",
      lineWidth: 3,
      title: "Prediksi Harga",
    });
    mainSeries.setData(processSeriesData(prediction.forecast.map(p => ({ time: p.time, value: p.value }))));

    chart.timeScale().fitContent();

    // Use ResizeObserver to handle element resizing
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
  }, [prediction]);

  return (
    <div className="bg-white border-2 border-border-color shadow-brutal p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border-color pb-4 mb-6 gap-4">
        <div>
          <h3 className="font-bold uppercase tracking-tight text-xl">Grafik Prediksi Machine Learning</h3>
          <p className="text-xs font-mono text-accent-grey mt-0.5">Proyeksi Pergerakan Harga & Interval Kepercayaan untuk {name}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {commoditiesList && onCommodityChange && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase">Komoditas:</span>
              <select
                value={commodityId}
                onChange={(e) => {
                  const selected = commoditiesList.find(c => c.id === e.target.value);
                  if (selected) {
                    onCommodityChange(selected.id, selected.name);
                  }
                }}
                className="border-2 border-border-color bg-surface p-1.5 font-mono text-xs font-bold outline-none cursor-pointer hover:bg-white transition-colors"
              >
                {commoditiesList.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex space-x-1 border border-border-color p-0.5 bg-surface">
            {[7, 14, 30].map(d => (
              <button 
                key={d}
                onClick={() => setDays(d)}
                className={`text-xs font-mono px-3 py-1 font-bold transition-colors ${days === d ? 'bg-black text-white' : 'bg-transparent text-black hover:bg-gray-200'}`}
              >
                {d} HARI
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="w-full h-[320px] flex items-center justify-center font-mono border-2 border-dashed border-border-color">
          MEMPROSES MODEL ML PREDIKSI...
        </div>
      ) : prediction ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-surface border border-border-color">
              <div className="text-xs font-mono text-accent-grey uppercase">Model Aktif</div>
              <div className="font-mono font-bold text-base mt-1 truncate" title={prediction.modelUsed}>{prediction.modelUsed}</div>
            </div>
            <div className="p-4 bg-surface border border-border-color">
              <div className="text-xs font-mono text-accent-grey uppercase">Akurasi MAPE</div>
              <div className="font-mono font-bold text-lg mt-1 text-accent-green">{prediction.metrics.mape}% <span className="text-xs text-accent-grey font-normal">(Confidence: {prediction.metrics.confidenceLevel || "95%"})</span></div>
            </div>
            <div className="p-4 bg-surface border border-border-color">
              <div className="text-xs font-mono text-accent-grey uppercase">Error RMSE</div>
              <div className="font-mono font-bold text-lg mt-1">Rp {prediction.metrics.rmse}</div>
            </div>
          </div>

          {/* Chart Visual Legend */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-surface border-x-2 border-t-2 border-border-color text-xs font-mono font-bold">
            <div className="flex items-center space-x-2">
              <span className="w-4 h-0.5 bg-red-500 inline-block border-b-2 border-dashed border-red-500"></span>
              <span>Batas Atas (+{prediction.metrics.confidenceLevel || "95%"})</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-4 h-1 bg-black inline-block"></span>
              <span>Prediksi Utama ARIMA</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-4 h-0.5 bg-emerald-500 inline-block border-b-2 border-dashed border-emerald-500"></span>
              <span>Batas Bawah (-{prediction.metrics.confidenceLevel || "95%"})</span>
            </div>
          </div>

          {/* Chart Container */}
          <div className="w-full border-2 border-border-color mb-6 p-2 bg-white">
            <div ref={chartContainerRef} className="w-full" />
          </div>

          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-sm font-mono text-gray-800 flex items-start shadow-sm">
            <Info size={20} className="mr-3 flex-shrink-0 mt-0.5 text-yellow-600" />
            <div>
              <strong>Catatan Prediksi & Interval Kepercayaan:</strong> {prediction.dynamicNote || `Garis hitam adalah harga prediksi utama. Garis putus-putus merah dan hijau menunjukkan interval kepercayaan ${prediction.metrics.confidenceLevel || "95%"}. Pergerakan harga asli diperkirakan berada dalam koridor tersebut.`}
            </div>
          </div>
        </>
      ) : (
        <div className="w-full h-[100px] flex items-center justify-center font-mono text-accent-red border-2 border-dashed border-border-color">
          GAGAL MEMUAT DATA PREDIKSI
        </div>
      )}
    </div>
  );
}

