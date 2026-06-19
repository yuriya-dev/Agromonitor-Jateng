"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BarChart2, 
  Settings, 
  FileText
} from "lucide-react";

export default function AnalisLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/analis" && pathname !== "/analis") return false;
    return pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-surface flex text-foreground font-sans">
      {/* Sidebar Analis */}
      <aside className="w-64 bg-background border-r-2 border-border-color flex flex-col hidden md:flex">
        <div className="p-6 border-b-2 border-border-color">
          <h1 className="text-xl font-bold tracking-tight uppercase flex items-center">
            AGROMONITOR<span className="text-accent-green ml-2">ANALYTICS</span>
          </h1>
          <p className="text-xs font-mono text-accent-grey mt-2 uppercase tracking-widest">
            Data Science Portal
          </p>
        </div>
        
        <nav className="flex-1 py-6 space-y-1">
          <Link 
            href="/analis" 
            className={`flex items-center px-6 py-3 font-mono text-sm uppercase transition-colors ${
              pathname === "/analis" 
                ? "bg-surface border-r-4 border-accent-green text-foreground font-bold" 
                : "hover:bg-surface text-accent-grey hover:text-foreground"
            }`}
          >
            <BarChart2 size={18} className="mr-3" />
            Dashboard Analitik
          </Link>
          <Link 
            href="/analis/arima" 
            className={`flex items-center px-6 py-3 font-mono text-sm uppercase transition-colors ${
              isActive("/analis/arima") 
                ? "bg-surface border-r-4 border-accent-green text-foreground font-bold" 
                : "hover:bg-surface text-accent-grey hover:text-foreground"
            }`}
          >
            <Settings size={18} className="mr-3" />
            Konfigurasi ML (ARIMA)
          </Link>

          <Link 
            href="/analis/laporan" 
            className={`flex items-center px-6 py-3 font-mono text-sm uppercase transition-colors border-t border-border-color mt-4 pt-4 ${
              isActive("/analis/laporan") 
                ? "bg-surface border-r-4 border-accent-green text-foreground font-bold" 
                : "hover:bg-surface text-accent-grey hover:text-foreground"
            }`}
          >
            <FileText size={18} className="mr-3" />
            Ekspor Laporan
          </Link>
          <Link href="/" className="flex items-center px-6 py-3 mt-8 hover:bg-surface text-accent-grey hover:text-foreground font-mono text-sm uppercase transition-colors border-t border-border-color pt-6">
            Kembali ke Publik
          </Link>
        </nav>
        
        <div className="p-6 border-t-2 border-border-color">
          <div className="text-xs font-mono font-bold uppercase">Role Akses:</div>
          <div className="flex items-center mt-2 text-foreground font-mono text-sm font-bold">
            DATA_SCIENTIST
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header Analis */}
        <header className="bg-background border-b-2 border-border-color px-8 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-2xl font-bold uppercase tracking-tight">
            {pathname === "/analis" && "Advanced Analytics & Prediction"}
            {pathname === "/analis/arima" && "Konfigurasi Model ARIMA"}
            {pathname === "/analis/laporan" && "Ekspor Laporan Analitik"}
          </h2>
          <div className="flex items-center space-x-4">
            <Link href="/analis/laporan" className="bg-foreground text-background font-mono font-bold uppercase px-4 py-2 text-sm hover:bg-accent-green hover:shadow-brutal transition-all active:translate-y-1 active:shadow-none">
              Generate Report
            </Link>
            <Link href="/login" className="border-2 border-border-color bg-surface text-foreground font-mono font-bold uppercase px-4 py-2 text-sm hover:bg-white transition-colors shadow-brutal active:translate-y-1 active:shadow-none">
              Logout
            </Link>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
