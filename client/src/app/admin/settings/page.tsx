import { Save, RefreshCw, Server, Shield } from "lucide-react";

export default function AdminSettings() {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold uppercase tracking-tight text-xl">Konfigurasi Sistem Global</h3>
          <p className="text-sm font-mono text-accent-grey">Atur parameter dan integrasi sistem eksternal.</p>
        </div>
        <button className="bg-foreground text-background font-mono font-bold uppercase px-6 py-3 flex items-center hover:bg-accent-green transition-colors shadow-brutal active:translate-y-1 active:shadow-none">
          <Save size={18} className="mr-2" />
          Simpan Perubahan
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* API Settings */}
        <div className="bg-white border-2 border-border-color shadow-brutal flex flex-col">
          <div className="p-4 border-b-2 border-border-color bg-surface flex items-center">
            <Server size={20} className="mr-2" />
            <h3 className="font-bold uppercase tracking-tight text-lg">Integrasi API Eksternal</h3>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-foreground mb-2">Endpoint BPS (Badan Pusat Statistik)</label>
              <input type="text" defaultValue="https://api.bps.go.id/v1/harga/jateng" className="w-full border-2 border-border-color p-3 font-mono text-sm outline-none focus:border-foreground transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-foreground mb-2">Endpoint Kemendag</label>
              <input type="text" defaultValue="https://siskaperbapo.kemendag.go.id/api/v2" className="w-full border-2 border-border-color p-3 font-mono text-sm outline-none focus:border-foreground transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-foreground mb-2">Interval Sinkronisasi (Menit)</label>
              <input type="number" defaultValue="60" className="w-full border-2 border-border-color p-3 font-mono text-sm outline-none focus:border-foreground transition-colors" />
            </div>
            <div className="pt-4 border-t-2 border-border-color">
              <button className="w-full bg-surface border-2 border-border-color text-foreground font-mono font-bold uppercase py-3 flex justify-center items-center hover:border-foreground transition-colors">
                <RefreshCw size={18} className="mr-2" />
                Test Koneksi API
              </button>
            </div>
          </div>
        </div>

        {/* Security & Maintenance */}
        <div className="bg-white border-2 border-border-color shadow-brutal flex flex-col">
          <div className="p-4 border-b-2 border-border-color bg-surface flex items-center">
            <Shield size={20} className="mr-2" />
            <h3 className="font-bold uppercase tracking-tight text-lg">Keamanan & Maintenance</h3>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-foreground mb-2">Sesi Login Timeout (Menit)</label>
              <input type="number" defaultValue="120" className="w-full border-2 border-border-color p-3 font-mono text-sm outline-none focus:border-foreground transition-colors" />
            </div>
            
            <div className="flex items-center justify-between p-4 border-2 border-border-color">
              <div>
                <div className="font-bold uppercase text-sm">Mode Maintenance</div>
                <div className="text-xs font-mono text-accent-grey mt-1">Nonaktifkan akses publik sementara</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-accent-grey peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-red rounded-full"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border-2 border-border-color">
              <div>
                <div className="font-bold uppercase text-sm">Validasi Otomatis (Rule-based)</div>
                <div className="text-xs font-mono text-accent-grey mt-1">Otomatis terima data jika anomali &lt; 5%</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-accent-grey peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-green rounded-full"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
