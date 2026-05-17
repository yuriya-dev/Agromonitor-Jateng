import Link from "next/link";
import { 
  BarChart2, 
  Settings, 
  Download, 
  TrendingUp, 
  Activity,
  Sliders,
  FileText,
  Database
} from "lucide-react";

export default function AnalisDashboard() {
  return (
    <div className="min-h-screen bg-surface flex text-foreground font-sans">
      {/* Sidebar Analis */}
      <aside className="w-64 bg-background border-r-2 border-border-color flex flex-col hidden md:flex">
        <div className="p-6 border-b-2 border-border-color">
          <h1 className="text-xl font-bold tracking-tight uppercase flex items-center">
            AGROMONITOR<span className="text-accent-green ml-2">ANALYTICS</span>
          </h1>
          <p className="text-xs font-mono text-accent-grey mt-2 uppercase tracking-widest">
            Data Science Portal
          </p>
        </div>
        
        <nav className="flex-1 py-6 space-y-1">
          <Link href="/analis" className="flex items-center px-6 py-3 bg-surface border-r-4 border-accent-green text-foreground font-bold font-mono text-sm uppercase">
            <BarChart2 size={18} className="mr-3" />
            Dashboard Analitik
          </Link>
          <Link href="#konfigurasi-ml" className="flex items-center px-6 py-3 hover:bg-surface text-accent-grey hover:text-foreground font-mono text-sm uppercase transition-colors">
            <Settings size={18} className="mr-3" />
            Konfigurasi ML (ARIMA)
          </Link>
          <Link href="#konfigurasi-saw" className="flex items-center px-6 py-3 hover:bg-surface text-accent-grey hover:text-foreground font-mono text-sm uppercase transition-colors">
            <Sliders size={18} className="mr-3" />
            Parameter SPK (SAW)
          </Link>
          <Link href="#laporan" className="flex items-center px-6 py-3 hover:bg-surface text-accent-grey hover:text-foreground font-mono text-sm uppercase transition-colors border-t border-border-color mt-4 pt-4">
            <FileText size={18} className="mr-3" />
            Ekspor Laporan
          </Link>
          <Link href="/" className="flex items-center px-6 py-3 mt-8 hover:bg-surface text-accent-grey hover:text-foreground font-mono text-sm uppercase transition-colors border-t border-border-color pt-6">
            Kembali ke Publik
          </Link>
        </nav>
        
        <div className="p-6 border-t-2 border-border-color">
          <div className="text-xs font-mono font-bold uppercase">Role Akses:</div>
          <div className="flex items-center mt-2 text-foreground font-mono text-sm font-bold">
            DATA_SCIENTIST
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Analis */}
        <header className="bg-background border-b-2 border-border-color px-8 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold uppercase tracking-tight">Advanced Analytics & Prediction</h2>
          <div className="flex items-center space-x-4">
            <button className="bg-foreground text-background font-mono font-bold uppercase px-4 py-2 text-sm hover:bg-accent-green hover:shadow-brutal transition-all active:translate-y-1 active:shadow-none">
              Generate Report
            </button>
            <Link href="/login" className="border-2 border-border-color bg-surface text-foreground font-mono font-bold uppercase px-4 py-2 text-sm hover:bg-white transition-colors shadow-brutal active:translate-y-1 active:shadow-none">
              Logout
            </Link>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white border-2 border-border-color p-5 shadow-brutal">
              <div className="text-xs font-mono text-accent-grey uppercase mb-2">Model Accuracy (ARIMA)</div>
              <div className="text-4xl font-mono font-bold text-accent-green">94.2%</div>
              <div className="mt-2 text-xs font-mono font-bold text-accent-grey">RMSE: 145.20 | MAPE: 2.1%</div>
            </div>
            <div className="bg-white border-2 border-border-color p-5 shadow-brutal">
              <div className="text-xs font-mono text-accent-grey uppercase mb-2">Processed Data Points</div>
              <div className="text-4xl font-mono font-bold">1.2M</div>
              <div className="mt-2 text-xs font-mono font-bold text-accent-grey">HISTORICAL DATA (3 YEARS)</div>
            </div>
            <div className="bg-white border-2 border-border-color p-5 shadow-brutal">
              <div className="text-xs font-mono text-accent-grey uppercase mb-2">SPK SAW Active Decision</div>
              <div className="text-4xl font-mono font-bold">Priority 1</div>
              <div className="mt-2 text-xs font-mono font-bold text-accent-red flex items-center">
                <TrendingUp size={14} className="mr-1" /> INTERVENSI PASAR: BERAS
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            {/* Panel Konfigurasi ARIMA */}
            <div className="bg-white border-2 border-border-color shadow-brutal flex flex-col">
              <div className="p-4 border-b-2 border-border-color bg-surface flex items-center">
                <Activity size={20} className="mr-2" />
                <h3 className="font-bold uppercase tracking-tight text-lg">Parameter Model ARIMA (p,d,q)</h3>
              </div>
              <div className="p-6 flex-1">
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase text-accent-grey mb-1">AR (p)</label>
                      <input type="number" defaultValue={2} className="w-full border-2 border-border-color p-2 font-mono text-center outline-none focus:border-foreground" />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase text-accent-grey mb-1">I (d)</label>
                      <input type="number" defaultValue={1} className="w-full border-2 border-border-color p-2 font-mono text-center outline-none focus:border-foreground" />
                    </div>
                    <div>
                      <label className="block text-xs font-mono font-bold uppercase text-accent-grey mb-1">MA (q)</label>
                      <input type="number" defaultValue={2} className="w-full border-2 border-border-color p-2 font-mono text-center outline-none focus:border-foreground" />
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <label className="block text-xs font-mono font-bold uppercase text-accent-grey mb-1">Confidence Interval</label>
                    <select className="w-full border-2 border-border-color p-2 font-mono text-sm outline-none focus:border-foreground">
                      <option value="95">95% (Standard)</option>
                      <option value="90">90% (Aggressive)</option>
                      <option value="99">99% (Conservative)</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t-2 border-border-color mt-4">
                    <button className="w-full bg-foreground text-background font-mono font-bold uppercase py-3 hover:bg-accent-green hover:shadow-brutal transition-all active:translate-y-1 active:shadow-none border-2 border-transparent">
                      RETRAIN MODEL (FORCE UPDATE)
                    </button>
                    <p className="text-[10px] font-mono text-accent-grey uppercase mt-2 text-center">Last trained: 2 hours ago</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel Konfigurasi SPK SAW */}
            <div className="bg-white border-2 border-border-color shadow-brutal flex flex-col">
              <div className="p-4 border-b-2 border-border-color bg-surface flex items-center">
                <Sliders size={20} className="mr-2" />
                <h3 className="font-bold uppercase tracking-tight text-lg">Bobot SPK SAW (Simple Additive Weighting)</h3>
              </div>
              <div className="p-6 flex-1">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs font-mono font-bold uppercase text-foreground">Volatilitas Harga (C1)</label>
                      <span className="text-xs font-mono font-bold text-accent-red">40%</span>
                    </div>
                    <input type="range" min="0" max="100" defaultValue="40" className="w-full accent-accent-red" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs font-mono font-bold uppercase text-foreground">Tingkat Inflasi Daerah (C2)</label>
                      <span className="text-xs font-mono font-bold text-accent-green">30%</span>
                    </div>
                    <input type="range" min="0" max="100" defaultValue="30" className="w-full accent-accent-green" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs font-mono font-bold uppercase text-foreground">Ketersediaan Stok (C3)</label>
                      <span className="text-xs font-mono font-bold text-foreground">20%</span>
                    </div>
                    <input type="range" min="0" max="100" defaultValue="20" className="w-full accent-foreground" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <label className="text-xs font-mono font-bold uppercase text-foreground">Jarak Distribusi (C4)</label>
                      <span className="text-xs font-mono font-bold text-foreground">10%</span>
                    </div>
                    <input type="range" min="0" max="100" defaultValue="10" className="w-full accent-foreground" />
                  </div>

                  <div className="pt-4 border-t-2 border-border-color mt-4 flex items-center justify-between">
                    <div className="text-xs font-mono uppercase font-bold text-accent-grey">Total Bobot: 100%</div>
                    <button className="border-2 border-foreground px-4 py-2 font-mono text-sm font-bold uppercase hover:bg-foreground hover:text-white transition-colors">
                      Simpan Bobot
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Export Section */}
          <div className="bg-white border-2 border-border-color shadow-brutal">
            <div className="p-4 border-b-2 border-border-color bg-surface flex items-center">
              <Download size={20} className="mr-2" />
              <h3 className="font-bold uppercase tracking-tight text-lg">Ekspor Data & Laporan Analitik</h3>
            </div>
            <div className="p-6 flex flex-wrap gap-4">
              <button className="flex-1 min-w-[200px] border-2 border-border-color bg-white p-4 flex flex-col items-center justify-center hover:border-accent-red hover:shadow-brutal transition-all group">
                <FileText size={32} className="text-accent-grey group-hover:text-accent-red mb-2 transition-colors" />
                <span className="font-bold uppercase text-sm">Laporan PDF (Bulanan)</span>
                <span className="text-xs font-mono text-accent-grey mt-1">Full Executive Summary</span>
              </button>
              
              <button className="flex-1 min-w-[200px] border-2 border-border-color bg-white p-4 flex flex-col items-center justify-center hover:border-accent-green hover:shadow-brutal transition-all group">
                <Database size={32} className="text-accent-grey group-hover:text-accent-green mb-2 transition-colors" />
                <span className="font-bold uppercase text-sm">Raw Data (CSV)</span>
                <span className="text-xs font-mono text-accent-grey mt-1">Dataset 3 Tahun Terakhir</span>
              </button>

              <button className="flex-1 min-w-[200px] border-2 border-border-color bg-white p-4 flex flex-col items-center justify-center hover:border-foreground hover:shadow-brutal transition-all group">
                <Sliders size={32} className="text-accent-grey group-hover:text-foreground mb-2 transition-colors" />
                <span className="font-bold uppercase text-sm">Hasil Prediksi (JSON)</span>
                <span className="text-xs font-mono text-accent-grey mt-1">Output Model ARIMA + SPK</span>
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
