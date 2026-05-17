"use client";

import { Sliders, Save, AlertTriangle, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function AnalisSAW() {
  const [weights, setWeights] = useState({
    c1: 40,
    c2: 30,
    c3: 20,
    c4: 10
  });
  
  const [total, setTotal] = useState(100);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    setTotal(weights.c1 + weights.c2 + weights.c3 + weights.c4);
    setIsSaved(false);
  }, [weights]);

  const handleChange = (key: keyof typeof weights, value: number) => {
    setWeights(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (total === 100) {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold uppercase tracking-tight text-xl">Parameter SPK SAW</h3>
          <p className="text-sm font-mono text-accent-grey">Atur bobot kriteria untuk Sistem Pendukung Keputusan. Total harus 100%.</p>
        </div>
      </div>

      <div className="bg-white border-2 border-border-color shadow-brutal flex flex-col max-w-3xl">
        <div className="p-4 border-b-2 border-border-color bg-surface flex items-center justify-between">
          <div className="flex items-center">
            <Sliders size={20} className="mr-2" />
            <h3 className="font-bold uppercase tracking-tight text-lg">Bobot Kriteria (SAW)</h3>
          </div>
          <div className={`font-mono font-bold text-sm px-3 py-1 border-2 ${
            total === 100 ? "bg-green-100 text-accent-green border-accent-green" : "bg-red-100 text-accent-red border-accent-red"
          }`}>
            TOTAL: {total}%
          </div>
        </div>
        <div className="p-8 flex-1">
          <div className="space-y-8">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-mono font-bold uppercase text-foreground">Volatilitas Harga (C1)</label>
                <span className="text-sm font-mono font-bold text-foreground">{weights.c1}%</span>
              </div>
              <input 
                type="range" min="0" max="100" 
                value={weights.c1} 
                onChange={(e) => handleChange("c1", parseInt(e.target.value))}
                className="w-full accent-foreground" 
              />
              <p className="text-[10px] font-mono text-accent-grey mt-1">Bobot prioritas untuk fluktuasi harga antar waktu</p>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-mono font-bold uppercase text-foreground">Tingkat Inflasi Daerah (C2)</label>
                <span className="text-sm font-mono font-bold text-foreground">{weights.c2}%</span>
              </div>
              <input 
                type="range" min="0" max="100" 
                value={weights.c2} 
                onChange={(e) => handleChange("c2", parseInt(e.target.value))}
                className="w-full accent-foreground" 
              />
              <p className="text-[10px] font-mono text-accent-grey mt-1">Bobot prioritas untuk data makroekonomi wilayah</p>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-mono font-bold uppercase text-foreground">Ketersediaan Stok (C3)</label>
                <span className="text-sm font-mono font-bold text-foreground">{weights.c3}%</span>
              </div>
              <input 
                type="range" min="0" max="100" 
                value={weights.c3} 
                onChange={(e) => handleChange("c3", parseInt(e.target.value))}
                className="w-full accent-foreground" 
              />
              <p className="text-[10px] font-mono text-accent-grey mt-1">Bobot prioritas untuk volume persediaan di pasar</p>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-mono font-bold uppercase text-foreground">Jarak Distribusi (C4)</label>
                <span className="text-sm font-mono font-bold text-foreground">{weights.c4}%</span>
              </div>
              <input 
                type="range" min="0" max="100" 
                value={weights.c4} 
                onChange={(e) => handleChange("c4", parseInt(e.target.value))}
                className="w-full accent-foreground" 
              />
              <p className="text-[10px] font-mono text-accent-grey mt-1">Bobot prioritas untuk ongkos/jarak rantai pasok</p>
            </div>

            {total !== 100 && (
              <div className="bg-red-50 border-l-4 border-accent-red p-4 flex items-start">
                <AlertTriangle className="text-accent-red mr-3 mt-0.5" size={18} />
                <div>
                  <h4 className="font-bold text-sm text-accent-red uppercase">Validasi Error</h4>
                  <p className="text-xs font-mono text-red-800 mt-1">Total bobot saat ini adalah {total}%. Total harus tepat 100% agar model SAW dapat dikalkulasi secara proporsional.</p>
                </div>
              </div>
            )}

            <div className="pt-6 border-t-2 border-border-color mt-6">
              <button 
                onClick={handleSave}
                disabled={total !== 100}
                className={`w-full font-mono font-bold uppercase py-4 transition-all border-2 flex justify-center items-center ${
                  total !== 100 
                    ? "bg-surface border-border-color text-accent-grey cursor-not-allowed" 
                    : isSaved 
                      ? "bg-accent-green border-accent-green text-white" 
                      : "bg-foreground text-background border-transparent hover:bg-accent-red hover:shadow-brutal active:translate-y-1 active:shadow-none"
                }`}
              >
                {isSaved ? (
                  <><CheckCircle className="mr-2" size={18} /> Tersimpan!</>
                ) : (
                  <><Save className="mr-2" size={18} /> Simpan Konfigurasi Bobot</>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
