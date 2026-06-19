"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Lock, User, AlertTriangle, RefreshCw } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await login(email, password);
      if (res.success && res.user) {
        const role = res.user.role;
        // Redirect berdasarkan role akses
        if (role === "ADMIN") {
          router.push("/admin");
        } else if (role === "EDITOR") {
          router.push("/analis");
        } else if (role === "PETUGAS") {
          router.push("/petugas");
        } else {
          router.push("/");
        }
      } else {
        setError(res.message || "Email atau password salah.");
      }
    } catch (err: any) {
      console.error(err);
      setError("Terjadi kesalahan koneksi dengan server.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-surface flex flex-col justify-center items-center p-6 font-sans">
      <Link href="/" className="absolute top-8 left-8 flex items-center hover:bg-white p-2 border border-transparent hover:border-border-color transition-colors shadow-none hover:shadow-brutal text-sm font-mono font-bold uppercase">
        <ArrowLeft size={16} className="mr-2" />
        Kembali ke Publik
      </Link>

      <div className="w-full max-w-md bg-white border-2 border-border-color shadow-brutal flex flex-col">
        {/* Header Login */}
        <div className="bg-background border-b-2 border-border-color p-6 text-center">
          <h1 className="text-2xl font-bold tracking-tight uppercase flex items-center justify-center">
            AGROMONITOR<span className="text-accent-red ml-2">JATENG</span>
          </h1>
          <p className="text-xs font-mono text-accent-grey mt-2 uppercase tracking-widest">
            Sistem Autentikasi Portal
          </p>
        </div>

        {/* Form Area */}
        <div className="p-8">
          <div className="bg-yellow-100 border border-yellow-500 p-3 flex items-start mb-6">
            <AlertTriangle size={18} className="text-yellow-700 mr-3 mt-0.5 flex-shrink-0" />
            <p className="text-xs font-mono text-yellow-800 uppercase font-bold">
              Area Terbatas. Halaman ini khusus untuk Admin, Analis, dan Petugas Lapangan.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-accent-red p-3 mb-6 font-mono text-xs text-accent-red uppercase font-bold">
              ⚠️ Login gagal: {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-accent-grey">
                ID Pengguna / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-accent-grey" />
                </div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan Email Pengguna"
                  required
                  className="w-full border-2 border-border-color bg-surface p-3 pl-10 font-mono text-sm outline-none focus:border-foreground focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase tracking-wider text-accent-grey">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-accent-grey" />
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full border-2 border-border-color bg-surface p-3 pl-10 font-mono text-sm outline-none focus:border-foreground focus:bg-white transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input type="checkbox" className="w-4 h-4 border-2 border-border-color checked:bg-foreground appearance-none relative group-hover:border-foreground transition-colors cursor-pointer before:content-[''] before:absolute before:top-0.5 before:left-1 before:w-1.5 before:h-2.5 before:border-r-2 before:border-b-2 before:border-white before:rotate-45 before:opacity-0 checked:before:opacity-100" />
                <span className="text-xs font-mono font-bold uppercase text-accent-grey group-hover:text-foreground transition-colors">Ingat Saya</span>
              </label>
              <a href="#" className="text-xs font-mono font-bold uppercase text-accent-red hover:underline">
                Lupa Sandi?
              </a>
            </div>

            <button 
              type="submit" 
              disabled={submitting}
              className="w-full text-center bg-foreground text-background font-mono font-bold uppercase py-4 hover:bg-accent-red hover:shadow-brutal transition-all active:translate-y-1 active:shadow-none border-2 border-transparent flex justify-center items-center cursor-pointer"
            >
              {submitting ? (
                <><RefreshCw className="animate-spin mr-2" size={18} /> Verifying...</>
              ) : (
                "AUTHORIZE & LOGIN"
              )}
            </button>
          </form>
        </div>
        
        {/* Footer info */}
        <div className="bg-surface border-t border-border-color p-4 text-center">
          <p className="text-[10px] font-mono text-accent-grey uppercase">
            Sistem Pemantauan Harga Tani V1.0 • Koneksi Terenkripsi AES-256
          </p>
        </div>
      </div>
    </main>
  );
}
