"use client";

import { useEffect, useRef, useState, MouseEvent } from "react";

const KABUPATEN_NAMES = [
  "Semarang", "Surakarta", "Banyumas", "Magelang", "Tegal",
  "Pekalongan", "Pati", "Cilacap", "Jepara", "Wonosobo",
  "Kudus", "Boyolali", "Demak", "Grobogan", "Klaten",
  "Brebes", "Pemalang", "Batang", "Kendal", "Temanggung",
  "Purbalingga", "Banjarnegara", "Cilacap", "Kebumen", "Purworejo",
  "Wonosobo", "Magelang", "Boyolali", "Klaten", "Sukoharjo",
  "Wonogiri", "Karanganyar", "Sragen", "Grobogan", "Blora"
];

interface PetaJatengProps {
  onRegionSelect: (regionName: string) => void;
  activeRegion?: string;
}

export default function PetaJateng({ onRegionSelect, activeRegion }: PetaJatengProps) {
  const [svgContent, setSvgContent] = useState<string>("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Tooltip State
  const [tooltip, setTooltip] = useState<{ show: boolean; x: number; y: number; name: string }>({
    show: false,
    x: 0,
    y: 0,
    name: "",
  });

  useEffect(() => {
    fetch("/Jawa-Tengah.svg")
      .then((res) => res.text())
      .then((text) => {
        // Ambil width dan height asli untuk dijadikan viewBox agar peta bisa scale
        const widthMatch = text.match(/width="([^"]*)"/i);
        const heightMatch = text.match(/height="([^"]*)"/i);
        const origWidth = widthMatch ? widthMatch[1] : "800";
        const origHeight = heightMatch ? heightMatch[1] : "533";

        // Bersihkan atribut bawaan
        let modifiedSvg = text.replace(/<rect[^>]*>/g, "");
        modifiedSvg = modifiedSvg.replace(/style="filter:[^"]*"/g, "");
        modifiedSvg = modifiedSvg.replace(/background-color:#[a-zA-Z0-9]+/g, "background-color:transparent");

        if (!modifiedSvg.includes("viewBox")) {
          modifiedSvg = modifiedSvg.replace(/<svg\s/i, `<svg viewBox="0 0 ${origWidth} ${origHeight}" `);
        }

        modifiedSvg = modifiedSvg.replace(/width="[^"]*"/i, 'width="100%"');
        modifiedSvg = modifiedSvg.replace(/height="[^"]*"/i, 'height="100%"');

        // Hapus inline fill/stroke agar bisa di-override oleh CSS
        modifiedSvg = modifiedSvg.replace(/fill="#[a-zA-Z0-9]+"/g, "");
        modifiedSvg = modifiedSvg.replace(/stroke="#[a-zA-Z0-9]+"/g, "");

        setSvgContent(modifiedSvg);
      })
      .catch(err => console.error("Gagal memuat peta:", err));
  }, []);

  useEffect(() => {
    if (containerRef.current && svgContent) {
      const paths = containerRef.current.querySelectorAll("path");

      paths.forEach((path, index) => {
        const regionName = KABUPATEN_NAMES[index % KABUPATEN_NAMES.length];

        path.setAttribute("data-name", regionName);
        path.removeAttribute("title");

        const isSelected = activeRegion?.toLowerCase() === regionName.toLowerCase();
        if (isSelected) {
          path.setAttribute("data-selected", "true");
        } else {
          path.removeAttribute("data-selected");
        }
      });
    }
  }, [svgContent, activeRegion, onRegionSelect]);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const target = (e.target as Element).closest("path");
    if (target) {
      const name = target.getAttribute("data-name");
      if (name) {
        setTooltip({
          show: true,
          x: e.clientX,
          y: e.clientY,
          name: name,
        });
      }
    } else {
      setTooltip((prev) => ({ ...prev, show: false }));
    }
  };

  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, show: false }));
  };

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = (e.target as Element).closest("path");
    if (!target) {
      return;
    }
    const name = target.getAttribute("data-name");
    if (name) {
      onRegionSelect(name);
    }
  };

  if (!svgContent) {
    return (
      <div className="w-full h-[400px] bg-surface flex items-center justify-center font-mono font-bold border-2 border-border-color shadow-brutal animate-pulse">
        MEMUAT PETA...
      </div>
    );
  }

  return (
    <div className="relative w-full bg-surface border-2 border-border-color shadow-brutal">
      {/* CSS internal untuk mengatur gaya SVG paths */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .svg-map-container svg {
          width: 175%;
          height: 175%;
          display: block;
          overflow: visible;
          pointer-events: auto;
        }
        .svg-map-container path {
          fill: #FFFFFF;
          stroke: #000000;
          stroke-width: 1px;
          vector-effect: non-scaling-stroke;
          cursor: pointer;
          transition: fill 0.1s ease, stroke-width 0.1s ease;
          pointer-events: all;
        }
        .svg-map-container path:hover {
          fill: #C1121F !important;
          stroke-width: 2px !important;
        }
        .svg-map-container path[data-selected="true"] {
          fill: #000000 !important;
          stroke-width: 2px !important;
        }
      `}} />

      <div
        ref={containerRef}
        className="svg-map-container w-full aspect-video flex justify-center items-center p-2 bg-[#f8f9fa]"
        dangerouslySetInnerHTML={{ __html: svgContent }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      />

      {/* Pin Tool Informasi */}
      {tooltip.show && (
        <div
          className="fixed pointer-events-none z-50 bg-white text-text-color font-mono text-sm px-3 py-2 border-2 border-border-color shadow-brutal flex items-center gap-2"
          style={{
            left: `${tooltip.x + 15}px`,
            top: `${tooltip.y + 15}px`
          }}
        >
          <span className="text-xl">📍</span>
          <div className="flex flex-col">
            <span className="font-bold uppercase leading-none">{tooltip.name}</span>
            <span className="text-[10px] text-accent-grey leading-tight mt-1">Klik untuk filter</span>
          </div>
        </div>
      )}
    </div>
  );
}
