'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ChevronRight, LogOut, Menu, Package, User2 } from 'lucide-react';
import { petugasProfile } from '../_lib/petugas';

export default function PetugasProfilePage() {
  const [menuOpen, setMenuOpen] = useState(false);
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

  return (
    <main className="min-h-screen bg-surface font-sans flex flex-col items-center">
      <div className="w-full max-w-md min-h-screen bg-white border-x-2 border-border-color shadow-brutal flex flex-col relative">
        <header className="bg-background border-b-2 border-border-color p-4 sticky top-0 z-50 flex justify-between items-center relative">
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase flex items-center">
              AGRO<span className="text-accent-red">ENTRY</span>
            </h1>
            <p className="text-[10px] font-mono text-accent-grey uppercase tracking-widest mt-1">Profil Petugas</p>
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
                  <Link href="/petugas/riwayat" className="w-full flex items-center justify-between px-3 py-3 border-2 border-transparent hover:border-border-color hover:bg-surface text-left transition-colors" onClick={() => setMenuOpen(false)}>
                    <span className="text-sm font-bold uppercase flex items-center gap-2">
                      <Package size={14} /> Riwayat Survei
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

        <div className="p-6 flex-1 space-y-6">
          <section className="bg-white border-2 border-border-color shadow-brutal p-4">
            <div className="text-[10px] font-mono text-accent-grey uppercase">Profil Terdaftar</div>
            <div className="mt-3 flex items-start gap-4">
              <div className="w-14 h-14 bg-foreground text-white flex items-center justify-center border-2 border-border-color shrink-0">
                <User2 size={24} />
              </div>
              <div className="flex-1">
                <div className="text-xl font-bold uppercase leading-tight">{petugasProfile.name}</div>
                <div className="text-xs font-mono uppercase text-accent-grey mt-1">{petugasProfile.code}</div>
                <div className="text-xs font-mono text-accent-grey mt-1 break-all">{petugasProfile.email}</div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-3">
            <div className="bg-white border-2 border-border-color shadow-brutal p-4">
              <div className="text-[10px] font-mono text-accent-grey uppercase">Peran</div>
              <div className="mt-2 text-lg font-bold uppercase">Petugas</div>
            </div>
            <div className="bg-white border-2 border-border-color shadow-brutal p-4">
              <div className="text-[10px] font-mono text-accent-grey uppercase">Status</div>
              <div className="mt-2 text-lg font-bold uppercase text-accent-green">Aktif</div>
            </div>
          </section>

          <section className="bg-surface border-2 border-border-color shadow-brutal p-4">
            <h2 className="text-sm font-bold uppercase tracking-tight">Akses Cepat</h2>
            <div className="mt-3 space-y-2">
              <Link href="/petugas" className="block border-2 border-border-color bg-white px-3 py-3 text-sm font-bold uppercase hover:bg-foreground hover:text-white transition-colors">
                Kembali ke Input Laporan
              </Link>
              <Link href="/petugas/riwayat" className="block border-2 border-border-color bg-white px-3 py-3 text-sm font-bold uppercase hover:bg-foreground hover:text-white transition-colors">
                Buka Riwayat Survei
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
