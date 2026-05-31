# Guest Inline RSVP & Management CRUD with CSV Import Design (Sub-Project G)

## 1. Latar Belakang & Kebutuhan Bisnis
* **Penyatuan Pengalaman Halaman (Single-Page UX):** Menjaga proses RSVP agar tetap menyatu di dalam halaman undangan digital utama (`Invitation.tsx`) tanpa memecahnya ke halaman baru, sehingga tamu dapat merasakan pengalaman yang mulus dan terintegrasi langsung saat membaca undangan.
* **Personalisasi Tamu:** Tamu mendapatkan sambutan yang personal di dalam form RSVP inline (menyebutkan nama mereka, grup undangan, dan kapasitas porsi mereka).
* **Manajemen Tamu Terpusat:** Panitia pernikahan membutuhkan halaman internal pada Admin CMS untuk mengelola daftar undangan (menambah, mengubah, menghapus) secara mandiri sebelum acara dimulai, tanpa perlu memanipulasi database secara manual.
* **Impor Massal (Efisiensi Waktu):** Memasukkan data ratusan tamu satu per satu secara manual sangat memakan waktu. Impor massal dari file CSV (Excel-compatible) dengan penomoran QR Code unik otomatis akan menghemat waktu operasional panitia hingga 99%.

---

## 2. Alur Navigasi & Arsitektur Sistem

### A. Alur Publik Tamu
* Pengalaman pengisian RSVP tetap menyatu dan bersifat inline di dalam halaman utama `Invitation.tsx`.
* Halaman membaca parameter `?to=...` (QR Code) dari URL.
* Mengambil nama (`name`), deskripsi grup (`description`), dan batas porsi (`invited_pax`) dari database Supabase.
* Menampilkan **Welcome Card** personal dan membatasi input jumlah kehadiran secara ketat agar tidak melebihi kapasitas `invited_pax`.

### B. Arsitektur Tab Admin CMS (`src/pages/AdminCMS.tsx`)
```
                     +---------------------------------------+
                     |           Admin CMS Dashboard         |
                     +---------------------------------------+
                                         |
               +-------------------------+-------------------------+
               |                                                   |
               v                                                   v
      [Tab 1: Dashboard Kehadiran]                     [Tab 2: Manajemen Undangan]
      - Scan QR Check-in                               - Daftar Semua Undangan (Tabel)
      - Pencarian manual + Edit                        - Tambah Tamu (Modal Form)
      - SVG Analytics Rings                            - Edit & Hapus Tamu
      - Real-time Toast Sync                           - Download CSV Template
      - Arrived/Pending Tables                         - Upload & Parse CSV Massal
```

---

## 3. Desain Komponen & Antarmuka UI

### A. Form RSVP Inline Terintegrasi (`src/pages/Invitation.tsx`)
* Form RSVP dipasang langsung secara inline di bawah informasi Lokasi Pernikahan.
* Logika prop-passing tetap terhubung erat untuk mengirimkan `guestId`, `guestName`, `invitedPax`, dan `guestDescription` langsung ke komponen `<RSVPForm />`.

### B. Halaman Manajemen Undangan (Admin CMS)
Ketika Tab "Manajemen Undangan" dipilih di Admin CMS:
1. **Pusat CRUD Tamu:**
   * **Tabel Undangan:** Daftar interaktif berisi Nama, VIP Status, Keterangan Grup, Kapasitas Pax, Status RSVP, Kode QR, dan Tombol Tautan WhatsApp.
   * **WhatsApp Link Generator:** Tombol salin tautan dengan format:
     `window.location.origin + "/?to=" + guest.qr_code`
     *Contoh:* `https://undangan.com/?to=GUEST-XY7B9`
   * **Modal Tambah/Ubah Tamu:** Form isian tamu baru dengan penomoran kode QR otomatis format acak unik:
     `GUEST-${Math.random().toString(36).substring(2, 7).toUpperCase()}`
2. **Pusat Impor Massal CSV:**
   * **Tombol Download Template:** Mengunduh template CSV mentah dengan struktur:
     `Nama,Keterangan,Kapasitas_Pax,VIP_Ya_Tidak`
   * **Komponen Impor File:** Input file beralih ke logika parser JS yang membagi baris data CSV secara cerdas:
     * Mengabaikan baris header.
     * Mengurai data nama, keterangan grup, jumlah pax, dan status VIP (`Ya` -> `true`, `Tidak` -> `false`).
     * Menghasilkan QR Code unik secara otomatis untuk setiap baris tamu baru.
     * Melakukan bulk insert menggunakan Supabase: `.insert(bulkData)`.

---

## 4. Keamanan & Kebijakan Supabase RLS
Tabel `guests` menggunakan kebijakan RLS yang perlu dikonfirmasi/ditambahkan agar CRUD berfungsi lancar:
1. **Select Policy:** Public read (`true`) diperbolehkan.
2. **Update Policy:** Public update (`true`) diperbolehkan (agar tamu bisa mengisi RSVP secara mandiri).
3. **Insert/Delete Policies:** Kita akan menambahkan atau membolehkan operasi insert dan delete untuk admin, agar admin dapat mengelola tamu (CRUD & Impor CSV) dari antarmuka Admin CMS.
