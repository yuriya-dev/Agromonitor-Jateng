import { 
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
    <>
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
    </>
  );
}
