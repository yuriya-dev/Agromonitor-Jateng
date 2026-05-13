# Agromonitor Jateng

**Sistem Monitoring & Visualisasi Harga Komoditas Pertanian dengan Prediksi Harga**  
*Versi 1.0 | 2024*

Agromonitor Jateng adalah sebuah platform web berbasis *dashboard* untuk memantau, menganalisis, memvisualisasikan, dan memprediksi pergerakan harga komoditas pertanian di Jawa Tengah secara *real-time*. Dashboard ini dirancang dengan antarmuka bertema pasar saham modern (Clinical Precision / Daylight Assassin Mode) untuk memudahkan pembacaan dan pemahaman harga.

## 🎯 Manfaat Utama
- **Transparansi Harga**: Ketersediaan informasi harga bagi petani, pedagang, dan konsumen.
- **Deteksi Dini**: Notifikasi otomatis terkait lonjakan harga komoditas untuk menjaga ketahanan pangan.
- **Prediksi Machine Learning**: Memberikan insight harga bahan pokok di masa depan untuk perencanaan strategis.
- **Pengambilan Keputusan**: Menjadi dasar pengambil kebijakan berbasis data historis yang komprehensif.

## 🚀 Fitur Utama
- **Dashboard Real-time**: Ringkasan harga komoditas terkini menggunakan desain neo-brutalism dan *light-mode* absolut.
- **Scrolling Ticker**: Harga komoditas berjalan di *header* layaknya aplikasi *trading* profesional.
- **Grafik Interaktif**: Menggunakan *candlestick*, *line chart*, dan *bar chart* dengan pustaka `lightweight-charts`.
- **Peta Choropleth**: Sebaran visualisasi harga berdasarkan tingkat provinsi/kabupaten.
- **Prediksi Harga**: Analisis tren dan estimasi menggunakan algoritma *Machine Learning* (seperti ARIMA / Prophet).

## 🛠️ Teknologi yang Digunakan
Sistem ini dibangun menggunakan arsitektur *Three-Tier* modern:
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, Recharts/Lightweight Charts.
- **Backend**: Node.js, Express.js, TypeScript.
- **Database**: PostgreSQL dengan ekstensi TimescaleDB (untuk data *time-series*).
- **Machine Learning**: Python, TensorFlow / Scikit-learn (Tahap mendatang).

## 📂 Struktur Proyek
```text
agromonitor-jateng/
├── client/                 # Frontend aplikasi (Next.js 14)
│   ├── src/app/            # App Router, halaman, layout utama
│   ├── src/components/     # Komponen UI (Ticker, CommodityCard, dll)
│   └── tailwind.config.ts  # Konfigurasi Tailwind & tema desain kustom
├── server/                 # Backend aplikasi (Node.js + Express)
│   ├── src/                # Controller, Route, dan Model API
│   └── package.json        # Dependensi backend
└── project_dokumentation.md # Dokumentasi lengkap proyek
```

## 💻 Instalasi dan Penggunaan Lokal

### Prasyarat
Pastikan Anda telah menginstal lingkungan berikut pada sistem Anda:
- **Node.js** (versi 18+)
- **npm** atau **yarn**

### 1. Menjalankan Frontend (Client)
Masuk ke direktori `client`, instal dependensi, lalu jalankan *development server*.
```bash
cd client
npm install
npm run dev
```
Buka browser dan arahkan ke [http://localhost:5173](http://localhost:5173).

### 2. Menjalankan Backend (Server)
Buka terminal baru, masuk ke direktori `server`, instal dependensi, lalu jalankan API.
```bash
cd server
npm install
npm run dev
```
Backend API akan berjalan di [http://localhost:5001](http://localhost:5001).

## 🎨 Tema UI: Clinical Precision
Proyek ini mengadopsi tema UI **Clinical Precision / Daylight Assassin Mode**:
- **Light Mode Absolut**: Menggunakan latar putih yang steril (`#FFFFFF`).
- **Kontras Ekstrem**: Teks menggunakan warna hitam solid (`#000000`).
- **Aksen Tajam**: Penggunaan warna *Solid Blood Red* (`#D32F2F`) untuk indikator penurunan, dan *Laser Green* (`#00E676`) untuk kenaikan.
- **Neo-Brutalism**: Elemen kartu bersudut kaku (0px *border radius*) dan *hard-shadow* untuk kesan taktikal.

---
*Dokumentasi lebih detail tersedia pada file `project_dokumentation.md`.*
