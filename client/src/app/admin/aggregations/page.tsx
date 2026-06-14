"use client";

import React, { useEffect, useState } from 'react';
import { RefreshCw, ChevronRight, BarChart3, Clock3, Database, Layers3, PlayCircle, Search } from 'lucide-react';
import { AdminTableCard } from '@/components/admin/AdminTableCard';
import { API_BASE } from '@/lib/api-config';

type AggregationRun = {
  id: string;
  runAt: string;
  scanned: number;
  groups: number;
  created: number;
  skipped: number;
  details?: Record<string, unknown> | null;
};

type AggregationDetailItem = {
  key?: string;
  count?: number;
  created?: boolean;
};

type CommoditySummary = {
  commodity: string;
  market: string;
  reports: number;
  created: number;
  skipped: number;
};

type FilterMode = 'ALL' | 'CREATED' | 'SKIPPED' | 'MIXED';

export default function AdminAggregationsPage() {
  const [runs, setRuns] = useState<AggregationRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [manualRunning, setManualRunning] = useState(false);
  const [filterMode, setFilterMode] = useState<FilterMode>('ALL');
  const [runsPage, setRunsPage] = useState(1);
  const RUNS_PER_PAGE = 5;

  const loadRuns = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/aggregations`);
      const data = await res.json();
      if (data && data.success) setRuns(data.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRuns();
  }, []);

  const latestRun = runs[0];

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadRuns();
    } finally {
      setRefreshing(false);
    }
  };

  const handleRunManual = async () => {
    setManualRunning(true);
    try {
      const response = await fetch(`${API_BASE}/admin/field-reports/aggregate`, {
        method: 'POST',
      });

      const payload = await response.json();
      if (!payload?.success) {
        throw new Error(payload?.message || 'Gagal menjalankan agregasi manual');
      }

      await loadRuns();
    } catch (error) {
      console.error(error);
    } finally {
      setManualRunning(false);
    }
  };

  const filteredRuns = runs.filter((run) => {
    if (filterMode === 'CREATED') return run.created > 0;
    if (filterMode === 'SKIPPED') return run.created === 0 && run.skipped > 0;
    if (filterMode === 'MIXED') return run.created > 0 && run.skipped > 0;
    return true;
  });

  const runsTotalPages = Math.max(1, Math.ceil(filteredRuns.length / RUNS_PER_PAGE));
  const paginatedRuns = filteredRuns.slice((runsPage - 1) * RUNS_PER_PAGE, runsPage * RUNS_PER_PAGE);

  return (
    <div className="space-y-8">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-4">
        <div>
          <div className="inline-flex items-center px-3 py-1 border border-border-color bg-white font-mono text-xs uppercase tracking-[0.2em] text-accent-grey mb-3">
            <BarChart3 size={14} className="mr-2" /> Monitoring
          </div>
          <h1 className="text-3xl font-bold uppercase tracking-tight">Aggregation Runs</h1>
          <p className="text-sm font-mono text-accent-grey mt-2 max-w-2xl">
            Riwayat proses agregasi laporan petugas untuk membentuk data harga yang dipakai dashboard dan ML.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleRunManual}
            className="inline-flex items-center justify-center bg-foreground text-background font-mono font-bold uppercase px-5 py-3 text-sm hover:bg-accent-red transition-colors shadow-brutal active:translate-y-1 active:shadow-none"
          >
            <PlayCircle size={16} className={`mr-2 ${manualRunning ? 'animate-pulse' : ''}`} />
            {manualRunning ? 'Menjalankan...' : 'Run Manual'}
          </button>
          <button
            onClick={handleRefresh}
            className="inline-flex items-center justify-center bg-white border-2 border-border-color text-foreground font-mono font-bold uppercase px-5 py-3 text-sm hover:bg-surface transition-colors shadow-brutal active:translate-y-1 active:shadow-none"
          >
            <RefreshCw size={16} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Menyegarkan' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border-2 border-border-color p-5 shadow-brutal hover:-translate-y-1 transition-transform">
          <div className="text-xs font-mono text-accent-grey uppercase mb-2 flex items-center">
            <Layers3 size={14} className="mr-2" /> Total Run
          </div>
          <div className="text-4xl font-mono font-bold">{runs.length}</div>
          <div className="mt-2 text-xs font-mono font-bold text-accent-green">Tersimpan di AggregationRun</div>
        </div>
        <div className="bg-white border-2 border-border-color p-5 shadow-brutal hover:-translate-y-1 transition-transform">
          <div className="text-xs font-mono text-accent-grey uppercase mb-2 flex items-center">
            <Database size={14} className="mr-2" /> Terbaru Scanned
          </div>
          <div className="text-4xl font-mono font-bold">{latestRun ? latestRun.scanned : 0}</div>
          <div className="mt-2 text-xs font-mono font-bold text-accent-green">Laporan diproses</div>
        </div>
        <div className="bg-white border-2 border-border-color p-5 shadow-brutal hover:-translate-y-1 transition-transform">
          <div className="text-xs font-mono text-accent-grey uppercase mb-2 flex items-center">
            <Clock3 size={14} className="mr-2" /> Run Terbaru
          </div>
          <div className="text-lg font-mono font-bold leading-tight">
            {latestRun ? new Date(latestRun.runAt).toLocaleString() : '-'}
          </div>
          <div className="mt-2 text-xs font-mono font-bold text-accent-green">Waktu eksekusi terakhir</div>
        </div>
        <div className="bg-white border-2 border-border-color p-5 shadow-brutal hover:-translate-y-1 transition-transform">
          <div className="text-xs font-mono text-accent-grey uppercase mb-2 flex items-center">
            <Search size={14} className="mr-2" /> Status
          </div>
          <div className="text-3xl font-mono font-bold">{runs.length > 0 ? 'AKTIF' : 'KOSONG'}</div>
          <div className="mt-2 text-xs font-mono font-bold text-accent-green">Endpoint & scheduler tersedia</div>
        </div>
      </div>

      <AdminTableCard
        title="Filter Status"
        description="Saring riwayat berdasarkan hasil agregasi."
        actions={
          <div className="flex flex-wrap gap-2">
            {([
              ['ALL', 'Semua'],
              ['CREATED', 'Ada hasil'],
              ['SKIPPED', 'Semua dilewati'],
              ['MIXED', 'Campuran'],
            ] as Array<[FilterMode, string]>).map(([value, label]) => (
              <button
                key={value}
                onClick={() => { setFilterMode(value); setRunsPage(1); }}
                className={`px-3 py-2 font-mono text-xs uppercase border-2 transition-colors ${
                  filterMode === value
                    ? 'bg-foreground text-white border-foreground'
                    : 'bg-white text-foreground border-border-color hover:bg-surface'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        }
      >
        <div className="p-0" />
      </AdminTableCard>

      {latestRun && (
        <div className="bg-white border-2 border-border-color shadow-brutal overflow-hidden">
          <div className="p-4 border-b-2 border-border-color bg-surface flex items-center justify-between">
            <div>
              <h3 className="font-bold uppercase tracking-tight text-lg">Ringkasan Komoditas Terbaru</h3>
              <p className="text-xs font-mono text-accent-grey mt-1">Detail ringkas dari run terakhir berdasarkan komoditas dan pasar.</p>
            </div>
            <div className="text-xs font-mono text-accent-grey uppercase border border-border-color bg-white px-3 py-1">
              {new Date(latestRun.runAt).toLocaleDateString('id-ID')}
            </div>
          </div>
          <div className="p-6">
            {(() => {
              const details = (Array.isArray(latestRun.details) ? latestRun.details : []) as AggregationDetailItem[];
              const summaries = details.reduce<Record<string, CommoditySummary>>((acc, item) => {
                const keyParts = String(item.key || '').split('||');
                const commodity = keyParts[0] || 'Tidak diketahui';
                const market = keyParts[1] || 'Tidak diketahui';
                const summaryKey = `${commodity}__${market}`;

                if (!acc[summaryKey]) {
                  acc[summaryKey] = {
                    commodity,
                    market,
                    reports: 0,
                    created: 0,
                    skipped: 0,
                  };
                }

                acc[summaryKey].reports += Number(item.count || 0);
                acc[summaryKey].created += item.created ? 1 : 0;
                acc[summaryKey].skipped += item.created ? 0 : 1;
                return acc;
              }, {});

              const summaryList = Object.values(summaries);

              if (summaryList.length === 0) {
                return <div className="text-center p-8 text-accent-grey font-mono">Belum ada ringkasan komoditas.</div>;
              }

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {summaryList.map((summary) => (
                    <div key={`${summary.commodity}-${summary.market}`} className="border-2 border-border-color bg-[#FAFAFA] p-4 hover:bg-surface transition-colors">
                      <div className="font-bold uppercase tracking-tight text-sm">{summary.commodity}</div>
                      <div className="text-xs font-mono text-accent-grey mt-1">{summary.market}</div>
                      <div className="mt-4 grid grid-cols-3 gap-2 text-center font-mono text-xs">
                        <div className="border border-border-color bg-white p-2">
                          <div className="text-accent-grey uppercase mb-1">Laporan</div>
                          <div className="font-bold text-base">{summary.reports}</div>
                        </div>
                        <div className="border border-border-color bg-white p-2">
                          <div className="text-accent-grey uppercase mb-1">Created</div>
                          <div className="font-bold text-base text-accent-green">{summary.created}</div>
                        </div>
                        <div className="border border-border-color bg-white p-2">
                          <div className="text-accent-grey uppercase mb-1">Skipped</div>
                          <div className="font-bold text-base text-accent-red">{summary.skipped}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      <AdminTableCard
        title="Riwayat Aggregation"
        description="Klik detail untuk melihat isi grup dan hasil agregasi."
        actions={
          <span className="inline-flex items-center px-3 py-1 border border-border-color bg-white text-xs font-mono uppercase text-accent-grey">
            <ChevronRight size={14} className="mr-2" /> /api/admin/aggregations
          </span>
        }
        loading={loading}
        loadingLabel="Memuat riwayat"
        empty={!loading && filteredRuns.length === 0}
        emptyMessage="No aggregation runs found."
        footer={
          <div className="flex justify-between items-center font-mono text-xs md:text-sm gap-3 flex-col md:flex-row">
            <div>
              Menampilkan {filteredRuns.length > 0 ? ((runsPage - 1) * RUNS_PER_PAGE) + 1 : 0}–{Math.min(runsPage * RUNS_PER_PAGE, filteredRuns.length)} dari {filteredRuns.length} data
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setRunsPage((p) => Math.max(1, p - 1))}
                disabled={runsPage === 1}
                className="px-3 py-1 border border-border-color bg-white hover:bg-foreground hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-foreground transition-colors uppercase font-bold"
              >
                &lt; PREV
              </button>

              {Array.from({ length: Math.min(3, runsTotalPages) }, (_, i) => {
                let pageNum = runsPage;
                if (runsPage === 1) pageNum = i + 1;
                else if (runsPage === runsTotalPages) pageNum = runsTotalPages - 2 + i;
                else pageNum = runsPage - 1 + i;

                if (pageNum < 1 || pageNum > runsTotalPages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() => setRunsPage(pageNum)}
                    className={`px-3 py-1 border font-bold transition-colors ${
                      pageNum === runsPage
                        ? 'border-foreground bg-foreground text-white'
                        : 'border-border-color bg-white hover:bg-foreground hover:text-white'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setRunsPage((p) => Math.min(runsTotalPages, p + 1))}
                disabled={runsPage === runsTotalPages || runsTotalPages === 0}
                className="px-3 py-1 border border-border-color bg-white hover:bg-foreground hover:text-white disabled:opacity-50 disabled:hover:bg-white disabled:hover:text-foreground transition-colors uppercase font-bold"
              >
                NEXT &gt;
              </button>
            </div>
          </div>
        }
      >
        <div className="overflow-x-auto min-h-[220px] relative">
          {loading && (
            <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center">
              <div className="flex items-center font-mono font-bold uppercase tracking-wider text-xs">
                <RefreshCw size={18} className="mr-2 animate-spin" /> Memuat data
              </div>
            </div>
          )}

          <table className="w-full table-fixed text-left border-collapse">
            <thead>
              <tr className="bg-surface font-mono text-xs uppercase text-accent-grey border-b-2 border-border-color">
                <th className="p-3 font-bold w-[26%]">Waktu Run</th>
                <th className="p-3 font-bold w-[12%]">Scanned</th>
                <th className="p-3 font-bold w-[12%]">Groups</th>
                <th className="p-3 font-bold w-[12%]">Created</th>
                <th className="p-3 font-bold w-[12%]">Skipped</th>
                <th className="p-3 font-bold text-right w-[12%]">Aksi</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {!loading && filteredRuns.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-10 text-center text-accent-grey">
                    No aggregation runs found.
                  </td>
                </tr>
              ) : (
                paginatedRuns.map((r, idx) => (
                  <tr
                    key={r.id}
                    className={`border-b border-border-color border-l-4 border-transparent group hover:bg-surface hover:border-foreground transition-colors relative ${idx % 2 === 0 ? 'bg-white' : 'bg-[#FAFAFA]'}`}
                  >
                    <td className="p-3 font-bold align-top">
                      <div>{new Date(r.runAt).toLocaleString()}</div>
                      <div className="text-xs text-accent-grey mt-1">{r.id.slice(0, 8).toUpperCase()}</div>
                    </td>
                    <td className="p-3 align-top">{r.scanned}</td>
                    <td className="p-3 align-top">{r.groups}</td>
                    <td className="p-3 font-bold text-accent-green align-top">{r.created}</td>
                    <td className="p-3 font-bold text-accent-red align-top">{r.skipped}</td>
                    <td className="p-3 text-right align-top whitespace-nowrap">
                      <a
                        href={`/admin/aggregations/${r.id}`}
                        className="inline-flex items-center text-xs border-2 border-foreground px-3 py-1 font-bold hover:bg-foreground hover:text-white transition-colors"
                      >
                        DETAIL
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </AdminTableCard>
    </div>
  );
}
