"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function RegionDateFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPasar = searchParams.get("pasar") || "";
  const currentDate = searchParams.get("date") || "hari-ini";

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const regions = [
    "Banjarnegara", "Banyumas", "Batang", "Blora", "Boyolali", "Brebes", "Cilacap", "Demak", 
    "Grobogan", "Jepara", "Karanganyar", "Kebumen", "Kendal", "Klaten", "Kudus", "Magelang", 
    "Pati", "Pekalongan", "Pemalang", "Purbalingga", "Purworejo", "Rembang", "Semarang", 
    "Sragen", "Sukoharjo", "Tegal", "Temanggung", "Wonogiri", "Wonosobo", 
    "Kota Magelang", "Kota Pekalongan", "Kota Salatiga", "Kota Semarang", "Kota Surakarta", "Kota Tegal"
  ];

  return (
    <div className="flex space-x-2">
      <select 
        className="bg-surface text-foreground border border-border-color font-mono text-xs px-4 py-2 font-bold focus:outline-none focus:border-foreground transition-colors appearance-none cursor-pointer"
        value={currentPasar}
        onChange={(e) => updateFilters("pasar", e.target.value)}
      >
        <option value="">SEMUA WILAYAH</option>
        {regions.map((region) => (
          <option key={region} value={region.toLowerCase()}>{region.toUpperCase()}</option>
        ))}
      </select>

      <select 
        className="bg-surface text-foreground border border-border-color font-mono text-xs px-4 py-2 font-bold focus:outline-none focus:border-foreground transition-colors appearance-none cursor-pointer"
        value={currentDate}
        onChange={(e) => updateFilters("date", e.target.value)}
      >
        <option value="hari-ini">HARI INI</option>
        <option value="1-minggu">1 MINGGU</option>
        <option value="1-bulan">1 BULAN</option>
      </select>
    </div>
  );
}
