"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Check, RefreshCw, User, Bell, LogIn, UserPlus, Save, Loader2, LogOut, CheckCircle2, ShieldCheck, Smartphone, Mail, Send } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import AuthModal from '@/components/AuthModal';
import { API_BASE } from '@/lib/api-config';

type Commodity = {
  id: string;
  name: string;
  unit: string;
};

type NotificationLog = {
  id: string;
  timestamp: string;
  to: string;
  type: 'WHATSAPP' | 'EMAIL' | 'TELEGRAM';
  content: string;
  name: string;
  status?: string;
  gateway?: string;
};

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  // Form state (synced from user session)
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [notifyDaily, setNotifyDaily] = useState(false);
  const [preferences, setPreferences] = useState<string[]>([]);

  const [commodities, setCommodities] = useState<Commodity[]>([]);
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Sync form with logged-in user data
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setWhatsapp(user.whatsapp || '');
      setNotifyDaily(user.notifyDaily);
      setPreferences(user.preferences || []);
    }
  }, [user]);

  // Load commodities and notifications
  const loadData = async () => {
    setLoading(true);
    try {
      const compRes = await fetch(`${API_BASE}/commodities`);
      const compData = await compRes.json();
      if (compData.success) setCommodities(compData.data);

      const queryParam = user?.email ? `?email=${encodeURIComponent(user.email)}` : '';
      const notifRes = await fetch(`${API_BASE}/notifications${queryParam}`);
      const notifData = await notifRes.json();
      if (notifData.success) setNotifications(notifData.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const refreshNotifications = async () => {
    try {
      const queryParam = user?.email ? `?email=${encodeURIComponent(user.email)}` : '';
      const notifRes = await fetch(`${API_BASE}/notifications${queryParam}`);
      const notifData = await notifRes.json();
      if (notifData.success) setNotifications(notifData.data);
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle commodity selection
  const handlePreferenceToggle = (slug: string) => {
    setPreferences((prev) =>
      prev.includes(slug) ? prev.filter((p) => p !== slug) : [...prev, slug]
    );
  };

  // Select all / deselect all
  const handleSelectAll = () => {
    if (preferences.length === commodities.length) {
      setPreferences([]);
    } else {
      setPreferences(commodities.map(c => c.id));
    }
  };

  // Save profile to backend
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: user.email,
          whatsapp,
          preferences,
          notifyDaily,
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Update local session
        updateUser({
          name: data.data.name,
          whatsapp: data.data.whatsapp,
          preferences: data.data.preferences,
          notifyDaily: data.data.notifyDaily,
        });
        setMessage({ type: 'success', text: 'Profil preferensi Anda berhasil disimpan!' });
      } else {
        setMessage({ type: 'error', text: data.message || 'Gagal menyimpan profil' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Gagal menghubungi server' });
    } finally {
      setSaving(false);
    }
  };

  // ── Guest View ──────────────────────────────────────────────────────────────
  if (!user) {
    return (
      <main className="min-h-screen bg-surface flex flex-col items-center justify-center p-6 font-sans">
        <Link href="/" className="absolute top-8 left-8 flex items-center hover:bg-white p-2 border border-transparent hover:border-border-color transition-colors text-sm font-mono font-bold uppercase">
          <ArrowLeft size={16} className="mr-2" /> Kembali
        </Link>

        <div className="w-full max-w-lg text-center space-y-8">
          {/* Icon */}
          <div className="flex flex-col items-center gap-4">
            <div className="w-20 h-20 bg-foreground flex items-center justify-center shadow-brutal">
              <User size={40} className="text-background" />
            </div>
            <div>
              <h1 className="text-3xl font-bold uppercase tracking-tight">Profil & Preferensi</h1>
              <p className="text-sm font-mono text-accent-grey mt-2">
                Masuk atau daftar untuk mengatur preferensi bahan pangan dan menerima update harga harian.
              </p>
            </div>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
            {[
              { icon: '📦', title: 'Preferensi Komoditas', desc: 'Pilih bahan pangan yang ingin Anda pantau.' },
              { icon: '📲', title: 'Notifikasi Harian', desc: 'Terima update harga via WhatsApp/Email otomatis.' },
              { icon: '📊', title: 'Data Personal', desc: 'Simpan pengaturan Anda secara permanen.' },
            ].map((f) => (
              <div key={f.title} className="p-4 bg-white border-2 border-border-color shadow-brutal text-center">
                <div className="text-2xl mb-2">{f.icon}</div>
                <div className="font-bold uppercase text-xs mb-1">{f.title}</div>
                <div className="text-[10px] text-accent-grey font-mono">{f.desc}</div>
              </div>
            ))}
          </div>

          {/* Auth buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              id="btn-masuk"
              onClick={() => { setAuthModalTab('login'); setShowAuthModal(true); }}
              className="inline-flex items-center justify-center gap-2 bg-foreground text-background font-mono font-bold uppercase px-8 py-4 hover:bg-accent-red hover:text-white transition-colors shadow-brutal border-2 border-foreground text-sm"
            >
              <LogIn size={18} /> Masuk ke Akun
            </button>
            <button
              id="btn-daftar"
              onClick={() => { setAuthModalTab('register'); setShowAuthModal(true); }}
              className="inline-flex items-center justify-center gap-2 bg-white text-foreground font-mono font-bold uppercase px-8 py-4 hover:bg-surface transition-colors shadow-brutal border-2 border-foreground text-sm"
            >
              <UserPlus size={18} /> Buat Akun Baru
            </button>
          </div>
        </div>

        {showAuthModal && (
          <AuthModal
            defaultTab={authModalTab}
            onClose={() => setShowAuthModal(false)}
          />
        )}
      </main>
    );
  }

  // ── Authenticated View ──────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-surface p-6 font-sans flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-8">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b-2 border-border-color pb-4">
          {/* Left: back arrow + title */}
          <div className="flex items-start gap-4">
            <Link
              href="/"
              className="shrink-0 mt-1 inline-flex items-center justify-center w-9 h-9 border-2 border-border-color bg-white hover:bg-foreground hover:text-background hover:border-foreground transition-colors shadow-brutal active:translate-y-0.5 active:shadow-none"
              title="Kembali ke Beranda"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="inline-flex items-center px-3 py-1 border border-border-color bg-white font-mono text-xs uppercase tracking-[0.2em] text-accent-grey mb-2">
                <User size={14} className="mr-2" /> Pengaturan Akun
              </div>
              <h1 className="text-3xl font-bold uppercase tracking-tight">Profil &amp; Preferensi</h1>
              <p className="text-sm font-mono text-accent-grey mt-1">
                Atur preferensi komoditas Anda untuk menerima update notifikasi harga harian.
              </p>
            </div>
          </div>
          {/* Right: logout */}
          <button
            onClick={() => { logout(); router.push('/'); }}
            className="shrink-0 inline-flex items-center border-2 border-border-color bg-white font-mono font-bold uppercase px-4 py-2.5 text-xs hover:bg-red-50 hover:text-accent-red hover:border-accent-red transition-colors shadow-brutal"
          >
            <LogOut size={14} className="mr-1.5" /> Keluar
          </button>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`p-4 border-2 font-mono text-sm uppercase shadow-brutal flex items-start ${
            message.type === 'success' ? 'bg-[#E6F4EA] border-accent-green text-green-800' : 'bg-[#FCE8E6] border-accent-red text-red-800'
          }`}>
            <span className="font-bold mr-2">{message.type === 'success' ? '✔ [SUKSES]' : '✖ [ERROR]'}</span>
            <span>{message.text}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: User Info Form */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border-2 border-border-color p-6 shadow-brutal">
              {/* User badge */}
              <div className="mb-5 pb-4 border-b border-border-color flex items-center gap-3">
                <div className="w-12 h-12 bg-foreground text-background flex items-center justify-center font-bold text-xl shrink-0">
                  {name ? name[0].toUpperCase() : user.email[0].toUpperCase()}
                </div>
                <div className="font-mono text-xs overflow-hidden">
                  <div className="font-bold uppercase truncate">{name || 'Pengguna'}</div>
                  <div className="text-accent-grey truncate">{user.email}</div>
                  <div className="mt-1 inline-block px-1.5 py-0.5 border text-[9px] uppercase font-bold border-border-color bg-surface">{user.role}</div>
                </div>
              </div>

              <h2 className="text-lg font-bold uppercase tracking-tight mb-4">Data Diri</h2>

              <form onSubmit={handleSaveProfile} className="space-y-4 font-mono text-sm">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama Lengkap"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border-2 border-border-color p-3 outline-none bg-surface focus:bg-white focus:border-foreground"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    readOnly
                    className="w-full border-2 border-border-color p-3 outline-none bg-gray-100 text-accent-grey cursor-not-allowed"
                  />
                  <span className="text-[10px] text-accent-grey font-mono">Email tidak dapat diubah.</span>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Nomor WhatsApp</label>
                  <input
                    type="text"
                    placeholder="08xxxxxxxxxx"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="w-full border-2 border-border-color p-3 outline-none bg-surface focus:bg-white focus:border-foreground"
                  />
                </div>

                {/* Daily Update Toggle */}
                <div className="pt-2 border-t border-border-color mt-4">
                  <label className="flex items-start space-x-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={notifyDaily}
                      onChange={(e) => setNotifyDaily(e.target.checked)}
                      className="w-5 h-5 border-2 border-border-color checked:bg-foreground appearance-none relative shrink-0 checked:after:content-['✓'] checked:after:absolute checked:after:text-white checked:after:text-xs checked:after:font-bold checked:after:left-1 checked:after:-top-0.5"
                    />
                    <div>
                      <span className="text-xs font-bold uppercase text-foreground group-hover:text-accent-red transition-colors block">
                        Kirim Update Harga Harian
                      </span>
                      <span className="text-[10px] text-accent-grey block mt-0.5 leading-normal">
                        Dapatkan pesan harian WhatsApp/Email otomatis berisi rangkuman harga preferensi Anda.
                      </span>
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-foreground text-background font-bold uppercase py-4 border-2 border-transparent hover:bg-accent-green hover:text-white hover:shadow-brutal transition-all active:translate-y-1 active:shadow-none mt-6 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  {saving ? 'MENYIMPAN...' : 'SIMPAN PREFERENSI'}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Commodity Preferences Checklist */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border-2 border-border-color p-6 shadow-brutal flex flex-col h-full">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-3 border-border-color mb-4">
                <h2 className="text-lg font-bold uppercase tracking-tight">
                  Preferensi Bahan Pangan
                </h2>
                {commodities.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="border border-border-color bg-surface hover:bg-foreground hover:text-white text-xs font-mono font-bold uppercase px-3 py-1.5 transition-colors"
                  >
                    {preferences.length === commodities.length ? 'Batal Semua' : 'Pilih Semua'}
                  </button>
                )}
              </div>

              {loading ? (
                <div className="flex-1 flex items-center justify-center py-20 font-mono text-xs uppercase">
                  <RefreshCw size={18} className="animate-spin mr-2" /> Memuat daftar komoditas...
                </div>
              ) : commodities.length === 0 ? (
                <div className="flex-1 text-center py-20 font-mono text-accent-grey border-2 border-dashed border-border-color uppercase">
                  Tidak ada komoditas ditemukan.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {commodities.map((item) => {
                    const isChecked = preferences.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handlePreferenceToggle(item.id)}
                        className={`p-3 border-2 font-mono text-xs uppercase text-left transition-all flex items-center justify-between shadow-sm ${
                          isChecked
                            ? 'bg-foreground text-white border-foreground'
                            : 'bg-white text-foreground border-border-color hover:bg-surface'
                        }`}
                      >
                        <div className="pr-4">
                          <div className="font-bold">{item.name}</div>
                          <div className={`text-[10px] mt-0.5 ${isChecked ? 'text-gray-300' : 'text-accent-grey'}`}>
                            Satuan: {item.unit}
                          </div>
                        </div>
                        {isChecked && (
                          <div className="bg-white text-foreground p-0.5 rounded-full shrink-0 border border-border-color">
                            <Check size={12} className="stroke-[3]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Section: Notification Logs */}
        <div className="bg-white border-2 border-border-color shadow-brutal overflow-hidden">
          <div className="p-4 border-b-2 border-border-color bg-surface flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold uppercase tracking-tight text-lg flex items-center">
                  <Bell size={18} className="mr-2 text-accent-green" /> Riwayat Notifikasi Terkirim
                </h2>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold px-2 py-0.5 border border-emerald-300 uppercase">
                  SYSTEM AUDIT LOG
                </span>
              </div>
              <p className="text-xs font-mono text-accent-grey mt-1">
                Rekam jejak pengiriman pesan update harga harian & peringatan otomatis ke saluran terdaftar.
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={refreshNotifications}
                className="inline-flex items-center border-2 border-border-color bg-white px-3 py-1.5 text-xs font-mono font-bold uppercase hover:bg-surface active:translate-y-0.5 transition-colors shadow-sm"
              >
                <RefreshCw size={12} className="mr-1.5" /> SEGARKAN LOG
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* System Gateway Status Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-surface border border-border-color font-mono text-xs mb-6">
              <div className="flex items-center space-x-2">
                <ShieldCheck size={16} className="text-accent-green" />
                <span className="font-bold uppercase">Status Layanan Gateway:</span>
                <span className="text-accent-green font-bold uppercase">ONLINE (OPERATIONAL)</span>
              </div>
              <div className="text-accent-grey text-[11px]">
                Jadwal Pengiriman Otomatis: <strong className="text-foreground">Setiap Hari 07:00 WIB</strong>
              </div>
            </div>

            {notifications.length === 0 ? (
              <div className="p-12 text-center text-accent-grey font-mono uppercase border-2 border-dashed border-border-color bg-surface/30">
                <Send size={32} className="mx-auto mb-3 text-accent-grey/50" />
                <p className="font-bold text-sm text-foreground">Belum Ada Riwayat Pesan Baru</p>
                <p className="text-xs mt-1 text-accent-grey max-w-md mx-auto">
                  Pastikan preferensi komoditas Anda telah disimpan. Sistem akan merekam setiap pesan update harian yang berhasil terkirim ke WhatsApp atau Email Anda.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notif) => {
                  const isWA = notif.type === 'WHATSAPP';
                  return (
                    <div key={notif.id} className="p-4 border-2 border-border-color bg-white hover:bg-surface/30 transition-all flex flex-col md:flex-row gap-4 items-start shadow-sm">
                      <div className="w-full md:w-64 shrink-0 space-y-2 font-mono text-xs border-b md:border-b-0 md:border-r border-border-color pb-3 md:pb-0 md:pr-4">
                        <div className="flex items-center justify-between">
                          <span className={`px-2 py-0.5 border text-[10px] font-bold uppercase flex items-center gap-1 ${
                            isWA ? 'bg-[#E6F4EA] border-[#137333] text-[#137333]' : 'bg-[#E8F0FE] border-[#1a73e8] text-[#1a73e8]'
                          }`}>
                            {isWA ? <Smartphone size={12} /> : <Mail size={12} />}
                            {notif.type}
                          </span>
                          <span className="bg-emerald-50 text-emerald-700 font-bold border border-emerald-300 text-[9px] px-1.5 py-0.5 uppercase flex items-center gap-0.5">
                            <CheckCircle2 size={10} /> TERKIRIM
                          </span>
                        </div>

                        <div>
                          <span className="text-[10px] text-accent-grey uppercase block">ID Transaksi:</span>
                          <span className="font-bold text-foreground font-mono text-[11px]">{notif.id}</span>
                        </div>

                        <div>
                          <span className="text-[10px] text-accent-grey uppercase block">Penerima Pangan:</span>
                          <div className="font-bold uppercase text-foreground truncate">{notif.name}</div>
                          <div className="text-accent-grey truncate text-[11px]">{notif.to}</div>
                        </div>

                        <div>
                          <span className="text-[10px] text-accent-grey uppercase block">Waktu Pengiriman:</span>
                          <div className="text-accent-grey text-[11px] font-bold">{new Date(notif.timestamp).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</div>
                        </div>

                        {notif.gateway && (
                          <div className="pt-1 border-t border-border-color/20">
                            <span className="text-[9px] font-mono text-accent-grey block truncate">{notif.gateway}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 w-full bg-surface/50 border border-border-color/60 p-3.5 font-mono text-xs whitespace-pre-wrap leading-relaxed text-foreground/90">
                        {notif.content}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    </main>
  );
}

