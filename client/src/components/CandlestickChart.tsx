"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { createChart, ColorType, IChartApi, CandlestickSeries, AreaSeries } from "lightweight-charts";

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
  const [chartType, setChartType] = useState<"candlestick" | "area">("area");

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

    // Add Series based on chartType
    if (chartType === "candlestick") {
      const candlestickSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#00E676", // Laser Green
        downColor: "#D32F2F", // Solid Blood Red
        borderVisible: false,
        wickUpColor: "#00E676",
        wickDownColor: "#D32F2F",
      });
      candlestickSeries.setData(filteredData);
    } else {
      // Calculate trend direction to style the line color dynamically
      let isTrendUp = true;
      if (filteredData.length >= 2) {
        const first = filteredData[0].close;
        const last = filteredData[filteredData.length - 1].close;
        isTrendUp = last >= first;
      }
      
      const lineColor = isTrendUp ? "#00E676" : "#D32F2F";
      const topColor = isTrendUp ? "rgba(0, 230, 118, 0.2)" : "rgba(211, 47, 47, 0.2)";
      
      const areaSeries = chart.addSeries(AreaSeries, {
        topColor,
        bottomColor: "rgba(0, 0, 0, 0.0)",
        lineColor,
        lineWidth: 3,
      });
      
      areaSeries.setData(filteredData.map(d => ({ time: d.time, value: d.close })));
    }

    // Fit content so the selected timeframe is scaled correctly
    chart.timeScale().fitContent();

    // Use ResizeObserver to handle element resizing (e.g. initial layout, grid changes)
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

    // Handle Resize (window event fallback)
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
  }, [filteredData, chartType]);

  return (
    <div className="w-full bg-white border-2 border-border-color shadow-brutal relative p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <h3 className="font-bold uppercase tracking-tight text-lg">Pergerakan Harga (IDR)</h3>
        <div className="flex flex-wrap items-center gap-3">
          {/* Tipe Grafik */}
          <div className="flex border-2 border-border-color">
            <button
              onClick={() => setChartType("candlestick")}
              className={`text-xs font-mono px-3 py-1 font-bold transition-colors ${
                chartType === "candlestick"
                  ? "bg-black text-white"
                  : "bg-surface hover:bg-gray-200 text-black border-r border-border-color"
              }`}
            >
              LILIN
            </button>
            <button
              onClick={() => setChartType("area")}
              className={`text-xs font-mono px-3 py-1 font-bold transition-colors ${
                chartType === "area"
                  ? "bg-black text-white"
                  : "bg-surface hover:bg-gray-200 text-black border-l border-border-color"
              }`}
            >
              GARIS
            </button>
          </div>

          {/* Timeframe Buttons */}
          <div className="flex space-x-1">
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
      </div>
      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}
