"use client";

import { useEffect, useState } from "react";
import { Map as MapIcon, X } from "lucide-react";
import MapFilter from "@/components/MapFilter";

export default function MapDrawerToggle() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        type="button"
        className="hover:bg-surface p-2 border border-transparent hover:border-border-color transition-colors"
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label="Buka peta wilayah"
      >
        <MapIcon size={20} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <aside
            role="dialog"
            aria-modal="true"
            className="absolute right-0 top-0 h-full w-full max-w-[420px] bg-surface border-l-2 border-border-color shadow-brutal flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b-2 border-border-color bg-background">
              <div>
                <h2 className="text-lg font-bold uppercase tracking-tight">Peta Wilayah</h2>
                <p className="font-mono text-xs text-accent-grey mt-1">
                  Klik kabupaten untuk memfilter data.
                </p>
              </div>
              <button
                type="button"
                className="p-2 border-2 border-border-color bg-white shadow-brutal hover:shadow-brutal-hover transition-all"
                onClick={() => setIsOpen(false)}
                aria-label="Tutup peta"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <MapFilter showHeader={false} />
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
