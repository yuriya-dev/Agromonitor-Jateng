"use client";

import { Bell, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

interface SetAlertButtonProps {
  commodityName: string;
  currentPrice: number;
}

export default function SetAlertButton({ commodityName, currentPrice }: SetAlertButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [targetPrice, setTargetPrice] = useState(currentPrice.toString());
  const [condition, setCondition] = useState("above");

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const res = await fetch("http://127.0.0.1:5001/api/notifications/telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commodityName,
          condition,
          targetPrice: Number(targetPrice),
          currentPrice
        }),
      });

      const data = await res.json();
      
      if (data.success) {
        toast.success(
          <span>
            {data.message}
            <br />
            <span className="text-xs font-normal">Harga {commodityName} {condition === "above" ? "naik di atas" : "turun di bawah"} Rp {Number(targetPrice).toLocaleString("id-ID")}</span>
          </span>,
          { duration: 5000 }
        );
        setIsOpen(false);
      } else {
        toast.error(`Gagal: ${data.message}`);
      }
    } catch (error) {
      console.error("Gagal mengirim alert", error);
      toast.error("Terjadi kesalahan sistem saat menghubungi backend.");
    } finally {
      setIsLoading(false);
    }
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
                  disabled={isLoading}
                  className="flex-1 py-3 bg-foreground text-background font-bold uppercase border-2 border-foreground hover:bg-opacity-80 transition-colors disabled:opacity-50"
                >
                  {isLoading ? "Menyimpan..." : "Simpan Alert"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
