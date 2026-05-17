"use client";

import { Activity } from "lucide-react";
import { useState } from "react";

export default function AnalisArima() {
  const [isTraining, setIsTraining] = useState(false);
  const [lastTrained, setLastTrained] = useState("2 hours ago");

  const handleRetrain = () => {
    setIsTraining(true);
    setTimeout(() => {
      setIsTraining(false);
      setLastTrained("Just now");
    }, 2000);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold uppercase tracking-tight text-xl">Konfigurasi Model ARIMA</h3>
          <p className="text-sm font-mono text-accent-grey">Atur hyperparameter model Machine Learning prediksi harga.</p>
        </div>
      </div>

      <div className="bg-white border-2 border-border-color shadow-brutal flex flex-col max-w-3xl">
        <div className="p-4 border-b-2 border-border-color bg-surface flex items-center">
          <Activity size={20} className="mr-2" />
          <h3 className="font-bold uppercase tracking-tight text-lg">Parameter Model ARIMA (p,d,q)</h3>
        </div>
        <div className="p-6 flex-1">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-foreground mb-2">Auto-Regressive (p)</label>
                <input type="number" defaultValue={2} min={0} max={10} className="w-full border-2 border-border-color p-3 font-mono text-center outline-none focus:border-foreground transition-colors" />
                <p className="text-[10px] font-mono text-accent-grey mt-2">Jumlah lag observasi sebelumnya</p>
              </div>
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-foreground mb-2">Integrated (d)</label>
                <input type="number" defaultValue={1} min={0} max={5} className="w-full border-2 border-border-color p-3 font-mono text-center outline-none focus:border-foreground transition-colors" />
                <p className="text-[10px] font-mono text-accent-grey mt-2">Derajat differencing</p>
              </div>
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-foreground mb-2">Moving Average (q)</label>
                <input type="number" defaultValue={2} min={0} max={10} className="w-full border-2 border-border-color p-3 font-mono text-center outline-none focus:border-foreground transition-colors" />
                <p className="text-[10px] font-mono text-accent-grey mt-2">Ukuran moving average window</p>
              </div>
            </div>
            
            <div className="pt-4">
              <label className="block text-xs font-mono font-bold uppercase text-foreground mb-2">Confidence Interval</label>
              <select className="w-full border-2 border-border-color p-3 font-mono text-sm outline-none focus:border-foreground transition-colors appearance-none bg-white">
                <option value="95">95% (Standard)</option>
                <option value="90">90% (Aggressive)</option>
                <option value="99">99% (Conservative)</option>
              </select>
            </div>

            <div className="pt-6 border-t-2 border-border-color mt-6">
              <button 
                onClick={handleRetrain}
                disabled={isTraining}
                className={`w-full font-mono font-bold uppercase py-4 transition-all border-2 flex justify-center items-center ${
                  isTraining 
                    ? "bg-surface border-border-color text-accent-grey cursor-not-allowed" 
                    : "bg-foreground text-background border-transparent hover:bg-accent-green hover:shadow-brutal active:translate-y-1 active:shadow-none"
                }`}
              >
                {isTraining ? (
                  <><Activity className="animate-spin mr-2" size={18} /> Sedang Training...</>
                ) : (
                  "RETRAIN MODEL (FORCE UPDATE)"
                )}
              </button>
              <p className="text-xs font-mono text-accent-grey uppercase mt-4 text-center">
                Last trained: <span className="font-bold text-foreground">{lastTrained}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
