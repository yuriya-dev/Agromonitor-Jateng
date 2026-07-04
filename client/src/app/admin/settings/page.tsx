"use client";

import { Save, RefreshCw, Server, Shield, MessageSquare, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { API_BASE } from "@/lib/api-config";
import toast from "react-hot-toast";

export default function AdminSettings() {
  const [waStatus, setWaStatus] = useState<string>("DISCONNECTED");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [waError, setWaError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isSyncingKemendag, setIsSyncingKemendag] = useState<boolean>(false);

  const handleSyncKemendag = async () => {
    setIsSyncingKemendag(true);
    const loadingToastId = toast.loading("Menghubungkan ke database Kemendag & menyinkronkan data...");
    try {
      const res = await fetch(`${API_BASE}/admin/sync-kemendag`, { method: "POST" });
      const json = await res.json();
      toast.dismiss(loadingToastId);
      if (json.success) {
        toast.success(`Sinkronisasi berhasil! Menambahkan ${json.inserted} data baru (${json.skipped} dilewati).`);
      } else {
        toast.error(json.message || "Gagal menyinkronkan data Kemendag.");
      }
    } catch {
      toast.dismiss(loadingToastId);
      toast.error("Gagal terhubung ke server untuk sinkronisasi.");
    } finally {
      setIsSyncingKemendag(false);
    }
  };

  const fetchWaStatus = async () => {
    try {
      const res = await fetch(`${API_BASE}/notifications/whatsapp/status`);
      const json = await res.json();
      if (json.success) {
        setWaStatus(json.data.status);
        setQrCode(json.data.qrCode);
        setWaError(json.data.lastError);
      }
    } catch (err) {
      console.error("Gagal mengambil status WhatsApp", err);
    }
  };

  useEffect(() => {
    fetchWaStatus();
    // Poll status every 4 seconds to catch QR code or Connected status changes
    const interval = setInterval(() => {
      fetchWaStatus();
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleConnectWa = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`${API_BASE}/notifications/whatsapp/connect`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        toast.success("Inisialisasi WhatsApp dimulai...");
        fetchWaStatus();
      } else {
        toast.error("Gagal memulai koneksi WhatsApp");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi ke server");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDisconnectWa = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`${API_BASE}/notifications/whatsapp/disconnect`, { method: "POST" });
      const json = await res.json();
      if (json.success) {
        toast.success("Koneksi WhatsApp diputus.");
        fetchWaStatus();
      } else {
        toast.error("Gagal memutus koneksi WhatsApp");
      }
    } catch {
      toast.error("Terjadi kesalahan koneksi ke server");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold uppercase tracking-tight text-xl">Konfigurasi Sistem Global</h3>
          <p className="text-sm font-mono text-accent-grey">Atur parameter dan integrasi sistem eksternal.</p>
        </div>
        <button 
          onClick={() => toast.success("Konfigurasi sistem global berhasil disimpan!")}
          className="bg-foreground text-background font-mono font-bold uppercase px-6 py-3 flex items-center hover:bg-accent-green transition-colors shadow-brutal active:translate-y-1 active:shadow-none"
        >
          <Save size={18} className="mr-2" />
          Simpan Perubahan
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* API Settings */}
        <div className="bg-white border-2 border-border-color shadow-brutal flex flex-col">
          <div className="p-4 border-b-2 border-border-color bg-surface flex items-center">
            <Server size={20} className="mr-2" />
            <h3 className="font-bold uppercase tracking-tight text-lg">Integrasi API Eksternal</h3>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-foreground mb-2">Endpoint BPS (Badan Pusat Statistik)</label>
              <input type="text" defaultValue="https://api.bps.go.id/v1/harga/jateng" className="w-full border-2 border-border-color p-3 font-mono text-sm outline-none focus:border-foreground transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-foreground mb-2">Endpoint Kemendag</label>
              <input type="text" defaultValue="https://siskaperbapo.kemendag.go.id/api/v2" className="w-full border-2 border-border-color p-3 font-mono text-sm outline-none focus:border-foreground transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-foreground mb-2">Interval Sinkronisasi (Menit)</label>
              <input type="number" defaultValue="60" className="w-full border-2 border-border-color p-3 font-mono text-sm outline-none focus:border-foreground transition-colors" />
            </div>
            <div className="pt-4 border-t-2 border-border-color">
              <button 
                onClick={handleSyncKemendag}
                disabled={isSyncingKemendag}
                className="w-full bg-surface border-2 border-border-color text-foreground font-mono font-bold uppercase py-3 flex justify-center items-center hover:border-foreground disabled:opacity-50 transition-colors"
              >
                <RefreshCw size={18} className={`mr-2 ${isSyncingKemendag ? 'animate-spin' : ''}`} />
                {isSyncingKemendag ? "Sinkronisasi..." : "Sinkronkan Data Kemendag"}
              </button>
            </div>
          </div>
        </div>

        {/* WhatsApp Connection Settings Card */}
        <div className="bg-white border-2 border-border-color shadow-brutal flex flex-col">
          <div className="p-4 border-b-2 border-border-color bg-surface flex items-center justify-between">
            <div className="flex items-center">
              <MessageSquare size={20} className="mr-2" />
              <h3 className="font-bold uppercase tracking-tight text-lg">Gateway WhatsApp (WhatsApp.js)</h3>
            </div>
            <button 
              onClick={fetchWaStatus}
              className="border-2 border-border-color bg-white p-1 hover:bg-surface text-xs font-mono"
              title="Segarkan Status"
            >
              <RefreshCw size={12} className={waStatus === 'INITIALIZING' ? 'animate-spin' : ''} />
            </button>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="flex items-center justify-between p-4 border-2 border-border-color">
              <div>
                <div className="font-bold uppercase text-sm">Status Gateway</div>
                <div className="text-xs font-mono text-accent-grey mt-1">Status koneksi whatsapp-web.js server</div>
              </div>
              <div>
                {waStatus === "CONNECTED" && (
                  <span className="bg-[#E6F4EA] border-2 border-accent-green text-green-800 font-mono font-bold uppercase text-xs px-3 py-1 flex items-center">
                    <CheckCircle2 size={12} className="mr-1 text-accent-green" /> TERHUBUNG
                  </span>
                )}
                {waStatus === "DISCONNECTED" && (
                  <span className="bg-red-50 border-2 border-accent-red text-red-800 font-mono font-bold uppercase text-xs px-3 py-1">
                    TERPUTUS
                  </span>
                )}
                {waStatus === "INITIALIZING" && (
                  <span className="bg-yellow-50 border-2 border-yellow-500 text-yellow-800 font-mono font-bold uppercase text-xs px-3 py-1 flex items-center">
                    <RefreshCw size={12} className="mr-1 animate-spin" /> PROSES...
                  </span>
                )}
                {waStatus === "QR_READY" && (
                  <span className="bg-blue-50 border-2 border-blue-500 text-blue-800 font-mono font-bold uppercase text-xs px-3 py-1">
                    SCAN QR CODE
                  </span>
                )}
                {waStatus === "ERROR" && (
                  <span className="bg-red-100 border-2 border-accent-red text-red-900 font-mono font-bold uppercase text-xs px-3 py-1">
                    ERROR
                  </span>
                )}
              </div>
            </div>

            {waStatus === "QR_READY" && qrCode && (
              <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-border-color bg-surface">
                <p className="text-xs font-mono font-bold uppercase text-center mb-3">Pindai QR Code dengan WhatsApp Anda:</p>
                <div className="bg-white p-4 border border-border-color">
                  <img src={qrCode} alt="WhatsApp QR Code" className="w-48 h-48" />
                </div>
                <p className="text-[10px] font-mono text-accent-grey text-center mt-3 uppercase leading-normal">
                  Buka WhatsApp &gt; Perangkat Tertaut &gt; Tautkan Perangkat.
                </p>
              </div>
            )}

            {waStatus === "INITIALIZING" && (
              <div className="p-8 text-center border-2 border-dashed border-yellow-400 bg-yellow-50 font-mono text-xs uppercase text-yellow-800 leading-relaxed">
                <RefreshCw size={24} className="animate-spin mx-auto mb-2 text-yellow-600" />
                Membuka browser headless Puppeteer di server. Mohon tunggu...
              </div>
            )}

            {waError && (
              <div className="p-4 border-2 border-accent-red bg-red-50 text-red-900 font-mono text-xs">
                <div className="font-bold uppercase flex items-center mb-1">
                  <AlertCircle size={14} className="mr-1" /> Detail Error:
                </div>
                <div className="break-all">{waError}</div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t-2 border-border-color">
              <button
                type="button"
                onClick={handleConnectWa}
                disabled={isUpdating || waStatus === "CONNECTED" || waStatus === "INITIALIZING" || waStatus === "QR_READY"}
                className="bg-foreground text-background font-mono font-bold uppercase py-3 border-2 border-foreground hover:bg-accent-green hover:border-accent-green hover:text-white transition-colors disabled:opacity-50 text-xs text-center"
              >
                Hubungkan WA
              </button>
              <button
                type="button"
                onClick={handleDisconnectWa}
                disabled={isUpdating || waStatus === "DISCONNECTED"}
                className="bg-white text-foreground font-mono font-bold uppercase py-3 border-2 border-border-color hover:border-accent-red hover:text-white hover:shadow-brutal transition-all disabled:opacity-50 text-xs text-center"
              >
                Putus Koneksi
              </button>
            </div>
          </div>
        </div>

        {/* Security & Maintenance */}
        <div className="bg-white border-2 border-border-color shadow-brutal flex flex-col xl:col-span-2">
          <div className="p-4 border-b-2 border-border-color bg-surface flex items-center">
            <Shield size={20} className="mr-2" />
            <h3 className="font-bold uppercase tracking-tight text-lg">Keamanan & Maintenance</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-mono font-bold uppercase text-foreground mb-2">Sesi Login Timeout (Menit)</label>
              <input type="number" defaultValue="120" className="w-full border-2 border-border-color p-3 font-mono text-sm outline-none focus:border-foreground transition-colors" />
            </div>
            
            <div className="flex items-center justify-between p-4 border-2 border-border-color">
              <div>
                <div className="font-bold uppercase text-sm">Mode Maintenance</div>
                <div className="text-xs font-mono text-accent-grey mt-1">Nonaktifkan akses publik sementara</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-accent-grey peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-red rounded-full"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border-2 border-border-color md:col-span-2">
              <div>
                <div className="font-bold uppercase text-sm">Validasi Otomatis (Rule-based)</div>
                <div className="text-xs font-mono text-accent-grey mt-1">Otomatis terima data jika anomali &lt; 5%</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-accent-grey peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent-green rounded-full"></div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
