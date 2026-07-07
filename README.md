# 🏢 Sistem Manajemen & Otomatisasi SKGB ASN (PNS & PPPK)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-039BE5?style=for-the-badge&logo=Firebase&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

Aplikasi web modern berbasis **React + TypeScript** untuk pengelolaan database pegawai Aparatur Sipil Negara (ASN) serta penerbitan otomatis **Surat Pemberitahuan Kenaikan Gaji Berkala (SKGB)** bagi **PNS** dan **PPPK**. 

Didesain khusus untuk meningkatkan efisiensi tata usaha kepegawaian dengan integrasi perhitungan gaji otomatis berdasarkan regulasi terbaru Tahun 2024.

---

## ✨ Fitur Utama

### 1. 📂 Manajemen Database Pegawai ASN (PNS & PPPK)
* Pengelolaan data induk pegawai secara terpusat (NIP, Nama, Tempat/Tgl Lahir, Pangkat/Golongan, Jabatan, dan Unit Kerja).
* Dukungan pencarian cepat (*real-time search*) serta pemfilteran berdasarkan unit kerja dan status KGB.
* Indikator status otomatis (Akan Datang, Memenuhi Syarat, Terlewat) untuk pemantauan jadwal KGB pegawai.

### 2. 🧮 Kalkulator Gaji Pokok Otomatis Terupdate 2024
Aplikasi dilengkapi dengan mesin kalkulasi presisi yang memuat kamus gaji resmi pemerintah tanpa perlu meraba manual:
* **PNS**: Terintegrasi penuh dengan tabel gaji **Peraturan Pemerintah (PP) Nomor 5 Tahun 2024** (Golongan I/a hingga IV/e lengkap dengan Masa Kerja Golongan).
* **PPPK**: Terintegrasi penuh dengan tabel gaji **Peraturan Presiden (Perpres) Nomor 11 Tahun 2024** (Golongan I hingga XVII lengkap dengan Masa Kerja Golongan).

### 3. 📄 Penerbitan & Cetak SKGB Otomatis
* Kalkulasi otomatis penambahan masa kerja (+2 Tahun) dan nominal gaji pokok baru secara akurat.
* Penentuan otomatis Terhitung Mulai Tanggal (TMT) KGB berikutnya beserta tanggal penandatanganan surat.
* Preview persuratan resmi siap cetak (*Print-Ready*) standar instansi pemerintah.

### 4. ⚙️ Pengaturan Persuratan Dinamis
* Kustomisasi **Kop Surat** instansi/cabang dinas lengkap dengan logo daerah dan kontak resmi.
* Pengaturan **Spesimen Penandatangan** (Kepala Kantor / Pejabat yang ditunjuk) secara fleksibel.

### 5. ☁️ Sinkronisasi Cloud & Local Resilience
* **Durable Cloud Persistence**: Menggunakan **Firebase Firestore** untuk penyimpanan data jangka panjang yang aman dan dapat diakses antar perangkat.
* **Local Fallback**: Penyimpanan cadangan lokal untuk memastikan kecepatan akses dan pemulihan saat koneksi terbatas.

### 6. 🛡️ Jejak Audit & Hak Akses (Activity Logs)
* Mencatat seluruh aktivitas operator (penambahan pegawai, pembaruan gaji, pencetakan SK).
* Manajemen akun pengguna (*Staff Accounts*) dengan pemisahan peran (*Admin* & *Operator*).

---

## 📜 Dasar Hukum & Regulasi

Perhitungan nominal gaji pokok di dalam aplikasi ini mengacu secara ketat pada regulasi resmi pemerintah Republik Indonesia:
1. **PP Nomor 5 Tahun 2024** – *Perubahan Ketiga Belas atas PP Nomor 7 Tahun 1977 tentang Peraturan Gaji Pegawai Negeri Sipil*.
2. **Perpres Nomor 11 Tahun 2024** – *Perubahan atas Perpres Nomor 98 Tahun 2020 tentang Gaji dan Tunjangan Pegawai Pemerintah dengan Perjanjian Kerja*.

---

## 🛠️ Teknologi yang Digunakan

* **Frontend Framework**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Build Tool**: [Vite](https://vitejs.dev/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Animations**: [Framer Motion](https://www.framer.com/motion/)
* **Backend & Database**: [Firebase Firestore & Auth](https://firebase.google.com/)

---

## 🚀 Panduan Instalasi & Menjalankan Lokal

### Prasyarat
Pastikan komputer Anda telah terinstal:
* **Node.js** (versi 18 atau terbaru)
* **npm** atau **yarn**

### Langkah-langkah

1. **Clone Repository**
   ```bash
   git clone https://github.com/username/skgb-asn-management.git
   cd skgb-asn-management
   ```

2. **Instal Dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**
   Salin file contoh konfigurasi environment:
   ```bash
   cp .env.example .env
   ```
   *Sesuaikan variabel kredensial Firebase di dalam file `.env` jika Anda menggunakan project Firebase sendiri.*

4. **Jalankan Development Server**
   ```bash
   npm run dev
   ```
   Aplikasi akan berjalan di `http://localhost:3000`.

5. **Build untuk Produksi**
   ```bash
   npm run build
   ```
   Hasil build statis siap deploy akan tersedia di folder `dist/`.

---

## 💡 Struktur Direktori Utama

```text
├── public/                 # Aset statis & logo instansi
├── src/
│   ├── components/         # Komponen antarmuka (Form SKGB, Database Grid, Header, dll.)
│   ├── utils/
│   │   └── salaryTable.ts  # Kamus & logika perhitungan gapok PP 5/2024 & Perpres 11/2024
│   ├── types.ts            # Definisi struktur tipe data TypeScript
│   ├── firebase.ts         # Konfigurasi Firebase Firestore & Auth Utilities
│   ├── App.tsx             # Komponen utama aplikasi
│   └── main.tsx            # Entry point React
├── firestore.rules         # Aturan keamanan database Firestore
└── package.json            # Daftar dependensi dan script eksekusi
```

---

## 🤝 Kontribusi

Sistem ini terbuka untuk dikembangkan lebih lanjut demi memajukan digitalisasi administrasi publik di Indonesia. Saran, pelaporan *bug*, maupun *Pull Request* sangat diapresiasi.

## 📄 Lisensi

Didistribusikan di bawah lisensi Apache-2.0 / MIT. Silakan gunakan secara bebas untuk kebutuhan tata usaha kepegawaian instansi Anda.
