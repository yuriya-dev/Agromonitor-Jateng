"use client";

import React, { useEffect, useRef } from "react";
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

  useEffect(() => {
    if (!chartContainerRef.current) return;

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

    candlestickSeries.setData(data);

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
  }, [data]);

  return (
    <div className="w-full bg-white border-2 border-border-color shadow-brutal relative p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold uppercase tracking-tight text-lg">Pergerakan Harga (IDR)</h3>
        <div className="flex space-x-2">
          <button className="text-xs font-mono px-3 py-1 bg-surface border border-border-color hover:bg-black hover:text-white transition-colors">1W</button>
          <button className="text-xs font-mono px-3 py-1 bg-black text-white border border-border-color transition-colors">1M</button>
          <button className="text-xs font-mono px-3 py-1 bg-surface border border-border-color hover:bg-black hover:text-white transition-colors">3M</button>
          <button className="text-xs font-mono px-3 py-1 bg-surface border border-border-color hover:bg-black hover:text-white transition-colors">YTD</button>
        </div>
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}
