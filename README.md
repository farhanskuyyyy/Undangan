# Sistem Registrasi & Undangan Digital Pernikahan (Undangan)

Aplikasi manajemen meja penerima tamu (*Guest Management & Registration System*) pernikahan berbasis web yang responsif, modern, dan didukung sinkronisasi data *real-time* multi-gate.

---

## 🌟 Fitur Utama

### 1. Meja Registrasi (Admin CMS)
*   **Scan Barcode / QR Code**: Menggunakan kamera perangkat atau unggah gambar untuk verifikasi kedatangan tamu secara instan.
*   **Check-in Manual**: Dukungan pencarian cepat nama tamu untuk check-in manual bagi tamu yang tidak membawa QR Code.
*   **Penyerahan Souvenir**: Pengelolaan status souvenir tamu (*Belum Diambil* / *Sudah Diambil*) dengan perlindungan penyerahan ganda.
*   **Foto Kehadiran Tamu**: Modul kamera langsung (*webcam*) untuk memotret fisik tamu check-in, mengompres otomatis (JPEG 80%), dan mengunggah asinkron ke Supabase Storage.
*   **Wishes dengan Quick Templates**: Form pengisian ucapan pernikahan dengan 5 rekomendasi ucapan kustom cepat sekali-klik untuk mencegah antrean panjang di gerbang masuk.
*   **Ekspor Data Laporan (CSV)**: Fitur ekspor laporan check-in terlengkap dengan encoding UTF-8 BOM untuk kompatibilitas mutlak di Microsoft Excel.

### 2. Galeri & Modal Lightbox
*   **Lightbox Zoom**: Efek *hover overlay* interaktif untuk memperbesar foto tamu di dalam jendela modal melayang berdesain *glassmorphism backdrop-blur* premium.
*   **Galeri Berpaginasi**: Menampilkan grid modern kartu visual tamu hadir yang berfoto di bagian bawah CMS (8 kartu per halaman) dengan navigasi dinamis.

### 3. Halaman Proyektor (Live Greeting Wall)
*   **Widescreen Slideshow (Rute `/projector`)**: Tampilan proyektor aula pernikahan menampilkan slideshow foto tamu Polaroid miring estetik berlatar gradasi botanical, guguran kelopak bunga jatuh (`FloatingPetals`), dan dekorasi botanical sudut (`FloralDecor`).
*   **Interupsi Sambutan Real-Time**: WebSocket instan Supabase secara asinkron mendeteksi check-in baru di gerbang, menyela slideshow normal, dan menampilkan tayangan agung mewah *"Selamat Datang"* beserta foto terbaru tamu tersebut selama 12-detik.

### 4. Dasbor Analitik & Sinkronisasi Multi-Gate
*   **SVG Ring Circle Charts**: Visualisasi statistik kehadiran, pembagian souvenir, kedatangan VIP, dan porsi katering pax secara reaktif dengan progress ring SVG melingkar yang berputar halus.
*   **Real-time Multi-Gate Sync & Toast Feed**: Sinkronisasi data antar-perangkat admin secara instan tanpa memuat ulang halaman. Setiap check-in di gerbang mana pun memicu pop-up kartu notifikasi melayang cantik di pojok kanan bawah admin lainnya selama 4 detik.

---

## 🛠️ Tech Stack & Dependencies

*   **Core**: React 19, TypeScript 6, Vite 8 (HMR)
*   **Backend & DB**: Supabase Client (@supabase/supabase-js)
*   **Styling**: Tailwind CSS 3, PostCSS, Vanilla CSS
*   **Motion**: Framer Motion 12, GSAP
*   **Hardware Control**: HTML5 Camera MediaDevices API, Canvas API, Html5Qrcode
*   **Icons**: Lucide React

---

## ⚙️ Cara Menjalankan Aplikasi Secara Lokal

### 1. Prasyarat & Instalasi Dependency
Pastikan Anda telah memasang [Node.js](https://nodejs.org/). Kloning repositori ini dan instal seluruh *packages*:
```bash
npm install
```

### 2. Variabel Lingkungan (.env)
Salin berkas `.env.example` menjadi `.env` di direktori utama proyek, lalu isi dengan kredensial Supabase Anda:
```env
VITE_SUPABASE_URL=tautan-url-supabase-anda
VITE_SUPABASE_ANON_KEY=anon-key-supabase-anda
VITE_ADMIN_PASSWORD=password-login-admin-anda
```

### 3. Konfigurasi Dashboard Supabase
*   **Storage Bucket**:
    1. Buka menu **Storage** di Supabase Dashboard.
    2. Buat bucket baru bernama: `guest-photos`. Setel sebagai **Public bucket**.
    3. Di tab **Policies**, buat kebijakan RLS baru:
        *   `SELECT`: Izinkan untuk semua orang (*Allowed for everyone*).
        *   `INSERT & UPDATE`: Izinkan untuk semua orang / anonim (atau hanya user terotentikasi).
*   **Database Realtime**:
    1. Buka menu **Database** -> **Replication** di Supabase Dashboard.
    2. Edit publikasi **supabase_realtime** dan aktifkan sakelar (*toggle*) pada tabel **guests** agar pesan real-time WebSocket check-in dan foto ter-broadcast otomatis.

### 4. Menjalankan Server Development
Jalankan dev server dengan perintah berikut:
```bash
npm run dev
```
Aplikasi dapat dibuka di browser Anda melalui alamat default `http://localhost:5173/`.

### 5. Akses Halaman
*   **Undangan Tamu**: `http://localhost:5173/?to=NamaTamu` (Untuk melihat undangan personal tamu).
*   **Admin CMS**: `http://localhost:5173/admin` (Gunakan password admin di berkas `.env` untuk masuk).
*   **Slideshow Proyektor**: `http://localhost:5173/projector` (Buka di laptop sekunder proyektor aula).
