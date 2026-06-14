"use client";

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, BarChart3, CheckCircle, Clock3, Database, Layers3 } from 'lucide-react';
import { API_BASE } from '@/lib/api-config';

type AggregationRun = {
  id: string;
  runAt: string;
  scanned: number;
  groups: number;
  created: number;
  skipped: number;
  details?: Record<string, unknown>[] | null;
  createdAt?: string;
};

type AggregationRunDetailItem = {
  key?: string;
  count?: number;
  created?: boolean;
};

export default function AggregationRunDetail() {
  const params = useParams();
  const id = params?.id as string;
  const [run, setRun] = useState<AggregationRun | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`${API_BASE}/admin/aggregations/${id}`)
      .then((r) => r.json())
      .then((data) => {
        if (data && data.success) setRun(data.data || null);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-4">Loading…</div>;
  if (!run) return <div className="p-4">Aggregation run not found.</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center px-3 py-1 border border-border-color bg-white font-mono text-xs uppercase tracking-[0.2em] text-accent-grey mb-3">
            <BarChart3 size={14} className="mr-2" /> Aggregation Detail
          </div>
          <h1 className="text-3xl font-bold uppercase tracking-tight">Aggregation Run Detail</h1>
          <p className="text-sm font-mono text-accent-grey mt-2">Ringkasan grup, jumlah laporan, dan hasil pembuatan harga.</p>
        </div>
        <a
          href="/admin/aggregations"
          className="inline-flex items-center bg-foreground text-background font-mono font-bold uppercase px-5 py-3 text-sm hover:bg-accent-red transition-colors shadow-brutal active:translate-y-1 active:shadow-none"
        >
          <ArrowLeft size={16} className="mr-2" />
          Kembali
        </a>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white border-2 border-border-color p-5 shadow-brutal">
          <div className="text-xs font-mono text-accent-grey uppercase mb-2 flex items-center"><Clock3 size={14} className="mr-2" /> Run At</div>
          <div className="font-mono font-bold text-lg leading-tight">{new Date(run.runAt).toLocaleString()}</div>
        </div>
        <div className="bg-white border-2 border-border-color p-5 shadow-brutal">
          <div className="text-xs font-mono text-accent-grey uppercase mb-2 flex items-center"><Database size={14} className="mr-2" /> Scanned</div>
          <div className="font-mono font-bold text-4xl">{run.scanned}</div>
        </div>
        <div className="bg-white border-2 border-border-color p-5 shadow-brutal">
          <div className="text-xs font-mono text-accent-grey uppercase mb-2 flex items-center"><Layers3 size={14} className="mr-2" /> Groups</div>
          <div className="font-mono font-bold text-4xl">{run.groups}</div>
        </div>
        <div className="bg-white border-2 border-border-color p-5 shadow-brutal">
          <div className="text-xs font-mono text-accent-grey uppercase mb-2 flex items-center"><CheckCircle size={14} className="mr-2" /> Result</div>
          <div className="font-mono font-bold text-4xl text-accent-green">{run.created}</div>
          <div className="text-xs font-mono text-accent-grey mt-2">created / {run.skipped} skipped</div>
        </div>
      </div>

      <div className="bg-white border-2 border-border-color shadow-brutal overflow-hidden">
        <div className="p-4 border-b-2 border-border-color bg-surface flex items-center justify-between">
          <div>
            <h2 className="font-bold uppercase tracking-tight text-lg">Detail Grup</h2>
            <p className="text-xs font-mono text-accent-grey mt-1">Setiap baris mewakili grup agregasi per komoditas dan pasar.</p>
          </div>
          <div className="text-xs font-mono text-accent-grey uppercase border border-border-color bg-white px-3 py-1">
            {run.id.slice(0, 8).toUpperCase()}
          </div>
        </div>

        <div className="p-6">
          {run.details && run.details.length > 0 ? (
            <div className="space-y-3">
              {run.details.map((d: AggregationRunDetailItem, idx: number) => (
                <div key={idx} className="p-4 border-2 border-border-color bg-[#FAFAFA] hover:bg-surface transition-colors">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-sm">
                    <div>
                      <div className="text-xs text-accent-grey uppercase mb-1">Key</div>
                      <div className="font-bold break-all">{String(d.key || '')}</div>
                    </div>
                    <div>
                      <div className="text-xs text-accent-grey uppercase mb-1">Count</div>
                      <div className="font-bold">{String(d.count ?? '')}</div>
                    </div>
                    <div>
                      <div className="text-xs text-accent-grey uppercase mb-1">Created</div>
                      <div className="font-bold">{String(d.created ?? '')}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-accent-grey font-mono">Tidak ada detail agregasi.</div>
          )}
        </div>
      </div>
    </div>
  );
}
