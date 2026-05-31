# Guest Description & Split Pax Verification Design (Sub-Project F)

## 1. Latar Belakang & Kebutuhan Bisnis
Dalam pelaksanaan acara pernikahan di lapangan, sering terjadi beberapa skenario penting:
* **Tabrakan Nama (Same-Name Collision):** Ada beberapa tamu dengan nama depan/lengkap yang sama tetapi berasal dari grup/lingkungan undangan yang berbeda (misalnya: "Farhan" dari keluarga Pengantin Pria vs "Farhan" teman Orang Tua). Petugas penerima tamu di Admin CMS perlu membedakan mereka dengan cepat selama pencarian manual agar tidak salah melakukan *check-in*.
* **Pemisahan Kapasitas Ekspektasi & Realisasi (Split Pax):** Kapasitas maksimal undangan yang dialokasikan oleh tuan rumah (ekspektasi) seringkali berbeda dengan jumlah tamu aktual yang dapat hadir (realisasi).
  * Contoh: Tamu diundang untuk **2 pax**, tetapi saat RSVP mereka mengonfirmasi hanya **1 pax** yang hadir.
  * Tamu tidak diperbolehkan menginput jumlah kehadiran melebihi batas undangan yang ditetapkan tuan rumah (*max input limit*).

---

## 2. Rencana Pembaruan Database Schema
Kita akan menambahkan 2 kolom baru pada tabel `guests` di Supabase:
1. `description` (TEXT): Menyimpan deskripsi asal/grup undangan tamu (misalnya: *"Tamu CPP"*, *"Tamu Orang Tua"*).
2. `invited_pax` (INTEGER, Default: 2): Menyimpan kapasitas maksimal undangan (ekspektasi tuan rumah).

### SQL Migration Script (`2026-05-31-guest-description-and-split-pax.sql`):
```sql
-- Tambahkan kolom deskripsi & kapasitas undangan (pax ekspektasi)
ALTER TABLE guests ADD COLUMN description TEXT;
ALTER TABLE guests ADD COLUMN invited_pax INTEGER DEFAULT 2;

-- Opsional: Perbarui data tamu yang sudah ada jika diperlukan
UPDATE guests SET invited_pax = 2 WHERE invited_pax IS NULL;
```

---

## 3. Desain Integrasi Alur Kerja

### A. Alur RSVP Tamu (`src/components/RSVPForm.tsx` & `src/pages/Invitation.tsx`)
1. **Fetch Informasi Tambahan:** `Invitation.tsx` mengambil kolom `name`, `invited_pax`, dan `description` dari database berdasarkan `qr_code` (URL parameter `?to=...`).
2. **Prop-Passing:** Nilai `invitedPax` (default 2) dan `description` dikirimkan ke komponen `<RSVPForm />`.
3. **Penyambutan Kustom (Welcome Card):** Di bagian atas RSVP Form, jika `guestName` tersedia, tampilkan pesan penyambutan premium:
   * *"Selamat datang, [Nama Tamu]!"*
   * Jika ada deskripsi: *"Grup Undangan: [Deskripsi]"*
   * *"Anda diundang untuk kapasitas maksimal: [Invited Pax] pax."*
4. **Validasi Batas Atas Dinamis (Max Constraint):**
   * Input `attendance_count` menggunakan `max: invitedPax` dalam validasi react-hook-form.
   * Menampilkan pesan kesalahan interaktif di bawah input jika tamu mencoba memasukkan angka melebihi batas undangan mereka.

### B. Antarmuka Admin CMS (`src/pages/AdminCMS.tsx`)
1. **Pembaruan Query `fetchGuests`:** Menambahkan `description` dan `invited_pax` ke daftar pilihan select query.
2. **Dashboard Analytics (Kapasitas Pax):**
   * Perhitungan porsi piring/pax yang diharapkan (`maxExpectedPax`) dihitung secara dinamis dari total akumulasi kolom `invited_pax` dari seluruh tamu (baik hadir maupun belum).
   * Persentase porsi hadir (`paxPercent`) = `totalPaxArrived / maxExpectedPax`.
3. **Pencarian Manual Gabungan:**
   * Di dalam list hasil pencarian kueri manual, tampilkan teks `description` sebagai sub-label di bawah nama tamu.
   * Tampilkan info kapasitas:
     * Tamu belum check-in: *"Ekspektasi: [Invited Pax] Pax"*
     * Tamu sudah check-in: *"Hadir: [Attendance Count] / [Invited Pax] Pax"*
   * Hal ini sepenuhnya menyelesaikan masalah nama yang sama (collision) di lapangan.
4. **Detail Tamu Aktif (Panel Kanan):**
   * Menampilkan `description` sebagai tag/label sub-nama yang elegan di panel kanan.
   * Menampilkan status RSVP: *"Hadir ([Attendance Count] dari [Invited Pax] Pax)"* atau *"Belum RSVP (Kapasitas: [Invited Pax] Pax)"*.
5. **Daftar Tabel Tamu (Hadir & Belum Hadir):**
   * Menampilkan deskripsi tamu di bawah nama mereka agar terlihat jelas pada tabel ikhtisar.
   * Menampilkan porsi kehadiran di samping nama atau waktu tiba (`attendance_count` / `invited_pax`).
6. **Ekspor Laporan CSV:**
   * Menambahkan kolom *"Keterangan (Description)"* dan *"Kapasitas Undangan (Pax)"* ke berkas ekspor laporan kehadiran CSV.
   * Mengatur nilai default `invited_pax` menjadi `2` jika kosong.
