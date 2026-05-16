import { ArrowLeft, Share2, Bell, AlertTriangle } from "lucide-react";
import Link from "next/link";
import CandlestickChart from "@/components/CandlestickChart";
import Ticker from "@/components/Ticker";
import SetAlertButton from "@/components/SetAlertButton";
import ExportButton from "@/components/ExportButton";
import PredictionSection from "@/components/PredictionSection";

export default async function CommodityDetail({ params }: { params: { id: string } }) {
  const commodityId = params.id;
  
  let commodityData = null;
  let tickerItems = [];
  
  try {
    // Fetch specific commodity
    const res = await fetch(`http://localhost:5001/api/commodities/${commodityId}`, { cache: 'no-store' });
    const data = await res.json();
    if (data.success) {
      commodityData = data.data;
    }

    // Fetch all for ticker
    const allRes = await fetch(`http://localhost:5001/api/commodities`, { cache: 'no-store' });
    const allData = await allRes.json();
    if (allData.success) {
      tickerItems = allData.data;
    }
  } catch (error) {
    console.error("Gagal mengambil data", error);
  }

  // Format ID ke nama (beras-medium -> Beras Medium) jika data tidak ada
  const formatName = (id: string) => {
    return id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const name = commodityData?.name || formatName(commodityId);
  const chartData = commodityData?.prices || [];
  
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

  // Siapkan data untuk Export CSV
  const exportRows = chartData.map((item: any) => [
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
            <Link href="/" className="hover:bg-surface p-2 border border-transparent hover:border-border-color transition-colors">
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
            <SetAlertButton commodityName={name} currentPrice={currentPrice} />
          </div>
        </div>
        <Ticker items={tickerItems} />
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Info & Stats */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border-2 border-border-color p-6 shadow-brutal relative">
              <div className="text-xs font-mono text-accent-grey mb-2 uppercase tracking-widest border-b border-border-color pb-2">
                ID: {commodityId.toUpperCase()} • PASAR: RATA-RATA JATENG
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
                  <div className="font-mono font-bold mt-1">Rp 15.000</div>
                </div>
                <div>
                  <div className="text-xs font-mono text-accent-grey uppercase">Terendah (52W)</div>
                  <div className="font-mono font-bold mt-1">Rp 11.200</div>
                </div>
                <div>
                  <div className="text-xs font-mono text-accent-grey uppercase">Rata-rata 30D</div>
                  <div className="font-mono font-bold mt-1">Rp 13.250</div>
                </div>
                <div>
                  <div className="text-xs font-mono text-accent-grey uppercase">Volatilitas</div>
                  <div className="font-mono font-bold mt-1 text-accent-red">Tinggi</div>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-border-color p-6 shadow-brutal flex items-start space-x-4">
              <div className="bg-accent-red text-white p-3">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h4 className="font-bold uppercase tracking-tight">Peringatan Harga</h4>
                <p className="text-sm mt-1">Harga {name} saat ini berada 15% di atas Harga Acuan Pembelian (HAP) Pemerintah.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Chart & Analysis */}
          <div className="lg:col-span-2 space-y-6">
            <CandlestickChart data={chartData} />
            
            <PredictionSection commodityId={commodityId} name={name} />
          </div>
          
        </div>
      </div>
    </main>
  );
}
