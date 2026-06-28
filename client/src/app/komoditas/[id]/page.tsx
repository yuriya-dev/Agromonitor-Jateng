import { ArrowLeft, Share2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import CandlestickChart from "@/components/CandlestickChart";
import Ticker from "@/components/Ticker";
import SetAlertButton from "@/components/SetAlertButton";
import ExportButton from "@/components/ExportButton";
import PredictionSection from "@/components/PredictionSection";

interface ChartDataPoint {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export default async function CommodityDetail({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { pasar?: string; date?: string };
}) {
  const commodityId = params.id;
  const pasar = searchParams.pasar;
  const date = searchParams.date;
  
  let commodityData = null;
  let tickerItems = [];
  
  let predictionData = null;
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

  try {
    const apiQuery = new URLSearchParams();
    if (pasar) apiQuery.set('pasar', pasar);
    if (date) apiQuery.set('date', date);
    const queryString = apiQuery.toString() ? `?${apiQuery.toString()}` : '';

    // Fetch specific commodity with market/date query params
    const res = await fetch(`${API_BASE_URL}/api/commodities/${commodityId}${queryString}`, { cache: 'no-store' });
    const data = await res.json();
    if (data.success) {
      commodityData = data.data;
    }

    // Fetch all for ticker
    const allRes = await fetch(`${API_BASE_URL}/api/commodities`, { cache: 'no-store' });
    const allData = await allRes.json();
    if (allData.success) {
      tickerItems = allData.data;
    }

    // Fetch prediction for dynamic alerts with market query param
    const predRes = await fetch(`${API_BASE_URL}/api/commodities/${commodityId}/predict?days=14${pasar ? `&pasar=${encodeURIComponent(pasar)}` : ''}`, { cache: 'no-store' });
    const predData = await predRes.json();
    if (predData.success) {
      predictionData = predData.data;
    }
  } catch (error) {
    console.error("Gagal mengambil data", error);
  }

  // Format ID ke nama (beras-medium -> Beras Medium) jika data tidak ada
  const formatName = (id: string) => {
    return id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const name = commodityData?.name || formatName(commodityId);
  const chartData: ChartDataPoint[] = commodityData?.prices || [];
  
  // Calculate current price and change based on chart data
  let currentPrice = 0;
  let changeAmount = 0;
  let changePercent = 0;

  if (chartData.length >= 2) {
    const latest = chartData[chartData.length - 1].close;
    const previous = chartData[chartData.length - 2].close;
    currentPrice = latest;
    changeAmount = latest - previous;
    changePercent = parseFloat(((changeAmount / previous) * 100).toFixed(2));
  } else if (chartData.length === 1) {
    currentPrice = chartData[0].close;
  }

  const isUp = changeAmount > 0;
  const isDown = changeAmount < 0;

  // Calculate dynamic stats
  let high52W = 0;
  let low52W = 0;
  let avg30D = 0;
  let volatilityText = "Rendah";

  if (chartData.length > 0) {
    const latestDate = new Date(chartData[chartData.length - 1].time);
    
    // 52 Weeks High & Low (364 days limit from latest date)
    const cutoff52W = new Date(latestDate);
    cutoff52W.setDate(cutoff52W.getDate() - 364);
    
    const prices52W = chartData.filter((d: any) => new Date(d.time) >= cutoff52W);
    const activePrices52W = prices52W.length > 0 ? prices52W : chartData;
    
    high52W = Math.max(...activePrices52W.map((d: any) => d.high));
    low52W = Math.min(...activePrices52W.map((d: any) => d.low));

    // 30 Days Average (30 days limit from latest date)
    const cutoff30D = new Date(latestDate);
    cutoff30D.setDate(cutoff30D.getDate() - 30);
    
    const prices30D = chartData.filter((d: any) => new Date(d.time) >= cutoff30D);
    const activePrices30D = prices30D.length > 0 ? prices30D : chartData;
    
    const sum30D = activePrices30D.reduce((acc: number, curr: any) => acc + curr.close, 0);
    avg30D = Math.round(sum30D / activePrices30D.length);

    // Dynamic Volatility calculation based on last 30 days
    if (activePrices30D.length > 1) {
      const mean = avg30D;
      const variance = activePrices30D.reduce((acc: number, curr: any) => acc + Math.pow(curr.close - mean, 2), 0) / activePrices30D.length;
      const stdDev = Math.sqrt(variance);
      const cv = stdDev / (mean || 1);
      
      if (cv > 0.05) {
        volatilityText = "Tinggi";
      } else if (cv > 0.02) {
        volatilityText = "Sedang";
      } else {
        volatilityText = "Rendah";
      }
    } else {
      volatilityText = "Rendah";
    }
  }

  // Siapkan data untuk Export CSV
  const exportRows = chartData.map((item: ChartDataPoint) => [
    item.time,
    item.open,
    item.high,
    item.low,
    item.close
  ]);

  return (
    <main className="min-h-screen bg-surface flex flex-col">
      {/* Header (Minimal) */}
      <header className="bg-background border-b-2 border-border-color sticky top-0 z-50">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href={pasar || date ? `/?${new URLSearchParams({ ...(pasar && { pasar }), ...(date && { date }) }).toString()}` : "/"} className="hover:bg-surface p-2 border border-transparent hover:border-border-color transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-bold tracking-tight uppercase flex items-center">
              AGROMONITOR<span className="text-accent-grey ml-2">JATENG</span>
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center text-xs font-mono font-bold px-3 py-2 border border-border-color hover:bg-surface transition-colors">
              <Share2 size={16} className="mr-2" /> SHARE
            </button>
            <ExportButton 
              filename={`historis_${commodityId}_${new Date().toISOString().split('T')[0]}.csv`}
              headers={["Tanggal", "Harga Buka", "Harga Tertinggi", "Harga Terendah", "Harga Tutup"]}
              rows={exportRows}
            />
            <SetAlertButton commodityName={name} currentPrice={currentPrice} commoditySlug={commodityId} />
          </div>
        </div>
        <Ticker items={tickerItems} />
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {commodityData?.isFallback && (
            <div className="bg-yellow-50 border-2 border-yellow-500 text-yellow-900 p-4 mb-6 font-mono text-sm shadow-brutal flex items-center space-x-3">
              <span className="text-xl">⚠️</span>
              <span>
                <strong>Pemberitahuan:</strong> Data harga untuk komoditas ini tidak tersedia di wilayah <strong>{pasar?.toUpperCase()}</strong>. Sistem secara otomatis menampilkan data rata-rata Jawa Tengah sebagai alternatif.
              </span>
            </div>
          )}
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Info & Stats */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border-2 border-border-color p-6 shadow-brutal relative">
              <div className="text-xs font-mono text-accent-grey mb-2 uppercase tracking-widest border-b border-border-color pb-2">
                ID: {commodityId.toUpperCase()} • PASAR: {pasar ? (commodityData?.isFallback ? `${pasar.toUpperCase()} (FALLBACK KE JATENG)` : pasar.toUpperCase()) : "RATA-RATA JATENG"}
              </div>
              <h2 className="text-4xl font-bold uppercase tracking-tight mt-4">{name}</h2>
              
              <div className="mt-8">
                <div className="text-sm font-mono text-accent-grey mb-1 uppercase">Harga Terkini (KG)</div>
                <div className="text-5xl font-mono font-bold">
                  Rp {currentPrice.toLocaleString("id-ID")}
                </div>
                <div className={`mt-2 flex items-center font-mono font-bold text-lg ${isUp ? "text-accent-green" : isDown ? "text-accent-red" : "text-accent-grey"}`}>
                  <span className="mr-2">{isUp ? "▲" : isDown ? "▼" : "—"}</span>
                  {Math.abs(changeAmount).toLocaleString("id-ID")} ({Math.abs(changePercent)}%)
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-8 border-t border-border-color pt-6">
                <div>
                  <div className="text-xs font-mono text-accent-grey uppercase">Tertinggi (52W)</div>
                  <div className="font-mono font-bold mt-1">
                    {high52W > 0 ? `Rp ${high52W.toLocaleString("id-ID")}` : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-mono text-accent-grey uppercase">Terendah (52W)</div>
                  <div className="font-mono font-bold mt-1">
                    {low52W > 0 ? `Rp ${low52W.toLocaleString("id-ID")}` : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-mono text-accent-grey uppercase">Rata-rata 30D</div>
                  <div className="font-mono font-bold mt-1">
                    {avg30D > 0 ? `Rp ${avg30D.toLocaleString("id-ID")}` : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-mono text-accent-grey uppercase">Volatilitas</div>
                  <div className={`font-mono font-bold mt-1 ${
                    volatilityText === "Tinggi" ? "text-accent-red" : volatilityText === "Sedang" ? "text-yellow-600" : "text-accent-green"
                  }`}>
                    {volatilityText}
                  </div>
                </div>
              </div>
            </div>

            {predictionData ? (
              <div className={`p-6 border-2 border-border-color shadow-brutal flex items-start space-x-4 ${
                predictionData.alertTrigger === 'CRITICAL' 
                  ? 'bg-red-50 text-red-900 border-red-500' 
                  : predictionData.alertTrigger === 'WARNING' 
                  ? 'bg-yellow-50 text-yellow-900 border-yellow-500' 
                  : 'bg-green-50 text-green-900 border-green-500'
              }`}>
                <div className={`p-3 text-white ${
                  predictionData.alertTrigger === 'CRITICAL' 
                    ? 'bg-accent-red' 
                    : predictionData.alertTrigger === 'WARNING' 
                    ? 'bg-yellow-600' 
                    : 'bg-accent-green'
                }`}>
                  <AlertTriangle size={24} />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold uppercase tracking-tight">
                    Peringatan Harga ({
                      predictionData.alertTrigger === 'CRITICAL' 
                        ? 'Kritis' 
                        : predictionData.alertTrigger === 'WARNING' 
                        ? 'Waspada' 
                        : 'Aman'
                    })
                  </h4>
                  <p className="text-sm mt-1">
                    {predictionData.alertTrigger === 'CRITICAL' && (
                      `⚠️ AWAS! Berdasarkan model ARIMA, harga ${name} diprediksi naik signifikan sebesar ${predictionData.priceChangePercent.toFixed(2)}% dalam 14 hari ke depan. Harap waspada terhadap potensi inflasi!`
                    )}
                    {predictionData.alertTrigger === 'WARNING' && (
                      `⚠️ PERINGATAN: Harga ${name} diprediksi mengalami perubahan sebesar ${predictionData.priceChangePercent.toFixed(2)}% dalam 14 hari ke depan dengan tingkat volatilitas ${predictionData.volatility.toLowerCase()}.`
                    )}
                    {predictionData.alertTrigger === 'NONE' && (
                      `✅ INFO TREN: Harga ${name} diprediksi stabil/kondusif dalam 14 hari ke depan dengan proyeksi perubahan sebesar ${predictionData.priceChangePercent.toFixed(2)}%.`
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white border-2 border-border-color p-6 shadow-brutal flex items-start space-x-4">
                <div className="bg-accent-red text-white p-3">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h4 className="font-bold uppercase tracking-tight">Peringatan Harga</h4>
                  <p className="text-sm mt-1">Gagal memuat analisis tren harga terbaru dari model prediksi.</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Chart & Analysis */}
          <div className="lg:col-span-2 space-y-6">
            <CandlestickChart data={chartData} />
            
            <PredictionSection commodityId={commodityId} name={name} pasar={pasar} />
          </div>
          
        </div>
      </div>
    </div>
  </main>
  );
}
