"use client";

import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function SearchBar({ className = "relative w-full" }: { className?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  
  const [query, setQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (debouncedQuery) {
      router.push(`/?q=${encodeURIComponent(debouncedQuery)}`);
    } else {
      router.push(`/`);
    }
  }, [debouncedQuery, router]);

  return (
    <div className={className}>
      <input 
        type="text" 
        placeholder="Cari komoditas, pasar..." 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10 pr-4 py-2 bg-surface border border-border-color font-mono text-sm focus:outline-none focus:border-2 w-full transition-all"
      />
      <Search className="absolute left-3 top-2.5 text-accent-grey" size={16} />
    </div>
  );
}
