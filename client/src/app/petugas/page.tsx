'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, Calendar, Camera, CheckCircle2, Clock3, Loader2, LogOut, MapPin, Menu, Navigation, Package, Send, ChevronRight, User2 } from 'lucide-react';
import { commodityLabels, commodityOptions, compressImageFile, petugasProfile, type LocationState } from './_lib/petugas';
import { API_BASE } from '@/lib/api-config';

export default function PetugasLapanganPage() {
  const petugasCode = petugasProfile.code;
  const petugasName = petugasProfile.name;
  const petugasEmail = petugasProfile.email;
  const [reportDate, setReportDate] = useState('');
  const [commoditySlug, setCommoditySlug] = useState('beras-medium');
  const [market, setMarket] = useState('Pasar Johar, Semarang');
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoName, setPhotoName] = useState('');
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    label: 'Belum mengambil GPS',
    mapUrl: '',
  });
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [gpsError, setGpsError] = useState('');
  const [submitState, setSubmitState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setReportDate(new Date().toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, []);

  const takeGps = () => {
    setGpsError('');
    setGpsStatus('loading');

    if (!navigator.geolocation) {
      setGpsStatus('error');
      setGpsError('Browser tidak mendukung geolocation.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = Number(position.coords.latitude.toFixed(6));
        const longitude = Number(position.coords.longitude.toFixed(6));
        const accuracy = Number(position.coords.accuracy.toFixed(1));

        setLocation({
          latitude,
          longitude,
          accuracy,
          label: `GPS aktif • ${latitude}, ${longitude}`,
          mapUrl: `https://www.google.com/maps?q=${latitude},${longitude}`,
        });
        setGpsStatus('ready');
      },
      (error) => {
        setGpsStatus('error');
        setGpsError(error.message || 'Gagal mengambil lokasi GPS.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const handlePhotoCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setPhotoName(file.name);
    setMessage('');

    compressImageFile(file)
      .then((compressedPhotoUrl) => {
        setPhotoUrl(compressedPhotoUrl);
      })
      .catch((error) => {
        setPhotoUrl('');
        setPhotoName('');
        if (photoInputRef.current) {
          photoInputRef.current.value = '';
        }
        setSubmitState('error');
        setMessage(error instanceof Error ? error.message : 'Gagal memproses foto.');
      });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitState('loading');
    setMessage('');

    if (location.latitude === null || location.longitude === null) {
      setSubmitState('error');
      setMessage('Ambil lokasi GPS terlebih dahulu sebelum mengirim laporan.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/field-reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          petugasCode,
          petugasName,
          petugasEmail,
          commoditySlug,
          commodityName: commodityLabels[commoditySlug],
          market,
          price: Number(price),
          reportDate,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          locationLabel: location.label,
          notes,
          photoUrl,
        }),
      });

      const contentType = response.headers.get('content-type') || '';
      const responseText = await response.text();

      if (!contentType.includes('application/json')) {
        throw new Error(`Server mengembalikan respons non-JSON (${response.status}). Pastikan backend berjalan.`);
      }

      const json = JSON.parse(responseText);
      if (!json.success) {
        throw new Error(json.message || 'Gagal mengirim laporan');
      }

      setSubmitState('success');
      setMessage('Laporan berhasil dikirim dan tercatat di backend admin.');
      setNotes('');
      setPhotoUrl('');
      setPhotoName('');
      setPrice('');
      if (photoInputRef.current) {
        photoInputRef.current.value = '';
      }
    } catch (error) {
      setSubmitState('error');
      setMessage(error instanceof Error ? error.message : 'Terjadi kesalahan server.');
    }
  };

  return (
    <main className="min-h-screen bg-surface font-sans flex flex-col items-center">
      <div className="w-full max-w-md min-h-screen bg-white border-x-2 border-border-color shadow-brutal flex flex-col relative">
        <header className="bg-background border-b-2 border-border-color p-4 sticky top-0 z-50 flex justify-between items-center relative">
          <div>
            <h1 className="text-xl font-bold tracking-tight uppercase flex items-center">
              AGRO<span className="text-accent-red">ENTRY</span>
            </h1>
            <p className="text-[10px] font-mono text-accent-grey uppercase tracking-widest mt-1">Portal Petugas Lapangan</p>
          </div>
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenuOpen((value) => !value)}
              className="p-2 border-2 border-border-color bg-surface hover:bg-foreground hover:text-white transition-colors active:translate-y-1"
              aria-label="Buka menu petugas"
            >
              <Menu size={16} />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-white border-2 border-border-color shadow-brutal z-50 overflow-hidden">
                <div className="bg-surface p-3 border-b-2 border-border-color">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-foreground text-white flex items-center justify-center border-2 border-border-color">
                      <User2 size={18} />
                    </div>
                    <div>
                      <div className="text-sm font-bold uppercase">{petugasName}</div>
                      <div className="text-[10px] font-mono text-accent-grey uppercase">{petugasCode}</div>
                    </div>
                  </div>
                </div>
                <div className="p-2">
                  <Link href="/petugas/profile" className="w-full flex items-center justify-between px-3 py-3 border-2 border-transparent hover:border-border-color hover:bg-surface text-left transition-colors" onClick={() => setMenuOpen(false)}>
                    <span className="text-sm font-bold uppercase">Profil Petugas</span>
                    <ChevronRight size={16} />
                  </Link>
                  <Link href="/petugas/riwayat" className="w-full flex items-center justify-between px-3 py-3 border-2 border-transparent hover:border-border-color hover:bg-surface text-left transition-colors" onClick={() => setMenuOpen(false)}>
                    <span className="text-sm font-bold uppercase flex items-center gap-2">
                      <Package size={14} /> Riwayat Survei
                    </span>
                    <ChevronRight size={16} />
                  </Link>
                  <Link href="/login" className="w-full flex items-center justify-between px-3 py-3 border-2 border-transparent hover:border-border-color hover:bg-surface text-left transition-colors">
                    <span className="text-sm font-bold uppercase flex items-center gap-2">
                      <LogOut size={14} /> Keluar
                    </span>
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="bg-surface border-b-2 border-border-color p-4 flex flex-col space-y-3">
          <div className="bg-white border-2 border-border-color p-3 shadow-brutal flex items-start gap-3">
            <div className="w-11 h-11 bg-foreground text-white flex items-center justify-center border-2 border-border-color shrink-0">
              <User2 size={20} />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-mono text-accent-grey uppercase">Profil Petugas</div>
              <div className="mt-1 text-lg font-bold uppercase leading-tight">{petugasName}</div>
              <div className="text-xs font-mono uppercase text-accent-grey mt-1">{petugasCode}</div>
              <div className="text-xs font-mono text-accent-grey mt-1 break-all">{petugasEmail}</div>
            </div>
          </div>

          <div className="bg-white border-2 border-border-color p-3 flex items-start shadow-brutal">
            <MapPin size={18} className="text-accent-red mr-3 mt-0.5" />
            <div className="flex-1">
              <div className="text-[10px] font-mono text-accent-grey uppercase">Lokasi Tugas (GPS)</div>
              <div className="text-sm font-bold uppercase">{location.label}</div>
              {location.latitude !== null && (
                <div className="text-[11px] font-mono text-accent-grey mt-1">
                  Akurasi ±{location.accuracy?.toFixed(1)} m
                </div>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={takeGps}
            className="w-full border-2 border-foreground bg-foreground text-white font-mono font-bold uppercase py-3 flex items-center justify-center hover:bg-accent-green transition-colors active:translate-y-1"
          >
            {gpsStatus === 'loading' ? <Loader2 size={16} className="mr-2 animate-spin" /> : <Navigation size={16} className="mr-2" />}
            {gpsStatus === 'loading' ? 'Mengambil GPS...' : 'Ambil Lokasi GPS'}
          </button>
          {gpsError && (
            <div className="bg-red-100 border-2 border-accent-red p-3 text-xs font-mono font-bold text-accent-red flex items-start">
              <AlertTriangle size={14} className="mr-2 mt-0.5 flex-shrink-0" />
              {gpsError}
            </div>
          )}
          {location.mapUrl && (
            <a href={location.mapUrl} target="_blank" rel="noreferrer" className="text-xs font-mono font-bold uppercase text-foreground underline">
              Buka peta lokasi
            </a>
          )}
        </div>

        <div className="p-6 flex-1">
          <h2 className="text-lg font-bold uppercase mb-6 tracking-tight border-b-2 border-foreground pb-2 inline-block">Input Harga Harian</h2>

          <form className="space-y-6" onSubmit={handleSubmit}>

            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase text-accent-grey">Tanggal Pencatatan</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar size={18} className="text-foreground" />
                </div>
                <input type="date" value={reportDate} onChange={(event) => setReportDate(event.target.value)} className="w-full border-2 border-border-color bg-white p-3 pl-10 font-mono text-sm outline-none focus:border-foreground" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase text-accent-grey">Pilih Komoditas</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Package size={18} className="text-foreground" />
                </div>
                <select value={commoditySlug} onChange={(event) => setCommoditySlug(event.target.value)} className="w-full border-2 border-border-color bg-white p-3 pl-10 font-mono text-sm outline-none focus:border-foreground appearance-none cursor-pointer">
                  {commodityOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase text-accent-grey">Lokasi Pasar / Titik Tugas</label>
              <input value={market} onChange={(event) => setMarket(event.target.value)} className="w-full border-2 border-border-color bg-white p-3 font-mono text-sm outline-none focus:border-foreground" placeholder="Pasar Johar, Semarang" />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase text-accent-grey">Harga Aktual (Rupiah)</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-foreground font-mono font-bold">Rp</div>
                <input type="number" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="0" className="w-full border-2 border-border-color bg-white p-3 pl-10 font-mono text-xl font-bold outline-none focus:border-foreground text-right" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase text-accent-grey">Catatan Lapangan</label>
              <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={3} className="w-full border-2 border-border-color bg-white p-3 font-mono text-sm outline-none focus:border-foreground resize-none" placeholder="Contoh: harga naik karena pasokan berkurang." />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-mono font-bold uppercase text-accent-grey">Foto Bukti / Kios (Wajib)</label>
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="w-full border-2 border-dashed border-border-color bg-surface hover:bg-white p-4 flex flex-col items-center justify-center transition-colors"
              >
                <Camera size={30} className="text-accent-grey mb-2" />
                <span className="text-xs font-mono font-bold uppercase text-accent-grey">Buka kamera atau pilih dari galeri</span>
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoCapture}
                className="hidden"
              />
              {photoName && (
                <div className="text-xs font-mono font-bold uppercase text-accent-green flex items-center">
                  <CheckCircle2 size={14} className="mr-2" />
                  {photoName}
                </div>
              )}
              <div className="text-[10px] font-mono text-accent-grey uppercase">
                Foto JPG/PNG akan diperkecil otomatis sebelum dikirim.
              </div>
              {photoUrl && (
                <div className="border-2 border-border-color bg-white p-2">
                  <img src={photoUrl} alt="Pratinjau bukti" className="w-full h-40 object-cover" />
                </div>
              )}
            </div>

            <div className="pt-2 text-xs font-mono text-accent-grey flex items-center">
              <Clock3 size={14} className="mr-2" />
              {gpsStatus === 'ready' ? 'GPS siap dikirim ke backend admin.' : 'Ambil GPS sebelum mengirim laporan.'}
            </div>

            {message && (
              <div className={`border-2 p-3 text-sm font-mono font-bold flex items-center ${submitState === 'success' ? 'bg-green-100 border-accent-green text-accent-green' : 'bg-red-100 border-accent-red text-accent-red'}`}>
                <CheckCircle2 size={16} className="mr-2" />
                {message}
              </div>
            )}

            <div className="pt-4 pb-12">
              <button type="submit" disabled={submitState === 'loading'} className="w-full flex items-center justify-center bg-foreground text-background font-mono font-bold uppercase py-4 hover:bg-accent-green hover:text-white hover:shadow-brutal transition-all active:translate-y-1 active:shadow-none border-2 border-transparent disabled:opacity-70">
                {submitState === 'loading' ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Send size={18} className="mr-2" />}
                Kirim Data Harga
              </button>
            </div>
          </form>

        </div>
      </div>
    </main>
  );
}