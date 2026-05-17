"use client";

import { useEffect, useRef, useState, MouseEvent } from "react";
import JawaTengah from "./JawaTengah";

const KABUPATEN_NAMES = [
  "Banjarnegara", "Banyumas", "Batang", "Blora", "Boyolali",
  "Brebes", "Cilacap", "Demak", "Grobogan", "Jepara",
  "Karanganyar", "Kebumen", "Kendal", "Klaten", "Kota Magelang",
  "Kota Pekalongan", "Kota Semarang", "Kota Tegal", "Kudus", "Magelang",
  "Pati", "Pekalongan", "Pemalang", "Purbalingga", "Purworejo",
  "Rembang", "Kota Salatiga", "Semarang", "Sragen", "Sukoharjo",
  "Kota Surakarta", "Tegal", "Temanggung", "", "Wonogiri",
  "Wonosobo"
];

interface PetaJatengProps {
  onRegionSelect: (regionName: string) => void;
  activeRegion?: string;
}

export default function PetaJateng({ onRegionSelect, activeRegion }: PetaJatengProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Tooltip State
  const [tooltip, setTooltip] = useState<{ show: boolean; x: number; y: number; name: string }>({
    show: false,
    x: 0,
    y: 0,
    name: "",
  });

  useEffect(() => {
    if (containerRef.current) {
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
  }, [activeRegion, onRegionSelect]);

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

  return (
    <div className="relative w-full bg-surface border-2 border-border-color shadow-brutal">
      {/* CSS internal untuk mengatur gaya SVG paths */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .svg-map-container svg {
          width: 175%;
          height: 160%;
          display: block;
          overflow: visible;
          pointer-events: auto;
        }
        .svg-map-container path {
          fill: #FFFFFF !important;
          stroke: #000000 !important;
          stroke-width: 1px !important;
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
          fill: #22C55E !important;
          stroke-width: 2px !important;
        }
      `}} />

      <div
        ref={containerRef}
        className="svg-map-container w-full aspect-video flex justify-center items-center p-2 bg-[#f8f9fa]"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <JawaTengah />
      </div>

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
