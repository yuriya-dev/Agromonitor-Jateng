'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Loader2, MapPin, RefreshCw, Search, ShieldAlert, ShieldCheck, XCircle } from 'lucide-react';

type ReportStatus = 'SUBMITTED' | 'REVIEWED' | 'APPROVED' | 'REJECTED';

type FieldReport = {
  id: string;
  petugasCode: string;
  petugasName: string;
  petugasEmail: string | null;
  commodityName: string;
  market: string;
  price: number;
  reportDate: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  locationLabel: string;
  notes: string | null;
  photoUrl: string | null;
  status: ReportStatus;
  reporter: { id: string; name: string | null; email: string } | null;
  reviewedAt: string | null;
  createdAt: string;
};

export default function AdminPetugasPage() {
  const [reports, setReports] = useState<FieldReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('SEMUA');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set('search', search);
      if (filterStatus && filterStatus !== 'SEMUA') query.set('status', filterStatus);
      query.set('limit', '50');

      const res = await fetch(`http://localhost:5001/api/admin/field-reports?${query.toString()}`);
      const json = await res.json();
      if (json.success) {
        setReports(json.data);
      }
    } catch (error) {
      console.error('Failed to fetch field reports:', error);
    } finally {
      setLoading(false);
    }
  }, [search, filterStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReports();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchReports]);

  const updateStatus = async (reportId: string, status: ReportStatus) => {
    setActionLoading(reportId);
    try {
      const res = await fetch(`http://localhost:5001/api/admin/field-reports/${reportId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      const json = await res.json();
      if (json.success) {
        setReports((prev) => prev.map((report) => (report.id === reportId ? json.data : report)));
      }
    } catch (error) {
      console.error('Failed to update report status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const statusChip = (status: ReportStatus) => {
    if (status === 'APPROVED') return 'bg-green-100 text-accent-green border-accent-green';
    if (status === 'REJECTED') return 'bg-red-100 text-accent-red border-accent-red';
    if (status === 'REVIEWED') return 'bg-blue-100 text-blue-700 border-blue-600';
    return 'bg-yellow-100 text-yellow-800 border-yellow-700';
  };

  const stats = {
    total: reports.length,
    pending: reports.filter((report) => report.status === 'SUBMITTED').length,
    approved: reports.filter((report) => report.status === 'APPROVED').length,
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold uppercase tracking-tight text-xl">Laporan Petugas Lapangan</h3>
          <p className="text-sm font-mono text-accent-grey">Pantau kiriman tugas, koordinat GPS, dan status verifikasi admin.</p>
        </div>
        <button
          onClick={fetchReports}
          className="bg-foreground text-background font-mono font-bold uppercase px-4 py-3 flex items-center hover:bg-accent-red transition-colors shadow-brutal active:translate-y-1 active:shadow-none"
        >
          <RefreshCw size={18} className="mr-2" />
          Muat Ulang
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border-2 border-border-color shadow-brutal p-4">
          <div className="text-xs font-mono text-accent-grey uppercase">Total Laporan</div>
          <div className="text-3xl font-bold mt-2">{stats.total}</div>
        </div>
        <div className="bg-white border-2 border-border-color shadow-brutal p-4">
          <div className="text-xs font-mono text-accent-grey uppercase">Menunggu Review</div>
          <div className="text-3xl font-bold mt-2 text-yellow-700">{stats.pending}</div>
        </div>
        <div className="bg-white border-2 border-border-color shadow-brutal p-4">
          <div className="text-xs font-mono text-accent-grey uppercase">Disetujui</div>
          <div className="text-3xl font-bold mt-2 text-accent-green">{stats.approved}</div>
        </div>
      </div>

      <div className="bg-white border-2 border-border-color shadow-brutal mb-8">
        <div className="p-4 border-b-2 border-border-color flex flex-col md:flex-row justify-between items-center bg-surface gap-4">
          <h3 className="font-bold uppercase tracking-tight text-lg">Log Pengiriman Petugas</h3>
          <div className="flex space-x-2 w-full md:w-auto">
            <div className="flex border-2 border-border-color bg-white px-3 py-1 items-center flex-1 md:flex-none">
              <Search size={16} className="text-accent-grey mr-2" />
              <input
                type="text"
                placeholder="CARI PETUGAS / KOMODITAS"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="outline-none text-sm font-mono w-full md:w-56 uppercase placeholder-accent-grey"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border-2 border-border-color bg-white px-3 py-1 font-mono text-sm uppercase font-bold"
            >
              {['SEMUA', 'SUBMITTED', 'REVIEWED', 'APPROVED', 'REJECTED'].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
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
                <th className="p-4 font-bold">Petugas</th>
                <th className="p-4 font-bold">Komoditas / Lokasi</th>
                <th className="p-4 font-bold">GPS</th>
                <th className="p-4 font-bold">Status</th>
                <th className="p-4 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {reports.length === 0 && !loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-accent-grey">Belum ada laporan petugas.</td>
                </tr>
              ) : (
                reports.map((report, index) => (
                  <tr key={report.id} className={`border-b border-border-color relative ${index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}>
                    <td className="absolute left-0 top-0 bottom-0 w-1 bg-transparent hover:bg-foreground"></td>
                    <td className="p-4">
                      <div className="font-bold">{report.petugasName}</div>
                      <div className="text-xs text-accent-grey">{report.petugasCode} • {report.petugasEmail || 'tanpa email'}</div>
                      <div className="text-xs text-accent-grey mt-1">{new Date(report.createdAt).toLocaleString('id-ID')}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold">{report.commodityName}</div>
                      <div className="text-xs text-accent-grey">{report.market}</div>
                      <div className="text-xs font-bold mt-1">Rp {report.price.toLocaleString('id-ID')}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center font-bold text-xs mb-1">
                        <MapPin size={14} className="mr-1 text-accent-red" />
                        {report.locationLabel}
                      </div>
                      <div className="text-xs text-accent-grey">{report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}</div>
                      <a
                        href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-foreground underline mt-1 inline-block"
                      >
                        Buka peta
                      </a>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-bold border ${statusChip(report.status)}`}>
                        {report.status === 'APPROVED' && <CheckCircle2 size={12} className="mr-1" />}
                        {report.status === 'REVIEWED' && <ShieldCheck size={12} className="mr-1" />}
                        {report.status === 'REJECTED' && <XCircle size={12} className="mr-1" />}
                        {report.status === 'SUBMITTED' && <ShieldAlert size={12} className="mr-1" />}
                        {report.status}
                      </span>
                      {report.reviewedAt && <div className="text-xs text-accent-grey mt-2">Review: {new Date(report.reviewedAt).toLocaleString('id-ID')}</div>}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button disabled={actionLoading === report.id} onClick={() => updateStatus(report.id, 'REVIEWED')} className="px-2 py-1 border border-blue-600 text-blue-700 hover:bg-blue-50 font-bold text-xs uppercase disabled:opacity-50">Review</button>
                      <button disabled={actionLoading === report.id} onClick={() => updateStatus(report.id, 'APPROVED')} className="px-2 py-1 border border-accent-green text-accent-green hover:bg-green-50 font-bold text-xs uppercase disabled:opacity-50">Approve</button>
                      <button disabled={actionLoading === report.id} onClick={() => updateStatus(report.id, 'REJECTED')} className="px-2 py-1 border border-accent-red text-accent-red hover:bg-red-50 font-bold text-xs uppercase disabled:opacity-50">Reject</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}