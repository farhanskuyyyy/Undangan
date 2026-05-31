# Design Spec: Pencarian & Edit Ulang Tamu Hadir di CMS (Sub-Proyek E)

> [!NOTE]
> Dokumen ini menjelaskan spesifikasi desain untuk Sub-Proyek E: pembaruan kolom **Cari Nama Tamu** (Manual Search) agar dapat mencari seluruh tamu (baik belum hadir maupun sudah hadir). Tamu yang sudah hadir dapat dibuka kembali datanya menggunakan tombol **Edit / Detail** untuk diisi ucapan selamat atau difoto ulang apabila sempat terputus koneksi internet setelah check-in.

---

## 1. Tujuan & Skenario Masalah

### 1.1 Skenario Masalah (Edge Case)
Saat registrasi tamu di lapangan, sering terjadi gangguan koneksi internet atau hambatan teknis. Jika admin berhasil melakukan check-in tetapi halaman terpaksa di-refresh sebelum sempat memotret tamu atau mengisi ucapan selamat, tamu tersebut tidak dapat dicari lagi di kolom "Cari Nama Tamu" karena statusnya sudah dianggap hadir (`has_arrived = true`).

### 1.2 Tujuan Solusi
Menjadikan kolom pencarian manual bersifat menyeluruh (omni-search):
1. Tamu yang belum hadir tetap dapat di-**Check-in** secara langsung.
2. Tamu yang sudah hadir dapat di-**Buka Kembali (Edit / Detail)** untuk mengunggah foto, mencatat souvenir, atau mengisi ucapan (*message*) yang tertinggal.

---

## 2. Struktur Komponen & Logika Data

### 2.1 Penggabungan Array Pencarian
Kita memodifikasi variabel filter pencarian manual dari yang sebelumnya hanya menyaring `pendingGuests` menjadi menyaring gabungan `arrivedGuests` dan `pendingGuests`:
```typescript
const combinedSearchGuests = [
  ...arrivedGuests.map(g => ({ ...g, has_arrived: true })),
  ...pendingGuests.map(g => ({ ...g, has_arrived: false }))
].filter(g => g.name.toLowerCase().includes(manualSearchQuery.toLowerCase()))
```

### 2.2 Fungsi Pengambilan Detail Tamu (`handleSelectGuest`)
Fungsi baru untuk memuat seluruh kolom baris data tamu segar secara asinkron dari Supabase berdasarkan ID tamu yang dipilih:
```typescript
const handleSelectGuest = async (guestId: string) => {
  setLoading(true);
  try {
    const { data, error } = await supabase
      .from('guests')
      .select('*')
      .eq('id', guestId)
      .single();
      
    if (error) throw error;
    
    // Tampilkan ke panel detail sebelah kanan
    setGuest(data);
    setWishesText(data?.message || '');
  } catch (err) {
    console.error("Gagal memuat detail tamu:", err);
    alert("Gagal memuat detail tamu.");
  } finally {
    setLoading(false);
  }
};
```

---

## 3. Desain Antarmuka (UI/UX)

Modul hasil pencarian manual pada panel kiri akan memiliki dua visualisasi baris kartu:

### 3.1 Tamu Belum Hadir
-   Lencana Kategori: Hanya lencana VIP (jika tamu VIP).
-   Tombol Aksi: **Check In** (warna hijau sage `#4A5D4E`).
-   Efek Klik: Melakukan check-in manual instan (`handleManualCheckIn`).

### 3.2 Tamu Sudah Hadir
-   Lencana Kategori: Lencana VIP + Lencana Hijau *"Sudah Check-in"*.
-   Tombol Aksi: **Edit / Detail** (warna coklat hangat `#C17E61`).
-   Efek Klik: Memuat baris data lengkap tamu (`handleSelectGuest`) dan menampilkannya di panel detail sebelah kanan untuk dimodifikasi fotonya atau wishes-nya.

```
+------------------------------------------+
|  🔍 Cari Nama Tamu                       |
+------------------------------------------+
|  Ahmad Naufal   [ VIP ]                  |
|  [ Sudah Check-in ]      [Edit / Detail] | <-- Tamu Hadir
|                                          |
|  Rina Amelia                             |
|                          [ Check In ]    | <-- Tamu Belum Hadir
+------------------------------------------+
```
