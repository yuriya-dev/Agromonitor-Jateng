"use client";

import dynamic from "next/dynamic";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";

const PetaJateng = dynamic(() => import("./PetaJateng"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-surface border-2 border-border-color shadow-brutal flex items-center justify-center animate-pulse">
      <span className="font-mono font-bold tracking-widest uppercase">MEMUAT PETA...</span>
    </div>
  ),
});

interface MapFilterProps {
  showHeader?: boolean;
  className?: string;
}

export default function MapFilter({ showHeader = true, className = "" }: MapFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentPasar = searchParams.get("pasar") || "";

  const handleRegionSelect = useCallback((regionName: string) => {
    const params = new URLSearchParams(searchParams.toString());
    
    console.log("clicked:", regionName);
    console.log("current:", currentPasar);

    if (currentPasar === regionName) {
      params.delete("pasar");
    } else {
      params.set("pasar", regionName);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, currentPasar, router, pathname]);

  return (
    <div className={`w-full ${className}`.trim()}>
      {showHeader && (
        <div className="flex justify-between items-end border-b-2 border-border-color pb-4 mb-6 mt-8">
          <div>
            <h2 className="text-2xl font-bold uppercase tracking-tight">Filter Wilayah</h2>
            <p className="font-mono text-sm text-accent-grey mt-1">
              Klik pada area peta untuk memfilter data berdasarkan wilayah.
            </p>
          </div>
        </div>
      )}
      <PetaJateng onRegionSelect={handleRegionSelect} activeRegion={currentPasar} />
    </div>
  );
}
