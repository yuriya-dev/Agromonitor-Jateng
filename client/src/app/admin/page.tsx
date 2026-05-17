import Link from "next/link";
import { 
  Database, 
  Settings, 
  Users, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Search,
  Filter
} from "lucide-react";

export default function AdminDashboard() {
  // Mock data for the admin table
  const recentData = [
    { id: "TX-001", commodity: "Beras Medium", location: "Pasar Johar", price: 13500, date: "2024-05-17 08:30", status: "VALID", source: "Petugas Lapangan" },
    { id: "TX-002", commodity: "Bawang Merah", location: "Pasar Peterongan", price: 35000, date: "2024-05-17 08:15", status: "PENDING_REVIEW", source: "API BPS" },
    { id: "TX-003", commodity: "Cabai Rawit", location: "Pasar Bulu", price: 45000, date: "2024-05-17 07:45", status: "VALID", source: "API Kemendag" },
    { id: "TX-004", commodity: "Daging Sapi", location: "Pasar Johar", price: 125000, date: "2024-05-17 07:30", status: "FAIL", source: "Petugas Lapangan" },
    { id: "TX-005", commodity: "Telur Ayam", location: "Pasar Karangayu", price: 28000, date: "2024-05-17 07:10", status: "VALID", source: "Petugas Lapangan" },
  ];

  return (
    <div className="min-h-screen bg-surface flex text-foreground font-sans">
      {/* Sidebar Admin */}
      <aside className="w-64 bg-background border-r-2 border-border-color flex flex-col">
        <div className="p-6 border-b-2 border-border-color">
          <h1 className="text-xl font-bold tracking-tight uppercase flex items-center">
            AGROMONITOR<span className="text-accent-red ml-2">ADMIN</span>
          </h1>
          <p className="text-xs font-mono text-accent-grey mt-2 uppercase tracking-widest">
            Command Center
          </p>
        </div>
        
        <nav className="flex-1 py-6 space-y-1">
          <Link href="/admin" className="flex items-center px-6 py-3 bg-surface border-r-4 border-accent-red text-foreground font-bold font-mono text-sm uppercase">
            <Database size={18} className="mr-3" />
            Manajemen Data
          </Link>
          <Link href="/admin/users" className="flex items-center px-6 py-3 hover:bg-surface text-accent-grey hover:text-foreground font-mono text-sm uppercase transition-colors">
            <Users size={18} className="mr-3" />
            Pengguna & Akses
          </Link>
          <Link href="/admin/settings" className="flex items-center px-6 py-3 hover:bg-surface text-accent-grey hover:text-foreground font-mono text-sm uppercase transition-colors">
            <Settings size={18} className="mr-3" />
            Konfigurasi Sistem
          </Link>
          <Link href="/" className="flex items-center px-6 py-3 mt-8 hover:bg-surface text-accent-grey hover:text-foreground font-mono text-sm uppercase transition-colors border-t border-border-color pt-6">
            Kembali ke Publik
          </Link>
        </nav>
        
        <div className="p-6 border-t-2 border-border-color">
          <div className="text-xs font-mono font-bold uppercase">Sistem Status:</div>
          <div className="flex items-center mt-2 text-accent-green font-mono text-sm font-bold">
            <div className="w-2 h-2 bg-accent-green rounded-full mr-2 animate-pulse"></div>
            OPERASIONAL
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Header Admin */}
        <header className="bg-background border-b-2 border-border-color px-8 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold uppercase tracking-tight">Manajemen Data Harga</h2>
          <div className="flex items-center space-x-4">
            <div className="text-sm font-mono border-2 border-border-color px-3 py-1 bg-surface">
              ADMIN_ROOT
            </div>
            <button className="bg-foreground text-background font-mono font-bold uppercase px-4 py-2 text-sm hover:bg-accent-red transition-colors shadow-brutal active:translate-y-1 active:shadow-none">
              Logout
            </button>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white border-2 border-border-color p-5 shadow-brutal relative group hover:-translate-y-1 transition-transform">
              <div className="text-xs font-mono text-accent-grey uppercase mb-2">Total Data Hari Ini</div>
              <div className="text-4xl font-mono font-bold">2,451</div>
              <div className="mt-2 text-xs font-mono font-bold text-accent-green">▲ 12% DARI KEMARIN</div>
            </div>
            <div className="bg-white border-2 border-border-color p-5 shadow-brutal relative group hover:-translate-y-1 transition-transform">
              <div className="text-xs font-mono text-accent-grey uppercase mb-2">Sinkronisasi API</div>
              <div className="text-4xl font-mono font-bold">100%</div>
              <div className="mt-2 text-xs font-mono font-bold text-accent-green">BERHASIL TERHUBUNG</div>
            </div>
            <div className="bg-white border-2 border-accent-red p-5 shadow-brutal relative group hover:-translate-y-1 transition-transform">
              <div className="text-xs font-mono text-accent-red uppercase mb-2">Gagal Validasi</div>
              <div className="text-4xl font-mono font-bold text-accent-red">42</div>
              <div className="mt-2 text-xs font-mono font-bold text-accent-red flex items-center">
                <AlertTriangle size={14} className="mr-1" /> BUTUH REVIEW MANUAL
              </div>
            </div>
            <div className="bg-white border-2 border-border-color p-5 shadow-brutal relative group hover:-translate-y-1 transition-transform">
              <div className="text-xs font-mono text-accent-grey uppercase mb-2">Status Machine Learning</div>
              <div className="text-4xl font-mono font-bold">ARIMA</div>
              <div className="mt-2 text-xs font-mono font-bold text-accent-green">TRAINING SELESAI 02:00</div>
            </div>
          </div>

          {/* Data Table Section */}
          <div className="bg-white border-2 border-border-color shadow-brutal mb-8">
            <div className="p-4 border-b-2 border-border-color flex justify-between items-center bg-surface">
              <h3 className="font-bold uppercase tracking-tight text-lg">Log Transaksi Data Harga</h3>
              <div className="flex space-x-2">
                <div className="flex border-2 border-border-color bg-white px-3 py-1 items-center">
                  <Search size={16} className="text-accent-grey mr-2" />
                  <input type="text" placeholder="CARI ID / KOMODITAS" className="outline-none text-sm font-mono w-48 uppercase placeholder-accent-grey" />
                </div>
                <button className="border-2 border-border-color bg-white px-3 py-1 flex items-center hover:bg-surface font-mono text-sm uppercase font-bold">
                  <Filter size={16} className="mr-2" /> Filter
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface font-mono text-xs uppercase text-accent-grey border-b-2 border-border-color">
                    <th className="p-4 font-bold">ID Transaksi</th>
                    <th className="p-4 font-bold">Waktu Masuk</th>
                    <th className="p-4 font-bold">Sumber</th>
                    <th className="p-4 font-bold">Komoditas / Lokasi</th>
                    <th className="p-4 font-bold">Harga Input</th>
                    <th className="p-4 font-bold">Status Validasi</th>
                    <th className="p-4 font-bold text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="font-mono text-sm">
                  {recentData.map((item, idx) => (
                    <tr 
                      key={item.id} 
                      className={`border-b border-border-color group hover:bg-surface transition-colors cursor-pointer relative ${
                        idx % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"
                      }`}
                    >
                      {/* Hover targeting border */}
                      <td className="absolute left-0 top-0 bottom-0 w-1 bg-transparent group-hover:bg-foreground transition-colors"></td>
                      
                      <td className="p-4 font-bold">{item.id}</td>
                      <td className="p-4">{item.date}</td>
                      <td className="p-4">{item.source}</td>
                      <td className="p-4">
                        <div className="font-bold">{item.commodity}</div>
                        <div className="text-xs text-accent-grey mt-1">{item.location}</div>
                      </td>
                      <td className="p-4 font-bold">Rp {item.price.toLocaleString("id-ID")}</td>
                      <td className="p-4">
                        {item.status === "VALID" && (
                          <span className="inline-flex items-center px-2 py-1 bg-green-100 text-accent-green text-xs font-bold border border-accent-green">
                            <CheckCircle size={12} className="mr-1" /> VALID
                          </span>
                        )}
                        {item.status === "PENDING_REVIEW" && (
                          <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold border border-yellow-700">
                            <AlertTriangle size={12} className="mr-1" /> REVIEW
                          </span>
                        )}
                        {item.status === "FAIL" && (
                          <span className="inline-flex items-center px-2 py-1 bg-red-100 text-accent-red text-xs font-bold border border-accent-red">
                            <XCircle size={12} className="mr-1" /> DITOLAK
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <button className="text-xs border-2 border-foreground px-2 py-1 font-bold hover:bg-foreground hover:text-white transition-colors">
                          DETAIL
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="p-4 bg-surface border-t-2 border-border-color flex justify-between items-center font-mono text-sm">
              <div>Menampilkan 1-5 dari 2,451 data</div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border border-border-color bg-white hover:bg-foreground hover:text-white transition-colors uppercase font-bold">&lt; PREV</button>
                <button className="px-3 py-1 border border-foreground bg-foreground text-white font-bold">1</button>
                <button className="px-3 py-1 border border-border-color bg-white hover:bg-foreground hover:text-white transition-colors font-bold">2</button>
                <button className="px-3 py-1 border border-border-color bg-white hover:bg-foreground hover:text-white transition-colors font-bold">3</button>
                <button className="px-3 py-1 border border-border-color bg-white hover:bg-foreground hover:text-white transition-colors uppercase font-bold">NEXT &gt;</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
