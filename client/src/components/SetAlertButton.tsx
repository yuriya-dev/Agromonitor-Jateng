"use client";

import { Bell, X } from "lucide-react";
import { useState } from "react";

interface SetAlertButtonProps {
  commodityName: string;
  currentPrice: number;
}

export default function SetAlertButton({ commodityName, currentPrice }: SetAlertButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState(currentPrice.toString());
  const [condition, setCondition] = useState("above");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call to save alert
    alert(`Alert disimpan! Anda akan diberitahu jika harga ${commodityName} ${condition === "above" ? "naik di atas" : "turun di bawah"} Rp ${Number(targetPrice).toLocaleString("id-ID")}`);
    setIsOpen(false);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex items-center text-xs font-mono font-bold px-3 py-2 bg-foreground text-background hover:bg-opacity-80 transition-colors"
      >
        <Bell size={16} className="mr-2" /> SET ALERT
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-foreground shadow-brutal max-w-md w-full relative">
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-foreground hover:text-accent-red transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="p-6 border-b-2 border-foreground">
              <h2 className="text-2xl font-bold uppercase tracking-tight">Set Peringatan Harga</h2>
              <p className="text-sm font-mono text-accent-grey mt-1">Komoditas: {commodityName}</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold uppercase mb-2">Kondisi</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setCondition("above")}
                    className={`py-2 px-4 border-2 font-mono text-sm font-bold transition-colors ${condition === "above" ? "bg-foreground text-background border-foreground" : "bg-white text-foreground border-border-color hover:border-foreground"}`}
                  >
                    NAIK DI ATAS
                  </button>
                  <button
                    type="button"
                    onClick={() => setCondition("below")}
                    className={`py-2 px-4 border-2 font-mono text-sm font-bold transition-colors ${condition === "below" ? "bg-foreground text-background border-foreground" : "bg-white text-foreground border-border-color hover:border-foreground"}`}
                  >
                    TURUN DI BAWAH
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold uppercase mb-2">Target Harga (Rp)</label>
                <input 
                  type="number" 
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  className="w-full p-3 border-2 border-border-color focus:border-foreground focus:outline-none font-mono text-lg transition-colors"
                  required
                />
              </div>

              <div className="flex space-x-4 pt-4 border-t-2 border-border-color">
                <button 
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-3 border-2 border-foreground font-bold uppercase hover:bg-surface transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-3 bg-foreground text-background font-bold uppercase border-2 border-foreground hover:bg-opacity-80 transition-colors"
                >
                  Simpan Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
