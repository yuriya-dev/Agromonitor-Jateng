'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Loader2, MapPin, RefreshCw, Search, ShieldAlert, ShieldCheck, XCircle } from 'lucide-react';
import { AdminTableCard } from '@/components/admin/AdminTableCard';
import { API_BASE } from '@/lib/api-config';

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
  const [selectedReport, setSelectedReport] = useState<FieldReport | null>(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set('search', search);
      if (filterStatus && filterStatus !== 'SEMUA') query.set('status', filterStatus);
      query.set('limit', '50');

      const res = await fetch(`${API_BASE}/admin/field-reports?${query.toString()}`);
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
      const res = await fetch(`${API_BASE}/admin/field-reports/${reportId}`, {
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

      <AdminTableCard
        title="Log Pengiriman Petugas"
        description="Pantau kiriman tugas, koordinat GPS, dan status verifikasi admin."
        actions={
          <>
            <div className="flex border-2 border-border-color bg-white px-3 py-1.5 items-center w-full sm:w-[300px]">
              <Search size={16} className="text-accent-grey mr-2 shrink-0" />
              <input
                type="text"
                placeholder="CARI PETUGAS / KOMODITAS"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="outline-none text-sm font-mono w-full uppercase placeholder-accent-grey"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border-2 border-border-color bg-white px-3 py-1.5 font-mono text-xs uppercase font-bold"
            >
              {['SEMUA', 'SUBMITTED', 'REVIEWED', 'APPROVED', 'REJECTED'].map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </>
        }
        loading={loading}
        loadingLabel="Memuat laporan"
        empty={!loading && reports.length === 0}
        emptyMessage="Belum ada laporan petugas."
      >
        <div className="min-h-[240px] relative">
          {loading && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
              <Loader2 className="animate-spin text-foreground" size={28} />
            </div>
          )}

          <table className="w-full table-fixed text-left border-collapse">
            <thead>
              <tr className="bg-surface font-mono text-xs uppercase text-accent-grey border-b-2 border-border-color">
                <th className="p-2.5 font-bold w-[20%]">Petugas</th>
                <th className="p-2.5 font-bold w-[24%]">Komoditas / Lokasi</th>
                <th className="p-2.5 font-bold w-[28%]">GPS</th>
                <th className="p-2.5 font-bold w-[14%]">Status</th>
                <th className="p-2.5 font-bold text-right w-[14%]">Aksi</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {reports.length === 0 && !loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-accent-grey">Belum ada laporan petugas.</td>
                </tr>
              ) : (
                reports.map((report, index) => (
                  <tr key={report.id} className={`border-b border-border-color border-l-4 border-transparent hover:border-foreground hover:bg-surface transition-colors relative ${index % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}>
                    <td className="p-2.5 align-top">
                      <div className="font-bold text-sm leading-tight">{report.petugasName}</div>
                      <div className="text-[11px] text-accent-grey leading-tight mt-1 break-words">{report.petugasCode} • {report.petugasEmail || 'tanpa email'}</div>
                      <div className="text-[11px] text-accent-grey mt-1 whitespace-nowrap">{new Date(report.createdAt).toLocaleString('id-ID')}</div>
                    </td>
                    <td className="p-2.5 align-top">
                      <div className="font-bold text-sm leading-tight break-words">{report.commodityName}</div>
                      <div className="text-[11px] text-accent-grey leading-tight mt-1 break-words">{report.market}</div>
                      <div className="text-[11px] font-bold mt-1 whitespace-nowrap">Rp {report.price.toLocaleString('id-ID')}</div>
                    </td>
                    <td className="p-2.5 align-top">
                      <div className="flex items-center font-bold text-[11px] mb-1 leading-tight break-words">
                        <MapPin size={12} className="mr-1 text-accent-red shrink-0" />
                        {report.locationLabel}
                      </div>
                      <div className="text-[11px] text-accent-grey leading-tight whitespace-nowrap">{report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}</div>
                      <a
                        href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-foreground underline mt-1 inline-block"
                      >
                        Buka peta
                      </a>
                    </td>
                    <td className="p-2.5 align-top">
                      <span className={`inline-flex items-center px-2 py-1 text-[11px] font-bold border ${statusChip(report.status)}`}>
                        {report.status === 'APPROVED' && <CheckCircle2 size={11} className="mr-1" />}
                        {report.status === 'REVIEWED' && <ShieldCheck size={11} className="mr-1" />}
                        {report.status === 'REJECTED' && <XCircle size={11} className="mr-1" />}
                        {report.status === 'SUBMITTED' && <ShieldAlert size={11} className="mr-1" />}
                        {report.status}
                      </span>
                      {report.reviewedAt && <div className="text-[11px] text-accent-grey mt-1.5 leading-tight">Review: {new Date(report.reviewedAt).toLocaleString('id-ID')}</div>}
                    </td>
                    <td className="p-2.5 text-right align-top whitespace-nowrap">
                      <div className="inline-flex flex-wrap justify-end gap-1.5 max-w-full">
                        <button
                          onClick={() => setSelectedReport(report)}
                          className="px-2.5 py-1 border border-foreground text-foreground hover:bg-foreground hover:text-white font-bold text-[11px] uppercase"
                        >
                          Detail
                        </button>
                        <button disabled={actionLoading === report.id} onClick={() => updateStatus(report.id, 'REVIEWED')} className="px-2 py-1 border border-blue-600 text-blue-700 hover:bg-blue-50 font-bold text-[11px] uppercase disabled:opacity-50">R</button>
                        <button disabled={actionLoading === report.id} onClick={() => updateStatus(report.id, 'APPROVED')} className="px-2 py-1 border border-accent-green text-accent-green hover:bg-green-50 font-bold text-[11px] uppercase disabled:opacity-50">A</button>
                        <button disabled={actionLoading === report.id} onClick={() => updateStatus(report.id, 'REJECTED')} className="px-2 py-1 border border-accent-red text-accent-red hover:bg-red-50 font-bold text-[11px] uppercase disabled:opacity-50">X</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminTableCard>

      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-foreground shadow-brutal w-full max-w-4xl max-h-[90vh] overflow-y-auto relative">
            <div className="bg-foreground text-white p-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold font-mono uppercase">Detail Laporan Petugas</h3>
                <p className="text-xs font-mono text-white/80 mt-1">{selectedReport.petugasCode} • {selectedReport.petugasName}</p>
              </div>
              <button onClick={() => setSelectedReport(null)} className="hover:text-accent-red transition-colors">
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-sm">
                  <div className="border-2 border-border-color p-3 bg-surface">
                    <div className="text-xs uppercase text-accent-grey mb-1">Petugas</div>
                    <div className="font-bold">{selectedReport.petugasName}</div>
                    <div className="text-xs text-accent-grey mt-1">{selectedReport.petugasCode}</div>
                    <div className="text-xs text-accent-grey">{selectedReport.petugasEmail || 'tanpa email'}</div>
                  </div>
                  <div className="border-2 border-border-color p-3 bg-surface">
                    <div className="text-xs uppercase text-accent-grey mb-1">Komoditas & Pasar</div>
                    <div className="font-bold">{selectedReport.commodityName}</div>
                    <div className="text-xs text-accent-grey mt-1">{selectedReport.market}</div>
                    <div className="text-xs font-bold mt-1">Rp {selectedReport.price.toLocaleString('id-ID')}</div>
                  </div>
                  <div className="border-2 border-border-color p-3 bg-surface">
                    <div className="text-xs uppercase text-accent-grey mb-1">Waktu Laporan</div>
                    <div className="font-bold">{new Date(selectedReport.createdAt).toLocaleString('id-ID')}</div>
                    <div className="text-xs text-accent-grey mt-1">Tanggal data: {new Date(selectedReport.reportDate).toLocaleDateString('id-ID')}</div>
                  </div>
                  <div className="border-2 border-border-color p-3 bg-surface">
                    <div className="text-xs uppercase text-accent-grey mb-1">GPS</div>
                    <div className="font-bold">{selectedReport.latitude.toFixed(6)}, {selectedReport.longitude.toFixed(6)}</div>
                    <div className="text-xs text-accent-grey mt-1">Akurasi: {selectedReport.accuracy ? `${selectedReport.accuracy} m` : '-'}</div>
                    <a
                      href={`https://www.google.com/maps?q=${selectedReport.latitude},${selectedReport.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-foreground underline mt-1 inline-block"
                    >
                      Buka di Google Maps
                    </a>
                  </div>
                </div>

                <div className="border-2 border-border-color p-4">
                  <div className="text-xs uppercase text-accent-grey mb-2 font-mono">Catatan Petugas</div>
                  <div className="text-sm leading-relaxed font-mono">
                    {selectedReport.notes || 'Tidak ada catatan.'}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="border-2 border-border-color p-3 bg-surface">
                  <div className="text-xs uppercase text-accent-grey mb-2 font-mono">Status</div>
                  <span className={`inline-flex items-center px-2 py-1 text-[11px] font-bold border ${statusChip(selectedReport.status)}`}>
                    {selectedReport.status === 'APPROVED' && <CheckCircle2 size={11} className="mr-1" />}
                    {selectedReport.status === 'REVIEWED' && <ShieldCheck size={11} className="mr-1" />}
                    {selectedReport.status === 'REJECTED' && <XCircle size={11} className="mr-1" />}
                    {selectedReport.status === 'SUBMITTED' && <ShieldAlert size={11} className="mr-1" />}
                    {selectedReport.status}
                  </span>
                  {selectedReport.reviewedAt && (
                    <div className="text-xs text-accent-grey mt-2">
                      Review: {new Date(selectedReport.reviewedAt).toLocaleString('id-ID')}
                    </div>
                  )}
                </div>

                <div className="border-2 border-border-color p-3">
                  <div className="text-xs uppercase text-accent-grey mb-2 font-mono">Foto Bukti</div>
                  {selectedReport.photoUrl ? (
                    <a href={selectedReport.photoUrl} target="_blank" rel="noreferrer" className="block">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={selectedReport.photoUrl}
                        alt={`Bukti laporan ${selectedReport.petugasCode}`}
                        className="w-full max-h-[360px] object-cover border-2 border-border-color"
                      />
                      <div className="text-xs text-foreground underline mt-2 font-mono">Buka foto ukuran penuh</div>
                    </a>
                  ) : (
                    <div className="text-sm text-accent-grey font-mono">Tidak ada foto bukti.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t-2 border-border-color bg-surface flex justify-end">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 bg-foreground text-white font-mono font-bold hover:bg-black transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}