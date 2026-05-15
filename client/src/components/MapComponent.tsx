"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Daftar kabupaten mock untuk mapping ke path
const KABUPATEN_NAMES = [
  "Semarang", "Surakarta", "Banyumas", "Magelang", "Tegal", 
  "Pekalongan", "Pati", "Cilacap", "Jepara", "Wonosobo", 
  "Kudus", "Boyolali", "Demak", "Grobogan", "Klaten",
  "Brebes", "Pemalang", "Batang", "Kendal", "Temanggung",
  "Purbalingga", "Banjarnegara", "Cilacap", "Kebumen", "Purworejo",
  "Wonosobo", "Magelang", "Boyolali", "Klaten", "Sukoharjo",
  "Wonogiri", "Karanganyar", "Sragen", "Grobogan", "Blora"
];

export default function MapComponent() {
  const [svgContent, setSvgContent] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPasar = searchParams.get("pasar") || "";

  useEffect(() => {
    fetch("/Jawa-Tengah.svg")
      .then(res => res.text())
      .then(text => {
        // Hapus rect background bawaan SVG agar transparan
        let modifiedSvg = text.replace(/<rect[^>]*>/g, "");
        // Ubah style inline agar sesuai tema
        modifiedSvg = modifiedSvg.replace(/background-color:#[a-zA-Z0-9]+/g, "background-color:transparent");
        
        // Buat SVG responsif
        modifiedSvg = modifiedSvg.replace(/width="[0-9]+"/, 'width="100%"');
        modifiedSvg = modifiedSvg.replace(/height="[0-9]+"/, 'height="100%"');
        
        setSvgContent(modifiedSvg);
      })
      .catch(err => console.error("Gagal memuat SVG:", err));
  }, []);

  useEffect(() => {
    if (containerRef.current && svgContent) {
      const paths = containerRef.current.querySelectorAll("path");
      
      paths.forEach((path, index) => {
        // Assign random but deterministic name from our list
        const name = KABUPATEN_NAMES[index % KABUPATEN_NAMES.length];
        
        // Neo brutalist styling
        path.style.cursor = "pointer";
        path.style.transition = "all 0.15s ease-in-out";
        path.style.stroke = "#000000";
        path.style.strokeWidth = "2";
        
        // Tooltip sederhana bawaan browser
        path.setAttribute("title", name);
        
        if (currentPasar.toLowerCase() === name.toLowerCase()) {
          path.style.fill = "#000000"; // Selected
        } else {
          path.style.fill = "#FFFFFF"; // Default
        }

        path.onmouseenter = () => {
          if (currentPasar.toLowerCase() !== name.toLowerCase()) {
            path.style.fill = "#E0E0E0"; // Hover
            path.style.transform = "translate(-2px, -2px)";
            path.style.filter = "drop-shadow(2px 2px 0px #000000)";
          }
        };

        path.onmouseleave = () => {
          path.style.transform = "none";
          path.style.filter = "none";
          if (currentPasar.toLowerCase() !== name.toLowerCase()) {
            path.style.fill = "#FFFFFF";
          } else {
            path.style.fill = "#000000";
          }
        };

        path.onclick = () => {
          const params = new URLSearchParams(window.location.search);
          if (currentPasar.toLowerCase() === name.toLowerCase()) {
            params.delete("pasar");
          } else {
            params.set("pasar", name.toLowerCase());
          }
          router.push(`/?${params.toString()}`, { scroll: false });
        };
      });
    }
  }, [svgContent, currentPasar, router]);

  if (!svgContent) {
    return (
      <div className="w-full h-[400px] bg-border-color animate-pulse border-2 border-border-color shadow-brutal flex items-center justify-center font-mono font-bold">
        MEMUAT PETA SVG...
      </div>
    );
  }

  return (
    <div className="border-2 border-border-color shadow-brutal w-full bg-surface relative overflow-hidden flex flex-col">
      <div className="bg-background border-b-2 border-border-color p-3 flex justify-between items-center">
        <span className="font-bold uppercase tracking-tight text-sm">Peta Persebaran Komoditas</span>
        <span className="font-mono text-xs text-accent-grey">
          {currentPasar ? `WILAYAH: ${currentPasar.toUpperCase()}` : "SELURUH JAWA TENGAH"}
        </span>
      </div>
      <div 
        ref={containerRef} 
        className="w-full h-[400px] flex justify-center items-center p-4 bg-[#f8f9fa]" // sedikit kontras agar peta putih menonjol
        dangerouslySetInnerHTML={{ __html: svgContent }} 
      />
    </div>
  );
}
