"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { RefreshCw, FileText } from "lucide-react";
import { API_BASE } from "@/lib/api-config";

function PrintReportContent() {
  const searchParams = useSearchParams();
  const start = searchParams.get("start") || "";
  const end = searchParams.get("end") || "";

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!start || !end) {
        setError("Tanggal mulai dan tanggal akhir diperlukan.");
        setLoading(false);
        return;
      }
      
      try {
        const res = await fetch(`${API_BASE}/analis/export/json?start=${start}&end=${end}`);
        if (!res.ok) {
          throw new Error("Gagal mengambil data laporan.");
        }
        const json = await res.json();
        if (json.success) {
          setData(json);
        } else {
          throw new Error(json.message || "Gagal memproses data.");
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Kesalahan mengambil data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [start, end]);

  useEffect(() => {
    if (data && !loading && !error) {
      // Trigger browser print dialog setelah rendering selesai
      const timer = setTimeout(() => {
        window.print();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [data, loading, error]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <RefreshCw className="animate-spin text-foreground mb-4" size={40} />
        <p className="font-mono text-sm uppercase text-gray-500">Mempersiapkan Laporan Cetak Resmi...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-12 text-center">
        <h1 className="text-2xl font-bold text-red-600 uppercase mb-4">Gagal Menghasilkan Laporan</h1>
        <p className="font-mono text-sm">{error}</p>
        <p className="mt-8 text-xs text-gray-400">Silakan tutup tab ini dan coba lagi.</p>
      </div>
    );
  }

  const { summary, rawData, meta } = data;

  return (
    <div className="min-h-screen bg-white text-black p-8 md:p-16 max-w-4xl mx-auto font-serif printable-report">
      {/* KOP LAPORAN RESMI */}
      <div className="text-center border-b-4 border-black pb-6 mb-8">
        <h1 className="text-2xl font-bold uppercase tracking-tight font-sans">Pemerintah Provinsi Jawa Tengah</h1>
        <h2 className="text-xl font-bold uppercase tracking-wide font-sans mt-1">Dinas Pertanian dan Ketahanan Pangan</h2>
        <p className="text-xs font-mono uppercase text-gray-600 mt-2">
          Kompleks Organisasi Pemerintah Provinsi Jawa Tengah, Semarang | Telp: (024) 123456
        </p>
      </div>

      {/* HEADER DOKUMEN */}
      <div className="flex flex-col items-center mb-8">
        <h3 className="text-lg font-bold uppercase underline font-sans text-center">
          Laporan Analisis & Prediksi Harga Komoditas Pertanian
        </h3>
        <p className="text-sm font-mono mt-2">
          Periode Data: <span className="font-bold">{start}</span> s/d <span className="font-bold">{end}</span>
        </p>
        <p className="text-[10px] font-mono text-gray-500 mt-1">
          Dibuat secara otomatis oleh: {meta.generator} | {new Date(meta.exportedAt).toLocaleString("id-ID")}
        </p>
      </div>

      {/* RINGKASAN EKSEKUTIF */}
      <div className="border-2 border-black p-6 mb-8 font-sans bg-gray-50">
        <h4 className="font-bold uppercase text-sm mb-4 border-b border-black pb-2 flex items-center">
          <FileText size={16} className="mr-2" /> Ringkasan Eksekutif
        </h4>
        <p className="text-sm leading-relaxed mb-4">
          Laporan ini disusun sebagai instrumen pengawasan pergerakan harga komoditas pangan penting tingkat konsumen di wilayah Provinsi Jawa Tengah. Berdasarkan analisis model runtun waktu (ARIMA) yang dikonfigurasi oleh tim analis data, berikut adalah kesimpulan pengawasan komoditas pertanian utama:
        </p>
        <ul className="text-sm space-y-2 list-disc pl-5">
          {summary.map((s: any) => {
            const trendDesc = s.trendDirection === "UP" 
              ? `kenaikan harga sebesar ${s.priceChangePercent.toFixed(2)}% (Waspada)` 
              : s.trendDirection === "DOWN" 
                ? `penurunan harga sebesar ${Math.abs(s.priceChangePercent).toFixed(2)}% (Suplai Melimpah)` 
                : "pergerakan harga relatif stabil";

            return (
              <li key={s.commodityId}>
                <strong>{s.name}</strong>: Harga saat ini Rp {s.price.toLocaleString("id-ID")}/{s.commodityId === "minyak-goreng" ? "Liter" : "Kg"}, dengan proyeksi 14 hari ke depan menunjukkan tren <strong>{trendDesc}</strong> (Volatilitas: {s.volatility}, Akurasi MAPE: {s.mape ? `${s.mape.toFixed(1)}%` : "N/A"}).
              </li>
            );
          })}
        </ul>
      </div>

      {/* TABEL DATA PREDIKSI */}
      <div className="mb-8">
        <h4 className="font-sans font-bold uppercase text-sm mb-3">1. Matriks Analisis & Peramalan ARIMA</h4>
        <table className="w-full border-collapse border border-black text-left text-sm font-sans">
          <thead>
            <tr className="bg-gray-100 border-b border-black">
              <th className="border border-black p-2 font-bold uppercase text-xs">Komoditas</th>
              <th className="border border-black p-2 font-bold uppercase text-xs text-right">Harga Terakhir</th>
              <th className="border border-black p-2 font-bold uppercase text-xs text-center">Tren Proyeksi 14 Hari</th>
              <th className="border border-black p-2 font-bold uppercase text-xs text-center">Volatilitas</th>
              <th className="border border-black p-2 font-bold uppercase text-xs text-center">Status Alert</th>
              <th className="border border-black p-2 font-bold uppercase text-xs text-center">MAPE Akurasi</th>
            </tr>
          </thead>
          <tbody>
            {summary.map((s: any) => (
              <tr key={s.commodityId} className="border-b border-black">
                <td className="border border-black p-2 uppercase font-bold">{s.name}</td>
                <td className="border border-black p-2 font-mono text-right">Rp {s.price.toLocaleString("id-ID")}</td>
                <td className="border border-black p-2 font-mono text-center">
                  {s.priceChangePercent > 0 ? "+" : ""}{s.priceChangePercent.toFixed(2)}%
                </td>
                <td className="border border-black p-2 text-center uppercase text-xs">{s.volatility}</td>
                <td className="border border-black p-2 text-center uppercase text-xs font-bold">
                  {s.alertTrigger === "CRITICAL" ? "KRITIS (MERAH)" : s.alertTrigger === "WARNING" ? "WASPADA (KUNING)" : "AMAN (HIJAU)"}
                </td>
                <td className="border border-black p-2 font-mono text-center text-xs">
                  {s.mape ? `${s.mape.toFixed(1)}%` : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* METODE PENYUSUNAN */}
      <div className="mb-12 font-sans text-xs text-gray-600 leading-relaxed">
        <h4 className="font-bold uppercase text-black text-xs mb-2">Pernyataan Metodologi & Sumber Data:</h4>
        <p className="mb-2">
          - Data historis dikumpulkan secara berkala oleh Petugas Lapangan dari pasar pantauan di Jawa Tengah dan disinkronkan dengan data resmi (BPS / Kemendag).
        </p>
        <p>
          - Peramalan harga menggunakan pemodelan runtun waktu ARIMA (AutoRegressive Integrated Moving Average) berbasis statistik parameter yang dievaluasi per komoditas secara periodik untuk mempersempit nilai kesalahan prediksi (MAPE).
        </p>
      </div>

      {/* TANDA TANGAN */}
      <div className="flex justify-between items-end font-sans text-sm mt-20">
        <div className="text-center">
          <p>Disetujui Oleh,</p>
          <p className="font-bold uppercase mt-16">Kepala Dinas Ketahanan Pangan</p>
          <span className="text-xs text-gray-500 block">NIP. 19740822 199903 1 002</span>
        </div>
        <div className="text-center">
          <p>Semarang, {new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p>Petugas Analis Data,</p>
          <p className="font-bold uppercase mt-16">Tim Data Science Agromonitor</p>
          <span className="text-xs text-gray-500 block">Sistem Monitoring Terpadu</span>
        </div>
      </div>
      
      {/* CSS Khusus Cetak Browser */}
      <style jsx global>{`
        @media print {
          body {
            background-color: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .printable-report {
            max-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            min-height: auto !important;
          }
          button, header, aside, footer {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function PrintReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <RefreshCw className="animate-spin text-foreground mb-4" size={40} />
        <p className="font-mono text-sm uppercase text-gray-500">Mempersiapkan Laporan Cetak Resmi...</p>
      </div>
    }>
      <PrintReportContent />
    </Suspense>
  );
}
