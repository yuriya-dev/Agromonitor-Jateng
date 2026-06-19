"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function PetugasLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'PETUGAS')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-6">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-foreground"></div>
        <p className="font-mono text-sm uppercase text-accent-grey mt-4">Memverifikasi Otoritas Akses...</p>
      </div>
    );
  }

  if (!user || user.role !== 'PETUGAS') {
    return null;
  }

  return <>{children}</>;
}
