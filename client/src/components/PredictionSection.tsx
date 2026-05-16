"use client";

import React, { useEffect, useRef, useState } from "react";
import { createChart, ColorType, IChartApi, LineSeries } from "lightweight-charts";
import { AlertTriangle, Info } from "lucide-react";

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
  };
}

interface PredictionSectionProps {
  commodityId: string;
  name: string;
}

export default function PredictionSection({ commodityId, name }: PredictionSectionProps) {
  const [days, setDays] = useState<number>(14);
  const [loading, setLoading] = useState<boolean>(true);
  const [prediction, setPrediction] = useState<PredictionResponse["data"] | null>(null);
  
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    const fetchPrediction = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5001/api/commodities/${commodityId}/predict?days=${days}`);
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
  }, [commodityId, days]);

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
      height: 300,
      timeScale: {
        timeVisible: true,
      },
      crosshair: {
        mode: 1,
      },
    });

    chartRef.current = chart;

    // Tambahkan Area Series untuk Confidence Band (Menggunakan dua Line Series karena lightweight-charts tidak punya fill range area asli yang diapit dua garis, pendekatan lain adalah menggunakan custom plugin, tapi Line + area fill ke bottom adalah default)
    // Sebagai alternatif visual brutalist, kita gambar 3 garis (Upper, Main, Lower)

    // Garis Batas Atas (Merah)
    const upperSeries = chart.addSeries(LineSeries, {
      color: "#ff8a8a",
      lineWidth: 1,
      lineStyle: 2, // Dashed
      title: "Batas Atas (+95%)",
    });
    upperSeries.setData(prediction.forecast.map(p => ({ time: p.time, value: p.upperBound })));

    // Garis Batas Bawah (Hijau)
    const lowerSeries = chart.addSeries(LineSeries, {
      color: "#8affab",
      lineWidth: 1,
      lineStyle: 2, // Dashed
      title: "Batas Bawah (-95%)",
    });
    lowerSeries.setData(prediction.forecast.map(p => ({ time: p.time, value: p.lowerBound })));

    // Garis Prediksi Utama (Biru/Hitam Solid)
    const mainSeries = chart.addSeries(LineSeries, {
      color: "#000000",
      lineWidth: 3,
      title: "Prediksi Harga",
    });
    mainSeries.setData(prediction.forecast.map(p => ({ time: p.time, value: p.value })));

    chart.timeScale().fitContent();

    // Handle Resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, [prediction]);

  return (
    <div className="bg-white border-2 border-border-color shadow-brutal p-6">
      <div className="flex justify-between items-center border-b border-border-color pb-4 mb-6">
        <h3 className="font-bold uppercase tracking-tight text-xl">Prediksi Machine Learning</h3>
        
        <div className="flex space-x-2">
          {[7, 14, 30].map(d => (
            <button 
              key={d}
              onClick={() => setDays(d)}
              className={`text-xs font-mono px-3 py-1 border border-border-color transition-colors ${days === d ? 'bg-black text-white' : 'bg-surface hover:bg-gray-200'}`}
            >
              {d} HARI
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="w-full h-[300px] flex items-center justify-center font-mono border-2 border-dashed border-border-color">
          MEMPROSES MODEL ML...
        </div>
      ) : prediction ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-surface border border-border-color">
              <div className="text-xs font-mono text-accent-grey uppercase">Model Aktif</div>
              <div className="font-mono font-bold text-lg mt-1">{prediction.modelUsed}</div>
            </div>
            <div className="p-4 bg-surface border border-border-color">
              <div className="text-xs font-mono text-accent-grey uppercase">Akurasi MAPE</div>
              <div className="font-mono font-bold text-lg mt-1">{prediction.metrics.mape}% <span className="text-xs text-accent-green ml-1">(Baik)</span></div>
            </div>
            <div className="p-4 bg-surface border border-border-color">
              <div className="text-xs font-mono text-accent-grey uppercase">Error RMSE</div>
              <div className="font-mono font-bold text-lg mt-1">Rp {prediction.metrics.rmse}</div>
            </div>
          </div>

          {/* Chart Container */}
          <div className="w-full border-2 border-border-color mb-6 p-2 bg-surface">
            <div ref={chartContainerRef} className="w-full" />
          </div>

          <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-sm font-mono text-gray-800 flex items-start">
            <Info size={20} className="mr-3 flex-shrink-0 mt-0.5 text-yellow-600" />
            <div>
              <strong>Catatan Prediksi:</strong> Garis hitam adalah harga prediksi. Garis putus-putus menunjukkan interval kepercayaan {prediction.metrics.confidenceLevel}. Pergerakan harga asli kemungkinan besar akan berada di dalam rentang tersebut berdasarkan pola tren 90 hari terakhir.
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
