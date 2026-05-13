import { ArrowLeft, Share2, Bell, AlertTriangle } from "lucide-react";
import Link from "next/link";
import CandlestickChart from "@/components/CandlestickChart";
import Ticker from "@/components/Ticker";

export default function CommodityDetail({ params }: { params: { id: string } }) {
  const commodityId = params.id;
  
  // Format ID ke nama (beras-medium -> Beras Medium)
  const formatName = (id: string) => {
    return id.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const name = formatName(commodityId);
  const currentPrice = 13500;
  const changeAmount = 150;
  const changePercent = 1.1;
  const isUp = changeAmount > 0;
  const isDown = changeAmount < 0;

  // Generate dummy candlestick data
  const generateDummyData = () => {
    let currentDummyPrice = 13000;
    const data = [];
    const now = new Date();
    for (let i = 60; i >= 0; i--) {
      const time = new Date(now);
      time.setDate(time.getDate() - i);
      
      const open = currentDummyPrice + (Math.random() - 0.5) * 500;
      const close = open + (Math.random() - 0.5) * 600;
      const high = Math.max(open, close) + Math.random() * 200;
      const low = Math.min(open, close) - Math.random() * 200;
      
      data.push({
        time: time.toISOString().split('T')[0],
        open: Math.round(open),
        high: Math.round(high),
        low: Math.round(low),
        close: Math.round(close)
      });
      currentDummyPrice = close;
    }
    return data;
  };

  const chartData = generateDummyData();

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
            <button className="flex items-center text-xs font-mono font-bold px-3 py-2 bg-foreground text-background hover:bg-opacity-80 transition-colors">
              <Bell size={16} className="mr-2" /> SET ALERT
            </button>
          </div>
        </div>
        <Ticker />
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
            
            <div className="bg-white border-2 border-border-color shadow-brutal p-6">
              <h3 className="font-bold uppercase tracking-tight text-lg mb-4 border-b border-border-color pb-2">Analisis & Prediksi (Machine Learning)</h3>
              <p className="text-sm leading-relaxed">
                Berdasarkan model <strong>ARIMA</strong> yang dilatih pada data historis 5 tahun terakhir, tren harga {name} di Jawa Tengah menunjukkan sinyal <strong>BULLISH</strong> untuk 14 hari ke depan. Faktor musiman (menjelang hari besar) dan anomali iklim di daerah sentra produksi diprediksi akan menekan pasokan sebesar 12%.
              </p>
              
              <div className="mt-6 p-4 bg-surface border border-border-color flex justify-between items-center">
                <div>
                  <div className="text-xs font-mono text-accent-grey uppercase">Prediksi Harga H+7</div>
                  <div className="font-mono font-bold text-xl mt-1">Rp 14.200 <span className="text-accent-red text-sm ml-2">▲ 5.1%</span></div>
                </div>
                <button className="bg-foreground text-background font-mono text-xs font-bold px-4 py-2 hover:bg-opacity-80 transition-colors">
                  LIHAT DETAIL PREDIKSI
                </button>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}
