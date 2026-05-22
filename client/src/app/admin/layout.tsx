"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Database, Settings, Users, ClipboardList } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/admin" && pathname !== "/admin") return false;
    return pathname.startsWith(path);
  };

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
          <Link 
            href="/admin" 
            className={`flex items-center px-6 py-3 font-mono text-sm uppercase transition-colors ${
              pathname === "/admin" 
                ? "bg-surface border-r-4 border-accent-red text-foreground font-bold" 
                : "hover:bg-surface text-accent-grey hover:text-foreground"
            }`}
          >
            <Database size={18} className="mr-3" />
            Manajemen Data
          </Link>
          <Link 
            href="/admin/users" 
            className={`flex items-center px-6 py-3 font-mono text-sm uppercase transition-colors ${
              isActive("/admin/users") 
                ? "bg-surface border-r-4 border-accent-red text-foreground font-bold" 
                : "hover:bg-surface text-accent-grey hover:text-foreground"
            }`}
          >
            <Users size={18} className="mr-3" />
            Pengguna & Akses
          </Link>
          <Link 
            href="/admin/petugas" 
            className={`flex items-center px-6 py-3 font-mono text-sm uppercase transition-colors ${
              isActive("/admin/petugas") 
                ? "bg-surface border-r-4 border-accent-red text-foreground font-bold" 
                : "hover:bg-surface text-accent-grey hover:text-foreground"
            }`}
          >
            <ClipboardList size={18} className="mr-3" />
            Laporan Petugas
          </Link>
          <Link 
            href="/admin/settings" 
            className={`flex items-center px-6 py-3 font-mono text-sm uppercase transition-colors ${
              isActive("/admin/settings") 
                ? "bg-surface border-r-4 border-accent-red text-foreground font-bold" 
                : "hover:bg-surface text-accent-grey hover:text-foreground"
            }`}
          >
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
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Admin */}
        <header className="bg-background border-b-2 border-border-color px-8 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-2xl font-bold uppercase tracking-tight">
            {pathname === "/admin" && "Manajemen Data Harga"}
            {pathname === "/admin/users" && "Pengguna & Akses"}
            {pathname === "/admin/petugas" && "Laporan Petugas Lapangan"}
            {pathname === "/admin/settings" && "Konfigurasi Sistem"}
          </h2>
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
          {children}
        </div>
      </main>
    </div>
  );
}
