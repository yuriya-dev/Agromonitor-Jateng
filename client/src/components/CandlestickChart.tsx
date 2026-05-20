"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { createChart, ColorType, IChartApi, CandlestickSeries } from "lightweight-charts";

interface CandlestickData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface CandlestickChartProps {
  data: CandlestickData[];
}

export default function CandlestickChart({ data }: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [days, setDays] = useState<number | null>(30); // Default to 30 days (1 month)

  // Saring data berdasarkan hari terpilih secara efisien di sisi klien
  const filteredData = useMemo(() => {
    if (!days || data.length === 0) return data;

    const latestDateStr = data[data.length - 1]?.time;
    if (!latestDateStr) return data;

    const latestDate = new Date(latestDateStr);
    const cutoffDate = new Date(latestDate);
    cutoffDate.setDate(cutoffDate.getDate() - days);

    return data.filter((item) => {
      const itemDate = new Date(item.time);
      return itemDate >= cutoffDate;
    });
  }, [data, days]);

  useEffect(() => {
    if (!chartContainerRef.current || filteredData.length === 0) return;

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
      height: 400,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      crosshair: {
        mode: 1, // Normal mode
        vertLine: {
          color: "#9E9E9E",
          width: 1,
          style: 1,
          labelBackgroundColor: "#000000",
        },
        horzLine: {
          color: "#9E9E9E",
          width: 1,
          style: 1,
          labelBackgroundColor: "#000000",
        },
      },
    });

    chartRef.current = chart;

    // Add Candlestick Series
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#00E676", // Laser Green
      downColor: "#D32F2F", // Solid Blood Red
      borderVisible: false,
      wickUpColor: "#00E676",
      wickDownColor: "#D32F2F",
    });

    candlestickSeries.setData(filteredData);

    // Fit content so the selected timeframe is scaled correctly
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
  }, [filteredData]);

  return (
    <div className="w-full bg-white border-2 border-border-color shadow-brutal relative p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold uppercase tracking-tight text-lg">Pergerakan Harga (IDR)</h3>
        <div className="flex space-x-2">
          {[
            { label: "7 HARI", val: 7 },
            { label: "30 HARI", val: 30 },
            { label: "3 BULAN", val: 90 },
            { label: "SEMUA", val: null },
          ].map((tf) => (
            <button
              key={tf.label}
              onClick={() => setDays(tf.val)}
              className={`text-xs font-mono px-3 py-1 border border-border-color transition-colors ${
                days === tf.val
                  ? "bg-black text-white animate-pulse-once"
                  : "bg-surface hover:bg-gray-200 text-black"
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}
