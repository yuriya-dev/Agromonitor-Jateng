'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Loader2
} from "lucide-react";

export default function AdminDashboard() {
  type Metrics = {
    totalDataHariIni: number;
    syncStatus: string;
    gagalValidasi: number;
    mlStatus: string;
  };

  type TransactionItem = {
    id: string;
    fullId: string;
    commodity: string;
    location: string;
    price: number;
    date: string;
    status: string;
    source: string;
  };

  const [metrics, setMetrics] = useState<Metrics>({
    totalDataHariIni: 0,
    syncStatus: '100%',
    gagalValidasi: 0,
    mlStatus: 'ARIMA'
  });
  
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('SEMUA');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selectedTx, setSelectedTx] = useState<TransactionItem | null>(null);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 5, totalPages: 1 });

  const fetchMetrics = useCallback(async () => {
    try {
      const res = await fetch('http://localhost:5001/api/admin/metrics');
      const json = await res.json();
      if (json.success) {
        setMetrics(json.data);
      }
    } catch {
      console.error('Failed to fetch metrics');
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5001/api/admin/transactions?page=${page}&limit=5&search=${search}&status=${filterStatus}`);
      const json = await res.json();
      if (json.success) {
        setTransactions(json.data as TransactionItem[]);
        setPagination(json.pagination);
      }
    } catch {
      console.error('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  }, [page, search, filterStatus]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to page 1 on search
  };

  return (
    <>
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white border-2 border-border-color p-5 shadow-brutal relative group hover:-translate-y-1 transition-transform">
          <div className="text-xs font-mono text-accent-grey uppercase mb-2">Total Data Hari Ini</div>
          <div className="text-4xl font-mono font-bold">
            {metrics.totalDataHariIni.toLocaleString('id-ID')}
          </div>
          <div className="mt-2 text-xs font-mono font-bold text-accent-green">DARI DATABASE PRISMA</div>
        </div>
        <div className="bg-white border-2 border-border-color p-5 shadow-brutal relative group hover:-translate-y-1 transition-transform">
          <div className="text-xs font-mono text-accent-grey uppercase mb-2">Sinkronisasi API</div>
          <div className="text-4xl font-mono font-bold">{metrics.syncStatus}</div>
          <div className="mt-2 text-xs font-mono font-bold text-accent-green">BERHASIL TERHUBUNG</div>
        </div>
        <div className={`bg-white border-2 p-5 shadow-brutal relative group hover:-translate-y-1 transition-transform ${metrics.gagalValidasi > 0 ? 'border-accent-red' : 'border-border-color'}`}>
          <div className={`text-xs font-mono uppercase mb-2 ${metrics.gagalValidasi > 0 ? 'text-accent-red' : 'text-accent-grey'}`}>Gagal Validasi</div>
          <div className={`text-4xl font-mono font-bold ${metrics.gagalValidasi > 0 ? 'text-accent-red' : 'text-foreground'}`}>
            {metrics.gagalValidasi}
          </div>
          {metrics.gagalValidasi > 0 ? (
            <div className="mt-2 text-xs font-mono font-bold text-accent-red flex items-center">
              <AlertTriangle size={14} className="mr-1" /> BUTUH REVIEW MANUAL
            </div>
          ) : (
             <div className="mt-2 text-xs font-mono font-bold text-accent-green flex items-center">
               <CheckCircle size={14} className="mr-1" /> SEMUA DATA VALID
             </div>
          )}
        </div>
        <div className="bg-white border-2 border-border-color p-5 shadow-brutal relative group hover:-translate-y-1 transition-transform">
          <div className="text-xs font-mono text-accent-grey uppercase mb-2">Status Machine Learning</div>
          <div className="text-4xl font-mono font-bold">{metrics.mlStatus}</div>
          <div className="mt-2 text-xs font-mono font-bold text-accent-green">TRAINING SELESAI 02:00</div>
        </div>
      </div>

      {/* Data Table Section */}
      <div className="bg-white border-2 border-border-color shadow-brutal mb-8">
        <div className="p-4 border-b-2 border-border-color flex flex-col md:flex-row justify-between items-center bg-surface gap-4">
          <h3 className="font-bold uppercase tracking-tight text-lg">Log Transaksi Data Harga</h3>
          <div className="flex space-x-2 w-full md:w-auto">
            <div className="flex border-2 border-border-color bg-white px-3 py-1 items-center flex-1 md:flex-none">
              <Search size={16} className="text-accent-grey mr-2" />
              <input 
                type="text" 
                placeholder="CARI ID / KOMODITAS" 
                value={search}
                onChange={handleSearch}
                className="outline-none text-sm font-mono w-full md:w-48 uppercase placeholder-accent-grey" 
              />
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                className="border-2 border-border-color bg-white px-3 py-1 flex items-center hover:bg-surface font-mono text-sm uppercase font-bold"
              >
                <Filter size={16} className="mr-2" /> Filter
              </button>
              {showFilterDropdown && (
                <div className="absolute right-0 mt-1 w-48 bg-white border-2 border-border-color shadow-brutal z-20">
                  {['SEMUA', 'VALID', 'PENDING_REVIEW', 'FAIL'].map(status => (
                    <div 
                      key={status}
                      onClick={() => { setFilterStatus(status); setShowFilterDropdown(false); setPage(1); }}
                      className="px-4 py-2 hover:bg-surface cursor-pointer font-mono text-sm"
                    >
                      {status === 'SEMUA' ? 'Semua Status' : status}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[300px] relative">
          {loading && (
             <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
               <Loader2 className="animate-spin text-foreground" size={32} />
             </div>
          )}
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
              {transactions.length === 0 && !loading ? (
                 <tr>
                   <td colSpan={7} className="p-8 text-center text-accent-grey">Tidak ada data transaksi yang ditemukan.</td>
                 </tr>
              ) : (
                transactions.map((item, idx) => (
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
                      <button 
                        onClick={() => setSelectedTx(item)}
                        className="text-xs border-2 border-foreground px-2 py-1 font-bold hover:bg-foreground hover:text-white transition-colors"
                      >
                        DETAIL
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 bg-surface border-t-2 border-border-color flex justify-between items-center font-mono text-sm">
          <div>Menampilkan {transactions.length > 0 ? ((page - 1) * pagination.limit) + 1 : 0}-{Math.min(page * pagination.limit, pagination.total)} dari {pagination.total.toLocaleString('id-ID')} data</div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-border-color bg-white hover:bg-foreground hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-foreground transition-colors uppercase font-bold"
            >
              &lt; PREV
            </button>
            
            {/* Generate page numbers */}
            {Array.from({ length: Math.min(3, pagination.totalPages) }, (_, i) => {
               let pageNum = page;
               if (page === 1) pageNum = i + 1;
               else if (page === pagination.totalPages) pageNum = pagination.totalPages - 2 + i;
               else pageNum = page - 1 + i;
               
               if (pageNum < 1 || pageNum > pagination.totalPages) return null;

               return (
                 <button 
                   key={pageNum}
                   onClick={() => setPage(pageNum)}
                   className={`px-3 py-1 border font-bold transition-colors ${
                     pageNum === page 
                       ? "border-foreground bg-foreground text-white" 
                       : "border-border-color bg-white hover:bg-foreground hover:text-white"
                   }`}
                 >
                   {pageNum}
                 </button>
               );
            })}
            
            <button 
              onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
              disabled={page === pagination.totalPages || pagination.totalPages === 0}
              className="px-3 py-1 border border-border-color bg-white hover:bg-foreground hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-foreground transition-colors uppercase font-bold"
            >
              NEXT &gt;
            </button>
          </div>
        </div>
      </div>
      {/* Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white border-4 border-foreground shadow-brutal p-6 w-[500px] max-w-full relative">
            <button 
              onClick={() => setSelectedTx(null)}
              className="absolute top-4 right-4 hover:text-accent-red"
            >
              <XCircle size={24} />
            </button>
            <h3 className="font-bold uppercase tracking-tight text-xl mb-4 border-b-2 border-border-color pb-2">
              Detail Transaksi
            </h3>
            <div className="font-mono text-sm space-y-4">
              <div><span className="text-accent-grey block">ID Transaksi</span><span className="font-bold">{selectedTx.fullId}</span></div>
              <div><span className="text-accent-grey block">Komoditas</span><span className="font-bold">{selectedTx.commodity}</span></div>
              <div><span className="text-accent-grey block">Lokasi Pasar</span><span className="font-bold">{selectedTx.location}</span></div>
              <div><span className="text-accent-grey block">Harga</span><span className="font-bold text-lg">Rp {selectedTx.price.toLocaleString("id-ID")}</span></div>
              <div><span className="text-accent-grey block">Waktu Masuk</span><span>{selectedTx.date}</span></div>
              <div><span className="text-accent-grey block">Sumber Data</span><span>{selectedTx.source}</span></div>
              <div>
                <span className="text-accent-grey block mb-1">Status Validasi</span>
                {selectedTx.status === "VALID" && <span className="inline-block px-2 py-1 bg-green-100 text-accent-green font-bold border border-accent-green">VALID</span>}
                {selectedTx.status === "PENDING_REVIEW" && <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-700 font-bold border border-yellow-700">PENDING REVIEW</span>}
                {selectedTx.status === "FAIL" && <span className="inline-block px-2 py-1 bg-red-100 text-accent-red font-bold border border-accent-red">DITOLAK</span>}
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button 
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 bg-foreground text-white font-mono font-bold hover:bg-black transition-colors"
              >
                TUTUP
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
