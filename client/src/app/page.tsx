import Ticker from "@/components/Ticker";
import CommodityCard from "@/components/CommodityCard";
import { Search, Settings, Map as MapIcon, Bell } from "lucide-react";

export default function Home() {
  const dummyCommodities = [
    { name: "Beras Medium", price: 13500, changeAmount: 150, changePercent: 1.1, unit: "KG" },
    { name: "Beras Premium", price: 16200, changeAmount: 0, changePercent: 0, unit: "KG" },
    { name: "Gula Pasir", price: 16000, changeAmount: -100, changePercent: -0.6, unit: "KG" },
    { name: "Minyak Goreng Curah", price: 15500, changeAmount: 0, changePercent: 0, unit: "LITER" },
    { name: "Daging Sapi", price: 130000, changeAmount: 2000, changePercent: 1.5, unit: "KG" },
    { name: "Daging Ayam Ras", price: 38000, changeAmount: -500, changePercent: -1.3, unit: "KG" },
    { name: "Telur Ayam Ras", price: 28000, changeAmount: -300, changePercent: -1.0, unit: "KG" },
    { name: "Bawang Merah", price: 35000, changeAmount: 1500, changePercent: 4.4, unit: "KG" },
    { name: "Bawang Putih", price: 40000, changeAmount: 500, changePercent: 1.2, unit: "KG" },
    { name: "Cabai Merah Keriting", price: 55000, changeAmount: -2000, changePercent: -3.5, unit: "KG" },
    { name: "Cabai Rawit Merah", price: 65000, changeAmount: 3500, changePercent: 5.6, unit: "KG" },
    { name: "Tepung Terigu", price: 11000, changeAmount: 0, changePercent: 0, unit: "KG" },
  ];

  return (
    <main className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="bg-background border-b-2 border-border-color sticky top-0 z-50">
        <div className="px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold tracking-tight uppercase flex items-center">
              <span className="w-4 h-4 bg-foreground inline-block mr-2"></span>
              AGROMONITOR<span className="text-accent-grey ml-2">JATENG</span>
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="relative hidden md:block">
              <input 
                type="text" 
                placeholder="Cari komoditas, pasar..." 
                className="pl-10 pr-4 py-2 bg-surface border border-border-color font-mono text-sm focus:outline-none focus:border-2 w-64 transition-all"
              />
              <Search className="absolute left-3 top-2.5 text-accent-grey" size={16} />
            </div>
            <button className="hover:bg-surface p-2 border border-transparent hover:border-border-color transition-colors">
              <Bell size={20} />
            </button>
            <button className="hover:bg-surface p-2 border border-transparent hover:border-border-color transition-colors">
              <MapIcon size={20} />
            </button>
            <button className="hover:bg-surface p-2 border border-transparent hover:border-border-color transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>
        <Ticker />
      </header>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className="flex justify-between items-end border-b-2 border-border-color pb-4">
            <div>
              <h2 className="text-3xl font-bold uppercase tracking-tight">Market Overview</h2>
              <p className="font-mono text-sm text-accent-grey mt-1">
                Data Harga Komoditas Rata-rata Jawa Tengah • {new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex space-x-2">
              <button className="bg-foreground text-background font-mono text-xs px-4 py-2 font-bold hover:bg-opacity-80 transition-opacity">
                HARI INI
              </button>
              <button className="bg-background text-foreground border border-border-color font-mono text-xs px-4 py-2 font-bold hover:bg-surface transition-colors">
                1 MINGGU
              </button>
              <button className="bg-background text-foreground border border-border-color font-mono text-xs px-4 py-2 font-bold hover:bg-surface transition-colors">
                1 BULAN
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {dummyCommodities.map((commodity, index) => (
              <CommodityCard
                key={index}
                name={commodity.name}
                price={commodity.price}
                changeAmount={commodity.changeAmount}
                changePercent={commodity.changePercent}
                unit={commodity.unit}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
