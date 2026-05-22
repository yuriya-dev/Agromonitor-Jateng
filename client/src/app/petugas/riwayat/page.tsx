'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, BadgeAlert, BadgeCheck, BadgeMinus, ChevronRight, History, LogOut, Menu, User2 } from 'lucide-react';
import { loadSurveyHistory, petugasProfile, type SurveyHistoryItem } from '../_lib/petugas';

export default function PetugasRiwayatPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [surveyHistory, setSurveyHistory] = useState<SurveyHistoryItem[]>([]);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, []);

  useEffect(() => {
    const run = async () => {
      setHistoryLoading(true);
      try {
        const items = await loadSurveyHistory(petugasProfile.code);
        setSurveyHistory(items);
      } catch {
        setSurveyHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    run();
  }, []);

  const historyIcon = (status: SurveyHistoryItem['status']) => {
    if (status === 'APPROVED') return <BadgeCheck size={14} className="text-accent-green" />;
    if (status === 'REJECTED') return <BadgeAlert size={14} className="text-accent-red" />;
    return <BadgeMinus size={14} className="text-accent-grey" />;
  };

  const historyBadgeClass = (status: SurveyHistoryItem['status']) => {
    if (status === 'APPROVED') return 'bg-green-100 text-accent-green border-accent-green';
    if (status === 'REJECTED') return 'bg-red-100 text-accent-red border-accent-red';
    if (status === 'REVIEWED') return 'bg-yellow-100 text-yellow-700 border-yellow-700';
    return 'bg-surface text-accent-grey border-border-color';
  };

  return (
    <main className="min-h-screen bg-surface font-sans flex flex-col items-center">
      <div className="w-full max-w-md min-h-screen bg-white border-x-2 border-border-color shadow-brutal flex flex-col relative">
        <header className="bg-background border-b-2 border-border-color p-4 sticky top-0 z-50 flex justify-between items-center relative">
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase flex items-center">
              AGRO<span className="text-accent-red">ENTRY</span>
            </h1>
            <p className="text-[10px] font-mono text-accent-grey uppercase tracking-widest mt-1">Riwayat Survei</p>
          </div>
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="p-2 border-2 border-border-color bg-surface hover:bg-foreground hover:text-white transition-colors active:translate-y-1"
              aria-label="Buka menu petugas"
            >
              <Menu size={16} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white border-2 border-border-color shadow-brutal z-50 overflow-hidden">
                <div className="bg-surface p-3 border-b-2 border-border-color">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-foreground text-white flex items-center justify-center border-2 border-border-color">
                      <User2 size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-bold uppercase">{petugasProfile.name}</div>
                      <div className="text-[10px] font-mono text-accent-grey uppercase">{petugasProfile.code}</div>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <Link href="/petugas" className="w-full flex items-center justify-between px-3 py-3 border-2 border-transparent hover:border-border-color hover:bg-surface text-left transition-colors" onClick={() => setMenuOpen(false)}>
                    <span className="text-sm font-bold uppercase flex items-center gap-2">
                      <ArrowLeft size={14} /> Input Laporan
                    </span>
                    <ChevronRight size={16} />
                  </Link>
                  <Link href="/petugas/profile" className="w-full flex items-center justify-between px-3 py-3 border-2 border-transparent hover:border-border-color hover:bg-surface text-left transition-colors" onClick={() => setMenuOpen(false)}>
                    <span className="text-sm font-bold uppercase flex items-center gap-2">
                      <User2 size={14} /> Profil Petugas
                    </span>
                    <ChevronRight size={16} />
                  </Link>
                  <Link href="/login" className="w-full flex items-center justify-between px-3 py-3 border-2 border-transparent hover:border-border-color hover:bg-surface text-left transition-colors">
                    <span className="text-sm font-bold uppercase flex items-center gap-2">
                      <LogOut size={14} /> Keluar
                    </span>
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="p-6 flex-1 space-y-5">
          <section className="bg-white border-2 border-border-color shadow-brutal p-4">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-foreground text-white flex items-center justify-center border-2 border-border-color shrink-0">
                <History size={20} />
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-mono text-accent-grey uppercase">Riwayat Survei</div>
                <h2 className="text-xl font-bold uppercase mt-1">{petugasProfile.name}</h2>
                <p className="text-xs font-mono text-accent-grey mt-1">{petugasProfile.code} • {petugasProfile.email}</p>
              </div>
            </div>
          </section>

          <section className="flex items-center justify-between text-[10px] font-mono uppercase border-2 border-border-color bg-surface px-3 py-2">
            <span>Total {historyLoading ? '...' : surveyHistory.length} laporan</span>
            <span>{historyLoading ? 'Memuat' : 'Terbaru di atas'}</span>
          </section>

          <section className="space-y-3 pb-10">
            {historyLoading ? (
              <div className="border-2 border-border-color bg-white p-4 text-xs font-mono uppercase text-accent-grey">Memuat riwayat survei...</div>
            ) : surveyHistory.length === 0 ? (
              <div className="border-2 border-border-color bg-white p-4 text-xs font-mono uppercase text-accent-grey">Belum ada riwayat survei untuk petugas ini.</div>
            ) : (
              surveyHistory.map((item) => (
                <article key={item.id} className="border-2 border-border-color bg-white shadow-brutal p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-bold uppercase">{item.commodityName}</div>
                      <div className="text-[11px] font-mono text-accent-grey uppercase mt-1">{item.market}</div>
                    </div>
                    <div className={`inline-flex items-center gap-1 text-[10px] font-mono font-bold uppercase border-2 px-2 py-1 ${historyBadgeClass(item.status)}`}>
                      {historyIcon(item.status)} {item.status}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4 text-[11px] font-mono uppercase">
                    <div className="border-2 border-border-color bg-surface p-2">
                      <div className="text-accent-grey">Harga</div>
                      <div className="font-bold text-sm normal-case">Rp {item.price.toLocaleString('id-ID')}</div>
                    </div>
                    <div className="border-2 border-border-color bg-surface p-2">
                      <div className="text-accent-grey">Tanggal</div>
                      <div className="font-bold text-sm normal-case">{item.reportDate}</div>
                    </div>
                  </div>

                  <div className="mt-3 text-[10px] font-mono text-accent-grey uppercase flex items-center justify-between">
                    <span>Dibuat: {item.createdAt}</span>
                    <span>{item.photoUrl ? 'Ada foto' : 'Tanpa foto'}</span>
                  </div>
                </article>
              ))
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
