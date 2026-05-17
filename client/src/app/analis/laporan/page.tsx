"use client";

import { Download, FileText, Database, Sliders, Calendar } from "lucide-react";
import { useState } from "react";

export default function AnalisLaporan() {
  const [dateRange, setDateRange] = useState({ start: "2024-05-01", end: "2024-05-17" });

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold uppercase tracking-tight text-xl">Ekspor Data & Laporan Analitik</h3>
          <p className="text-sm font-mono text-accent-grey">Unduh laporan model prediksi dan parameter ke berbagai format.</p>
        </div>
      </div>

      <div className="bg-white border-2 border-border-color shadow-brutal flex flex-col mb-8">
        <div className="p-4 border-b-2 border-border-color bg-surface flex items-center">
          <Calendar size={20} className="mr-2" />
          <h3 className="font-bold uppercase tracking-tight text-lg">Periode Data</h3>
        </div>
        <div className="p-6 flex flex-wrap gap-6 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-mono font-bold uppercase text-foreground mb-2">Tanggal Mulai</label>
            <input 
              type="date" 
              value={dateRange.start}
              onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
              className="w-full border-2 border-border-color p-3 font-mono text-sm outline-none focus:border-foreground transition-colors" 
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-mono font-bold uppercase text-foreground mb-2">Tanggal Akhir</label>
            <input 
              type="date" 
              value={dateRange.end}
              onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
              className="w-full border-2 border-border-color p-3 font-mono text-sm outline-none focus:border-foreground transition-colors" 
            />
          </div>
          <button className="bg-surface border-2 border-border-color px-6 py-3 font-mono text-sm font-bold uppercase hover:border-foreground transition-colors">
            Terapkan Filter
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-2 border-border-color flex flex-col items-center text-center hover:border-accent-red hover:-translate-y-2 hover:shadow-brutal transition-all group p-8">
          <div className="w-16 h-16 bg-red-50 border-2 border-accent-red flex items-center justify-center rounded-full mb-6 group-hover:bg-accent-red transition-colors">
            <FileText size={32} className="text-accent-red group-hover:text-white transition-colors" />
          </div>
          <h4 className="font-bold uppercase text-lg mb-2 group-hover:text-accent-red transition-colors">Laporan PDF</h4>
          <p className="text-xs font-mono text-accent-grey mb-8 flex-1">Full Executive Summary Report berisi visualisasi harga, tren ARIMA, dan output akhir SPK SAW.</p>
          <button className="w-full bg-white text-accent-red border-2 border-accent-red font-mono font-bold uppercase py-3 flex justify-center items-center group-hover:bg-accent-red group-hover:text-white transition-colors">
            <Download size={18} className="mr-2" />
            Unduh (.pdf)
          </button>
        </div>
        
        <div className="bg-white border-2 border-border-color flex flex-col items-center text-center hover:border-accent-green hover:-translate-y-2 hover:shadow-brutal transition-all group p-8">
          <div className="w-16 h-16 bg-green-50 border-2 border-accent-green flex items-center justify-center rounded-full mb-6 group-hover:bg-accent-green transition-colors">
            <Database size={32} className="text-accent-green group-hover:text-white transition-colors" />
          </div>
          <h4 className="font-bold uppercase text-lg mb-2 group-hover:text-accent-green transition-colors">Raw Dataset CSV</h4>
          <p className="text-xs font-mono text-accent-grey mb-8 flex-1">Dataset historis harga komoditas dalam rentang waktu yang dipilih untuk keperluan olah data eksternal.</p>
          <button className="w-full bg-white text-accent-green border-2 border-accent-green font-mono font-bold uppercase py-3 flex justify-center items-center group-hover:bg-accent-green group-hover:text-white transition-colors">
            <Download size={18} className="mr-2" />
            Unduh (.csv)
          </button>
        </div>

        <div className="bg-white border-2 border-border-color flex flex-col items-center text-center hover:border-foreground hover:-translate-y-2 hover:shadow-brutal transition-all group p-8">
          <div className="w-16 h-16 bg-gray-100 border-2 border-foreground flex items-center justify-center rounded-full mb-6 group-hover:bg-foreground transition-colors">
            <Sliders size={32} className="text-foreground group-hover:text-white transition-colors" />
          </div>
          <h4 className="font-bold uppercase text-lg mb-2 group-hover:text-foreground transition-colors">Hasil Prediksi JSON</h4>
          <p className="text-xs font-mono text-accent-grey mb-8 flex-1">Output raw format JSON dari model ARIMA (termasuk nilai p,d,q) dan kalkulasi matriks SPK SAW.</p>
          <button className="w-full bg-white text-foreground border-2 border-foreground font-mono font-bold uppercase py-3 flex justify-center items-center group-hover:bg-foreground group-hover:text-white transition-colors">
            <Download size={18} className="mr-2" />
            Unduh (.json)
          </button>
        </div>
      </div>
    </>
  );
}
