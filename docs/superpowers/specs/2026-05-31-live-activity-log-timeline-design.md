# Design Spec: Live Activity Log Timeline (Sub-Proyek D)

> [!NOTE]
> Dokumen ini menjelaskan spesifikasi desain untuk Sub-Proyek D: penambahan kolom baru **Live Activity Log Timeline** di bagian bawah CMS, berjejer dalam struktur 3-Kolom berdampingan dengan daftar Tamu Hadir & Belum Hadir. Setiap baris aktivitas menampilkan avatar mini (32px) foto tamu, status VIP, dan waktu kedatangan secara kronologis real-time.

---

## 1. Tujuan & Fungsionalitas Utama

1. **Live Chronological Feed**: Menyajikan rekaman visual kedatangan tamu secara berurutan waktu (tamu terbaru berada paling atas) untuk memudahkan pengawasan arus kedatangan di gerbang utama oleh Event Organizer (EO) atau Wedding Organizer (WO).
2. **Visual Mini Avatar**: Menampilkan foto asli tamu check-in dalam bentuk lingkaran kecil (32px) jika tamu telah difoto, atau menampilkan inisial nama tamu dengan warna botani jika belum difoto.
3. **Responsive 3-Column Grid Layout**: Mengubah bagian bawah CMS dari 2-Kolom (Tamu Hadir & Belum Hadir) menjadi **3-Kolom sejajar dengan rasio seimbang** untuk pemantauan data komprehensif tanpa *scroll* berlebih.

---

## 2. Struktur Komponen & Logika Data

### 2.1 Pemanfaatan State Reaktif yang Ada
Untuk memaksimalkan performa, kita akan memanfaatkan state `arrivedGuests` yang sudah ada secara reaktif. Karena kueri database pada `fetchGuests` telah diurutkan berdasarkan `arrival_time DESC` (terbaru di atas), kita dapat langsung melakukan pemotongan array untuk mengambil 15 aktivitas kedatangan terbaru:
```typescript
const timelineEvents = arrivedGuests.slice(0, 15);
```

### 2.2 Penentuan Inisial Nama Tamu (Fallback Avatar)
Jika tamu belum sempat difoto (`photo_url` bernilai null), kita akan membuat fungsi penentu inisial nama tamu (mengambil huruf depan kata pertama dan kata kedua):
```typescript
const getInitials = (name: string) => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
};
```

---

## 3. Desain Antarmuka (UI/UX)

### 3.1 Restrukturisasi Kolom Grid (AdminCMS.tsx)
Mengubah struktur kolom grid tabel bawah (sekitar baris 762) dari `grid lg:grid-cols-2 gap-8` menjadi:
```tsx
<div className="grid lg:grid-cols-3 gap-6">
  {/* Kolom 1: Daftar Tamu Hadir */}
  {/* Kolom 2: Daftar Belum Hadir */}
  {/* Kolom 3: Live Activity Log (Baru) */}
</div>
```

### 3.2 Desain Item Aktivitas Timeline
Setiap baris aktivitas tamu check-in di dalam log akan dihiasi garis timeline vertikal tipis di sebelah kiri dengan indikator titik di setiap item:
*   **Avatar Bulat (32px)**:
    *   Jika ada foto: `<img src={guest.photo_url} className="w-8 h-8 rounded-full object-cover border border-[#E5E1DA] shadow-sm" />`
    *   Jika tanpa foto: Lingkaran inisial warna sage lembut (`bg-[#F0F4F1] text-[#4A5D4E] flex items-center justify-center font-bold text-[10px] w-8 h-8 rounded-full`)
*   **Teks Aktivitas**:
    *   VIP: *"Bapak [Nama] (VIP) telah tiba di lokasi"* dengan lencana VIP emas kecil.
    *   Regular: *"[Nama] telah tiba di lokasi"*.
*   **Indikator Waktu**: Waktu tiba berformat jam (contoh: `12:15 WIB`) dengan ikon `Clock` berwarna hijau sage tipis.

```
============================================
           🕒 Live Activity Log
============================================
 |
 +-- ( O ) [Foto] Ahmad Naufal (VIP)
 |   Telah tiba di lokasi - 19:45 WIB
 |
 +-- ( O ) [AN] Anisa Rahma
 |   Telah tiba di lokasi - 19:42 WIB
 |
```

---

## 4. Animasi Transisi Sinematik

Setiap kali ada gerbang check-in yang berhasil menambahkan tamu baru (WebSocket push), baris aktivitas baru akan meluncur masuk dari atas secara halus dan mendorong baris-baris di bawahnya menggunakan **Framer Motion `<AnimatePresence>`** dan komponen `motion.div` untuk menciptakan efek alur aktivitas yang dinamis:
-   **Transisi Masuk**: `initial={{ opacity: 0, x: -20 }}` -> `animate={{ opacity: 1, x: 0 }}` dengan transisi pegas (*spring*).
