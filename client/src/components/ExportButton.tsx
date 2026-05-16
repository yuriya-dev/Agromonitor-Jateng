"use client";

import { Download } from "lucide-react";

interface ExportButtonProps {
  filename?: string;
  headers: string[];
  rows: any[][];
}

export default function ExportButton({ filename = "agromonitor-data.csv", headers, rows }: ExportButtonProps) {
  const handleExport = () => {
    if (!rows || rows.length === 0) {
      alert("Tidak ada data untuk diekspor");
      return;
    }

    // Gabungkan header dan baris data
    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    
    const finalFilename = filename.endsWith(".csv") ? filename : `${filename}.csv`;
      
    link.setAttribute("download", finalFilename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      onClick={handleExport}
      className="flex items-center justify-center px-4 py-2 h-10 bg-surface border-2 border-border-color font-bold uppercase tracking-wider text-sm hover:bg-black hover:text-white transition-all shadow-brutal active:translate-x-1 active:translate-y-1 active:shadow-none"
    >
      <Download size={16} className="mr-2" />
      Export CSV
    </button>
  );
}
