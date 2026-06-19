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
Sistem ini dibangun menggunakan arsitektur *Three-Tier* modern yang sangat resilient:
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, Recharts/Lightweight Charts.
- **Backend**: Node.js, Express.js, TypeScript.
- **Database**: PostgreSQL dengan ekstensi TimescaleDB (untuk data *time-series*) dan Prisma ORM.
- **Machine Learning & Forecasting**: Python 3.9+, FastAPI, Uvicorn, **statsmodels (ARIMA)**, Pandas, Numpy, Scikit-learn.

## 📂 Struktur Proyek
```text
agromonitor-jateng/
├── client/                 # Frontend aplikasi (Next.js 14)
│   ├── src/app/            # App Router, halaman komoditas, layout utama
│   ├── src/components/     # Komponen UI (PredictionSection, Ticker, dll)
│   └── tailwind.config.ts  # Konfigurasi Tailwind & tema desain kustom
├── server/                 # Backend API Gateway (Node.js + Express + TypeScript)
│   ├── src/                # Controller, Route, dan Utility Core API
│   └── package.json        # Dependensi backend
├── ml-service/             # Layanan prediksi ARIMA (Python FastAPI)
│   └── app.py              # Endpoint API prediksi ARIMA & generator narasi
├── notebook/               # Notebook eksperimen pemodelan ARIMA
└── project_dokumentation.md # Dokumentasi lengkap proyek
```

## 💻 Instalasi dan Penggunaan Lokal

### Prasyarat
Pastikan Anda telah menginstal lingkungan berikut pada sistem Anda:
- **Node.js** (versi 18+)
- **Python** (versi 3.9+)
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

### 3. Menjalankan Layanan Prediksi (ML-Service)
Buka terminal baru, masuk ke direktori `ml-service`, instal pustaka dependensi Python, lalu jalankan microservice menggunakan Uvicorn.
```bash
cd ml-service
pip install fastapi uvicorn statsmodels pandas numpy scikit-learn
# Gunakan python di Windows atau python3 di Linux/macOS
python -m uvicorn app:app --port 5002
```
ML-Service akan berjalan di [http://localhost:5002](http://localhost:5002).

## 📈 Integrasi Prediksi & Peringatan Harga Dinamis

Dashboard Agromonitor Jateng kini terintegrasi secara dinamis dengan model deret waktu **ARIMA (5, 1, 0)** dari `ml-service` untuk menyediakan:
- **Catatan Prediksi Dinamis (Prediction Notes)**: Teks analisis pergerakan harga komoditas dalam Bahasa Indonesia yang di-generate otomatis oleh model (menjelaskan tren kenaikan/penurunan, persentase perubahan, nilai nominal awal-akhir, dan tingkat volatilitas).
- **Peringatan Harga Terintegrasi (Dynamic Price Alerts)**:
  - **Merah (Bahaya - CRITICAL)** jika harga diprediksi naik >= 5.0% dalam 14 hari ke depan (risiko inflasi tinggi).
  - **Kuning (Waspada - WARNING)** jika harga diprediksi naik >= 1.5%, turun >= 3.0% (potensi kerugian petani), atau memiliki volatilitas tinggi.
  - **Hijau (Aman - NONE)** jika perubahan harga berada dalam rentang aman dan stabil.
- **Mekanisme Ketahanan Sistem (TypeScript Fallback)**: Jika microservice Python sedang offline atau mengalami kegagalan komputasi, backend server Express secara otomatis beralih menggunakan algoritma regresi linier secara mandiri sehingga website tetap berjalan stabil tanpa gangguan (*Zero Downtime*).

## 🎨 Tema UI: Clinical Precision
Proyek ini mengadopsi tema UI **Clinical Precision / Daylight Assassin Mode**:
- **Light Mode Absolut**: Menggunakan latar putih yang steril (`#FFFFFF`).
- **Kontras Ekstrem**: Teks menggunakan warna hitam solid (`#000000`).
- **Aksen Tajam**: Penggunaan warna *Solid Blood Red* (`#D32F2F`) untuk indikator penurunan/peringatan kritis, dan *Laser Green* (`#00E676`) untuk kenaikan/keadaan aman.
- **Neo-Brutalism**: Elemen kartu bersudut kaku (0px *border radius*) dan *hard-shadow* untuk kesan taktikal.

## 🔑 Akun Kredensial Uji Coba (Login Portal)

Gunakan akun berikut untuk masuk ke portal autentikasi (`/login`) sesuai dengan peran masing-masing:

| Peran (Role) | Halaman / Portal | Email | Kata Sandi | Deskripsi |
|---|---|---|---|---|
| **ADMIN** | `/admin` | `budi_admin@agromonitor.com` | `123456` | Manajemen data, kelola transaksi, dan manajemen pengguna |
| **ANALIS (EDITOR)** | `/analis` | `siti_analis@agromonitor.com` | `123456` | Analisis ML ARIMA, akurasi model, dan ekspor data CSV/JSON |
| **PETUGAS** | `/petugas` | `rudi_petugas@agromonitor.com` | `123456` | Pengiriman laporan harga lapangan dengan koordinat GPS |
| **VIEWER** | `/` (Beranda Publik) | `andi@gmail.com` | `123456` | Pengguna publik untuk pemantauan umum |

---
*Dokumentasi lebih detail tersedia pada file `project_dokumentation.md`.*
