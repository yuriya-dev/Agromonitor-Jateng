"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import JawaTengah from "./JawaTengah";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPasar = searchParams.get("pasar") || "";

  useEffect(() => {
    if (containerRef.current) {
      const paths = containerRef.current.querySelectorAll("path");
      
      paths.forEach((path, index) => {
        // Assign random but deterministic name from our list
        const name = KABUPATEN_NAMES[index % KABUPATEN_NAMES.length];
        
        // Neo brutalist styling
        path.style.setProperty("cursor", "pointer", "important");
        path.style.setProperty("transition", "all 0.15s ease-in-out", "important");
        path.style.setProperty("stroke", "#000000", "important");
        path.style.setProperty("stroke-width", "2", "important");
        
        // Tooltip sederhana bawaan browser
        path.setAttribute("title", name);
        
        if (currentPasar.toLowerCase() === name.toLowerCase()) {
          path.style.setProperty("fill", "#000000", "important"); // Selected
        } else {
          path.style.setProperty("fill", "#FFFFFF", "important"); // Default
        }

        path.onmouseenter = () => {
          if (currentPasar.toLowerCase() !== name.toLowerCase()) {
            path.style.setProperty("fill", "#E0E0E0", "important"); // Hover
            path.style.setProperty("transform", "translate(-2px, -2px)", "important");
            path.style.setProperty("filter", "drop-shadow(2px 2px 0px #000000)", "important");
          }
        };

        path.onmouseleave = () => {
          path.style.removeProperty("transform");
          path.style.removeProperty("filter");
          if (currentPasar.toLowerCase() !== name.toLowerCase()) {
            path.style.setProperty("fill", "#FFFFFF", "important");
          } else {
            path.style.setProperty("fill", "#000000", "important");
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
  }, [currentPasar, router]);

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
      >
        <JawaTengah className="w-full h-full" viewBox="0 0 800 533" />
      </div>
    </div>
  );
}
