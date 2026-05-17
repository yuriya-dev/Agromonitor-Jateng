import Link from "next/link";
import { Camera, Send, MapPin, Package, Calendar, DollarSign, LogOut } from "lucide-react";

export default function PetugasLapanganPage() {
  return (
    <main className="min-h-screen bg-surface font-sans flex flex-col items-center">
      <div className="w-full max-w-md min-h-screen bg-white border-x-2 border-border-color shadow-brutal flex flex-col relative">
        
        {/* Header Mobile */}
        <header className="bg-background border-b-2 border-border-color p-4 sticky top-0 z-50 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase flex items-center">
              AGRO<span className="text-accent-red">ENTRY</span>
            </h1>
            <p className="text-[10px] font-mono text-accent-grey uppercase tracking-widest mt-1">
              Portal Petugas Lapangan
            </p>
          </div>
          <Link href="/login" className="p-2 border-2 border-border-color bg-surface hover:bg-accent-red hover:text-white transition-colors active:translate-y-1">
            <LogOut size={16} />
          </Link>
        </header>

        {/* User Info & Location Status */}
        <div className="bg-surface border-b-2 border-border-color p-4 flex flex-col space-y-3">
          <div className="flex justify-between items-center">
            <div className="text-xs font-mono font-bold uppercase">Petugas ID: PTG-194</div>
            <div className="text-xs font-mono font-bold uppercase text-accent-green flex items-center">
              <div className="w-2 h-2 bg-accent-green rounded-full mr-2 animate-pulse"></div>
              ONLINE
            </div>
          </div>
          <div className="bg-white border-2 border-border-color p-3 flex items-center shadow-brutal">
            <MapPin size={18} className="text-accent-red mr-3" />
            <div>
              <div className="text-[10px] font-mono text-accent-grey uppercase">Lokasi Tugas (GPS)</div>
              <div className="text-sm font-bold uppercase">Pasar Johar, Semarang</div>
            </div>
          </div>
        </div>

        {/* Form Entry */}
        <div className="p-6 flex-1">
          <h2 className="text-lg font-bold uppercase mb-6 tracking-tight border-b-2 border-foreground pb-2 inline-block">
            Input Harga Harian
          </h2>

          <form className="space-y-6">
            {/* Tanggal */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase text-accent-grey">Tanggal Pencatatan</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={18} className="text-foreground" />
                </div>
                <input 
                  type="date" 
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full border-2 border-border-color bg-white p-3 pl-10 font-mono text-sm outline-none focus:border-foreground"
                />
              </div>
            </div>

            {/* Komoditas */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase text-accent-grey">Pilih Komoditas</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Package size={18} className="text-foreground" />
                </div>
                <select className="w-full border-2 border-border-color bg-white p-3 pl-10 font-mono text-sm outline-none focus:border-foreground appearance-none cursor-pointer">
                  <option value="">-- PILIH KOMODITAS --</option>
                  <option value="beras-medium">Beras Medium (Kg)</option>
                  <option value="beras-premium">Beras Premium (Kg)</option>
                  <option value="bawang-merah">Bawang Merah (Kg)</option>
                  <option value="bawang-putih">Bawang Putih (Kg)</option>
                  <option value="cabai-rawit">Cabai Rawit (Kg)</option>
                  <option value="daging-sapi">Daging Sapi (Kg)</option>
                  <option value="telur-ayam">Telur Ayam Ras (Kg)</option>
                </select>
              </div>
            </div>

            {/* Harga */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase text-accent-grey">Harga Aktual (Rupiah)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-foreground font-mono font-bold">
                  Rp
                </div>
                <input 
                  type="number" 
                  placeholder="0"
                  className="w-full border-2 border-border-color bg-white p-3 pl-10 font-mono text-xl font-bold outline-none focus:border-foreground text-right"
                />
              </div>
            </div>

            {/* Foto Bukti */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase text-accent-grey">Foto Bukti / Kios (Wajib)</label>
              <button type="button" className="w-full border-2 border-dashed border-border-color bg-surface hover:bg-white p-6 flex flex-col items-center justify-center transition-colors">
                <Camera size={32} className="text-accent-grey mb-2" />
                <span className="text-xs font-mono font-bold uppercase text-accent-grey">Ambil / Unggah Foto</span>
              </button>
            </div>

            <div className="pt-4 pb-12">
              <button type="submit" className="w-full flex items-center justify-center bg-foreground text-background font-mono font-bold uppercase py-4 hover:bg-accent-green hover:text-white hover:shadow-brutal transition-all active:translate-y-1 active:shadow-none border-2 border-transparent">
                <Send size={18} className="mr-2" />
                Kirim Data Harga
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
