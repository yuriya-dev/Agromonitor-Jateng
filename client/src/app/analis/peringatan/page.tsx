"use client";

import { useEffect, useState } from "react";
import { AlertCircle, CheckCircle, RefreshCw, Bell, ShieldAlert, ShieldCheck } from "lucide-react";
import { API_BASE } from "@/lib/api-config";

export default function AnalisPeringatan() {
  const [criticalThreshold, setCriticalThreshold] = useState<number>(5.0);
  const [warningThreshold, setWarningThreshold] = useState<number>(1.5);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadConfig = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/analis/alert-config`);
      if (!res.ok) {
        throw new Error("Gagal mengambil konfigurasi dari server");
      }
      const json = await res.json();
      if (json.success && json.data) {
        setCriticalThreshold(json.data.criticalThreshold);
        setWarningThreshold(json.data.warningThreshold);
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Terjadi kesalahan saat memuat konfigurasi peringatan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    if (warningThreshold >= criticalThreshold) {
      setError("Ambang batas Warning harus lebih kecil dari ambang batas Critical.");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/analis/alert-config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          criticalThreshold,
          warningThreshold
        })
      });

      if (!res.ok) {
        throw new Error("Gagal menyimpan konfigurasi ke server");
      }

      const json = await res.json();
      if (json.success) {
        setSuccessMsg("Konfigurasi Peringatan Harga Terintegrasi berhasil disimpan!");
      } else {
        throw new Error(json.message || "Gagal menyimpan konfigurasi.");
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Gagal menyimpan konfigurasi peringatan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCw className="animate-spin text-foreground mb-4" size={48} />
        <p className="font-mono text-sm uppercase text-accent-grey">Memuat konfigurasi peringatan...</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h3 className="font-bold uppercase tracking-tight text-xl">Konfigurasi Peringatan Harga</h3>
          <p className="text-sm font-mono text-accent-grey">Atur ambang batas persentase perubahan harga untuk indikator peringatan dini.</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mb-8">
        {/* Kolom Kiri: Form Config */}
        <form onSubmit={handleSave} className="lg:col-span-2 bg-white border-2 border-border-color shadow-brutal flex flex-col">
          <div className="p-4 border-b-2 border-border-color bg-surface flex items-center justify-between">
            <div className="flex items-center">
              <Bell size={20} className="mr-2" />
              <h3 className="font-bold uppercase tracking-tight text-lg">Ambang Batas Peringatan (Alert Thresholds)</h3>
            </div>
            <span className="text-xs font-mono font-bold bg-foreground text-background px-2 py-0.5 uppercase">
              TERINTEGRASI
            </span>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-foreground mb-2">
                Ambang Batas Kritis (Critical Threshold)
              </label>
              <div className="relative max-w-xs">
                <input 
                  type="number" 
                  step="0.1"
                  min="0.1"
                  max="100"
                  value={criticalThreshold} 
                  onChange={(e) => setCriticalThreshold(parseFloat(e.target.value) || 0)}
                  className="w-full border-2 border-border-color p-3 pr-10 font-mono text-right outline-none focus:border-foreground transition-colors font-bold text-lg" 
                  required
                />
                <span className="absolute right-3 top-3.5 font-mono font-bold text-lg text-accent-grey">%</span>
              </div>
              <p className="text-xs font-mono text-accent-grey mt-2">
                Peringatan merah (CRITICAL) akan dipicu jika proyeksi kenaikan harga komoditas dalam 14 hari ke depan sama dengan atau melebihi batas ini (misalnya: &gt;= 5.0% atau &gt;= 6.0%).
              </p>
            </div>

            <div>
              <label className="block text-xs font-mono font-bold uppercase text-foreground mb-2">
                Ambang Batas Waspada (Warning Threshold)
              </label>
              <div className="relative max-w-xs">
                <input 
                  type="number" 
                  step="0.1"
                  min="0.1"
                  max="100"
                  value={warningThreshold} 
                  onChange={(e) => setWarningThreshold(parseFloat(e.target.value) || 0)}
                  className="w-full border-2 border-border-color p-3 pr-10 font-mono text-right outline-none focus:border-foreground transition-colors font-bold text-lg" 
                  required
                />
                <span className="absolute right-3 top-3.5 font-mono font-bold text-lg text-accent-grey">%</span>
              </div>
              <p className="text-xs font-mono text-accent-grey mt-2">
                Peringatan kuning (WARNING) akan dipicu jika proyeksi perubahan harga bernilai positif &gt;= batas ini (misalnya: &gt;= 1.5% atau &gt;= 2.0%) dan belum mencapai kategori Kritis.
              </p>
            </div>

            <div className="pt-6 border-t-2 border-border-color mt-6">
              <button 
                type="submit"
                disabled={saving}
                className={`w-full font-mono font-bold uppercase py-4 transition-all border-2 flex justify-center items-center ${
                  saving 
                    ? "bg-surface border-border-color text-accent-grey cursor-not-allowed" 
                    : "bg-foreground text-background border-transparent hover:bg-accent-green hover:shadow-brutal active:translate-y-1 active:shadow-none cursor-pointer"
                }`}
              >
                {saving ? (
                  <><RefreshCw className="animate-spin mr-2" size={18} /> Menyimpan Konfigurasi...</>
                ) : (
                  "SIMPAN PENGATURAN PERINGATAN"
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Kolom Kanan: Penjelasan Indikator */}
        <div className="space-y-6">
          <div className="bg-white border-2 border-border-color shadow-brutal flex flex-col h-fit">
            <div className="p-4 border-b-2 border-border-color bg-surface flex items-center">
              <ShieldAlert size={20} className="mr-2 text-accent-red" />
              <h3 className="font-bold uppercase tracking-tight text-lg">Peringatan Kritis</h3>
            </div>
            <div className="p-6">
              <div className="bg-red-100 text-accent-red border-2 border-accent-red font-mono font-bold text-center py-2 px-4 uppercase text-sm mb-4">
                CRITICAL
              </div>
              <p className="text-xs font-mono text-accent-grey leading-relaxed">
                Dipicu secara otomatis pada dashboard analitik jika tingkat kenaikan harga komoditas melampaui persentase kritis yang Anda tentukan (Saat ini: <span className="font-bold text-foreground font-sans">&gt;= {criticalThreshold}%</span>). Peringatan ini mengindikasikan lonjakan harga yang tidak wajar dan memerlukan tindakan intervensi segera di lapangan.
              </p>
            </div>
          </div>

          <div className="bg-white border-2 border-border-color shadow-brutal flex flex-col h-fit">
            <div className="p-4 border-b-2 border-border-color bg-surface flex items-center">
              <ShieldCheck size={20} className="mr-2 text-yellow-600" />
              <h3 className="font-bold uppercase tracking-tight text-lg">Peringatan Waspada</h3>
            </div>
            <div className="p-6">
              <div className="bg-yellow-100 text-yellow-700 border-2 border-yellow-500 font-mono font-bold text-center py-2 px-4 uppercase text-sm mb-4">
                WASPADA (Warning)
              </div>
              <p className="text-xs font-mono text-accent-grey leading-relaxed">
                Dipicu secara otomatis jika kenaikan harga bernilai positif dan berada di antara ambang batas waspada dan kritis (Saat ini: <span className="font-bold text-foreground font-sans">&gt;= {warningThreshold}%</span> hingga <span className="font-bold text-foreground font-sans">&lt; {criticalThreshold}%</span>). Ini merupakan tanda peringatan dini bagi tim analis untuk memantau pergerakan harga lebih intensif.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
