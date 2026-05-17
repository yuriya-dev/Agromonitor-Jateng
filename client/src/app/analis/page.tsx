import { TrendingUp } from "lucide-react";

export default function AnalisDashboard() {
  return (
    <>
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
      
      {/* Overview Info */}
      <div className="bg-surface border-2 border-border-color p-8 text-center mt-12">
        <h3 className="font-bold text-xl uppercase mb-2">Selamat Datang di Analitik Agromonitor</h3>
        <p className="text-accent-grey font-mono text-sm max-w-2xl mx-auto">
          Gunakan menu di sebelah kiri untuk mengonfigurasi model Machine Learning (ARIMA), mengubah bobot kriteria Sistem Pendukung Keputusan (SAW), atau mengekspor laporan data.
        </p>
      </div>
    </>
  );
}
