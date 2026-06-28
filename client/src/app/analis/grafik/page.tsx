"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { API_BASE } from "@/lib/api-config";
import CombinedPredictionChart from "@/components/CombinedPredictionChart";

function AnalisGrafikContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialCommodityParam = searchParams.get("commodity");

  const [commodities, setCommodities] = useState<any[]>([]);
  const [selectedCommodityId, setSelectedCommodityId] = useState<string>("");
  const [selectedCommodityName, setSelectedCommodityName] = useState<string>("");
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCommodities = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/analis/metrics`);
      if (!res.ok) {
        throw new Error("Gagal mengambil daftar komoditas dari server");
      }
      const json = await res.json();
      if (json.success && json.data.commodities) {
        const list = json.data.commodities;
        setCommodities(list);
        
        // Match initial parameter if provided, otherwise default to first item
        let active = list[0];
        if (initialCommodityParam) {
          const matched = list.find((c: any) => c.id === initialCommodityParam);
          if (matched) active = matched;
        }

        if (active) {
          setSelectedCommodityId(active.id);
          setSelectedCommodityName(active.name);
        }
      } else {
        throw new Error(json.message || "Gagal memproses data komoditas");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan koneksi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommodities();
  }, [initialCommodityParam]);

  const handleCommodityChange = (id: string, name: string) => {
    setSelectedCommodityId(id);
    setSelectedCommodityName(name);
    router.push(`/analis/grafik?commodity=${id}`, { scroll: false });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCw className="animate-spin text-foreground mb-4" size={48} />
        <p className="font-mono text-sm uppercase text-accent-grey">Memuat Visualisasi Prediksi & Harga Asli...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-accent-red p-6 text-center max-w-xl mx-auto my-10 shadow-brutal">
        <AlertTriangle size={48} className="text-accent-red mx-auto mb-4" />
        <h3 className="font-bold text-lg uppercase text-accent-red mb-2">Error Mengambil Data</h3>
        <p className="text-sm font-mono mb-6">{error}</p>
        <button 
          onClick={fetchCommodities}
          className="bg-accent-red text-white border-2 border-black font-mono font-bold uppercase px-6 py-2 hover:bg-black transition-colors shadow-brutal"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {selectedCommodityId && (
        <CombinedPredictionChart
          key={selectedCommodityId}
          commodityId={selectedCommodityId}
          name={selectedCommodityName}
          commoditiesList={commodities.map((c: any) => ({ id: c.id, name: c.name, unit: c.unit }))}
          onCommodityChange={handleCommodityChange}
        />
      )}
    </div>
  );
}

export default function AnalisGrafikPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCw className="animate-spin text-foreground mb-4" size={48} />
        <p className="font-mono text-sm uppercase text-accent-grey">Memuat halaman grafik...</p>
      </div>
    }>
      <AnalisGrafikContent />
    </Suspense>
  );
}
