"use client";

import { useEffect, useState } from "react";
import { Activity, RefreshCw, AlertCircle, CheckCircle, Database } from "lucide-react";
import { API_BASE } from "@/lib/api-config";

export default function AnalisArima() {
  const [commodities, setCommodities] = useState<any[]>([]);
  const [configs, setConfigs] = useState<any>({});
  
  const [selectedSlug, setSelectedSlug] = useState<string>("");
  const [p, setP] = useState<number>(5);
  const [d, setD] = useState<number>(1);
  const [q, setQ] = useState<number>(0);
  const [confidence, setConfidence] = useState<number>(95);

  const [isTraining, setIsTraining] = useState(false);
  const [lastTrained, setLastTrained] = useState<string>("Belum dilatih di sesi ini");
  const [currentMetrics, setCurrentMetrics] = useState<any>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch metrics to get commodities list and their current metrics
      const metricsRes = await fetch(`${API_BASE}/analis/metrics`);
      const metricsJson = await metricsRes.json();
      
      // 2. Fetch all ARIMA configs
      const configRes = await fetch(`${API_BASE}/analis/arima-config`);
      const configJson = await configRes.json();

      if (metricsJson.success && configJson.success) {
        setCommodities(metricsJson.data.commodities || []);
        setConfigs(configJson.data || {});
        
        // Select first commodity by default
        const list = metricsJson.data.commodities || [];
        if (list.length > 0) {
          const firstSlug = list[0].id;
          setSelectedSlug(firstSlug);
          
          // Populate parameters
          const c = configJson.data[firstSlug];
          setP(c ? c.p : 5);
          setD(c ? c.d : 1);
          setQ(c ? c.q : 0);
          setConfidence(c ? c.confidence : 95);
          
          setCurrentMetrics({
            mape: list[0].mape,
            rmse: list[0].rmse,
            modelUsed: list[0].modelUsed
          });
        }
      } else {
        throw new Error("Gagal mengambil konfigurasi dari server");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan saat memuat konfigurasi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCommodityChange = (slug: string) => {
    setSelectedSlug(slug);
    setSuccessMsg(null);
    
    // Find active config
    const c = configs[slug];
    setP(c ? c.p : 5);
    setD(c ? c.d : 1);
    setQ(c ? c.q : 0);
    setConfidence(c ? c.confidence : 95);

    // Find active metrics
    const item = commodities.find(item => item.id === slug);
    if (item) {
      setCurrentMetrics({
        mape: item.mape,
        rmse: item.rmse,
        modelUsed: item.modelUsed
      });
    } else {
      setCurrentMetrics(null);
    }
  };

  const handleRetrain = async () => {
    if (!selectedSlug) return;
    setIsTraining(true);
    setError(null);
    setSuccessMsg(null);
    
    try {
      const res = await fetch(`${API_BASE}/analis/arima-config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          commodityId: selectedSlug,
          p,
          d,
          q,
          confidence
        })
      });

      if (!res.ok) {
        throw new Error("Gagal melatih ulang model di backend");
      }

      const json = await res.json();
      if (json.success) {
        setSuccessMsg(`Model untuk ${commodities.find(c => c.id === selectedSlug)?.name || selectedSlug} berhasil dilatih ulang!`);
        setLastTrained("Baru saja");
        
        // Update local configs state
        const updatedConfigs = { ...configs };
        updatedConfigs[selectedSlug] = json.data.config;
        setConfigs(updatedConfigs);

        // Update local metrics
        if (json.data.metrics) {
          setCurrentMetrics({
            mape: json.data.metrics.mape,
            rmse: json.data.metrics.rmse,
            modelUsed: `ARIMA (${p},${d},${q}) via Python ML-Service`
          });

          // Update in main commodities list
          setCommodities(prev => prev.map(item => {
            if (item.id === selectedSlug) {
              return {
                ...item,
                mape: json.data.metrics.mape,
                rmse: json.data.metrics.rmse,
                modelUsed: `ARIMA (${p},${d},${q}) via Python ML-Service`
              };
            }
            return item;
          }));
        }
      } else {
        throw new Error(json.message || "Gagal melakukan retraining.");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Gagal melatih ulang model. Periksa koneksi ke Python ML-Service.");
    } finally {
      setIsTraining(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCw className="animate-spin text-foreground mb-4" size={48} />
        <p className="font-mono text-sm uppercase text-accent-grey">Memuat data model...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h3 className="font-bold uppercase tracking-tight text-xl">Konfigurasi Model ARIMA</h3>
          <p className="text-sm font-mono text-accent-grey">Atur hyperparameter model Machine Learning prediksi harga pangan.</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-accent-red p-4 mb-6 flex items-start shadow-brutal max-w-3xl">
          <AlertCircle className="text-accent-red mr-3 shrink-0 mt-0.5" size={20} />
          <div className="text-sm font-mono text-accent-red">
            <strong>Error:</strong> {error}
          </div>
        </div>
      )}

      {successMsg && (
        <div className="bg-green-50 border-2 border-accent-green p-4 mb-6 flex items-start shadow-brutal max-w-3xl">
          <CheckCircle className="text-accent-green mr-3 shrink-0 mt-0.5" size={20} />
          <div className="text-sm font-mono text-foreground font-bold">
            {successMsg}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl">
        {/* Kolom Kiri: Form Config */}
        <div className="lg:col-span-2 bg-white border-2 border-border-color shadow-brutal flex flex-col">
          <div className="p-4 border-b-2 border-border-color bg-surface flex items-center justify-between">
            <div className="flex items-center">
              <Activity size={20} className="mr-2" />
              <h3 className="font-bold uppercase tracking-tight text-lg">Parameter Model ARIMA (p,d,q)</h3>
            </div>
            <span className="text-xs font-mono font-bold bg-foreground text-background px-2 py-0.5 uppercase">
              STATUS: READY
            </span>
          </div>

          <div className="p-6">
            <div className="mb-6">
              <label className="block text-xs font-mono font-bold uppercase text-foreground mb-2">Komoditas yang Dikonfigurasi</label>
              <select
                value={selectedSlug}
                onChange={(e) => handleCommodityChange(e.target.value)}
                className="w-full border-2 border-border-color p-3 font-mono text-sm outline-none focus:border-foreground transition-colors appearance-none bg-white font-bold"
              >
                {commodities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name.toUpperCase()} ({c.unit})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-foreground mb-2">Auto-Regressive (p)</label>
                <input 
                  type="number" 
                  value={p} 
                  min={0} 
                  max={10} 
                  onChange={(e) => setP(parseInt(e.target.value) || 0)}
                  className="w-full border-2 border-border-color p-3 font-mono text-center outline-none focus:border-foreground transition-colors font-bold text-lg" 
                />
                <p className="text-[10px] font-mono text-accent-grey mt-2">Jumlah lag observasi sebelumnya</p>
              </div>
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-foreground mb-2">Integrated (d)</label>
                <input 
                  type="number" 
                  value={d} 
                  min={0} 
                  max={2} 
                  onChange={(e) => setD(parseInt(e.target.value) || 0)}
                  className="w-full border-2 border-border-color p-3 font-mono text-center outline-none focus:border-foreground transition-colors font-bold text-lg" 
                />
                <p className="text-[10px] font-mono text-accent-grey mt-2">Derajat differencing (0-2)</p>
              </div>
              <div>
                <label className="block text-xs font-mono font-bold uppercase text-foreground mb-2">Moving Average (q)</label>
                <input 
                  type="number" 
                  value={q} 
                  min={0} 
                  max={10} 
                  onChange={(e) => setQ(parseInt(e.target.value) || 0)}
                  className="w-full border-2 border-border-color p-3 font-mono text-center outline-none focus:border-foreground transition-colors font-bold text-lg" 
                />
                <p className="text-[10px] font-mono text-accent-grey mt-2">Ukuran moving average window</p>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-xs font-mono font-bold uppercase text-foreground mb-2">Confidence Interval (Interval Kepercayaan)</label>
              <select 
                value={confidence}
                onChange={(e) => setConfidence(parseInt(e.target.value) || 95)}
                className="w-full border-2 border-border-color p-3 font-mono text-sm outline-none focus:border-foreground transition-colors appearance-none bg-white font-bold"
              >
                <option value="95">95% (STANDAR / DIREKOMENDASIKAN)</option>
                <option value="90">90% (AGRESIF / LEBAR PITA LEBIH KECIL)</option>
                <option value="99">99% (KONSERVATIF / LEBAR PITA LEBIH BESAR)</option>
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
                  <><Activity className="animate-spin mr-2" size={18} /> Sedang Fitting & Melatih Model ARIMA...</>
                ) : (
                  "SIMPAN KONFIGURASI & LATIH ULANG MODEL"
                )}
              </button>
              <p className="text-xs font-mono text-accent-grey uppercase mt-4 text-center">
                Status Pelatihan Sesi: <span className="font-bold text-foreground">{lastTrained}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Status Metrik Hasil Latihan */}
        <div className="bg-white border-2 border-border-color shadow-brutal flex flex-col h-fit">
          <div className="p-4 border-b-2 border-border-color bg-surface flex items-center">
            <Database size={20} className="mr-2" />
            <h3 className="font-bold uppercase tracking-tight text-lg">Metrik Hasil Pelatihan</h3>
          </div>
          
          <div className="p-6 space-y-6">
            {currentMetrics ? (
              <>
                <div>
                  <div className="text-xs font-mono text-accent-grey uppercase mb-1">Model Aktif</div>
                  <div className="text-sm font-mono font-bold uppercase text-foreground break-words bg-surface p-2 border border-border-color/20">
                    {currentMetrics.modelUsed}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-surface/50 p-4 border border-border-color/10">
                    <div className="text-[10px] font-mono text-accent-grey uppercase mb-1">MAPE (Rata-rata Kesalahan %)</div>
                    <div className="text-2xl font-mono font-bold text-accent-green">{currentMetrics.mape.toFixed(2)}%</div>
                    <span className="text-[9px] font-mono text-accent-grey block mt-1">Lower is better</span>
                  </div>
                  <div className="bg-surface/50 p-4 border border-border-color/10">
                    <div className="text-[10px] font-mono text-accent-grey uppercase mb-1">RMSE (Akurasi Deviasi)</div>
                    <div className="text-2xl font-mono font-bold text-foreground">Rp {Math.round(currentMetrics.rmse).toLocaleString("id-ID")}</div>
                    <span className="text-[9px] font-mono text-accent-grey block mt-1">Lower is better</span>
                  </div>
                </div>

                <div className="text-xs font-mono border-t pt-4 text-accent-grey">
                  * MAPE dibawah 10% mengindikasikan tingkat peramalan yang **sangat akurat**. Jika model gagal fit karena nilai parameter tidak stabil, sistem akan otomatis melakukan fallback ke ARIMA(1,1,0).
                </div>
              </>
            ) : (
              <p className="font-mono text-sm text-accent-grey">Silakan pilih komoditas untuk menampilkan metrik.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
