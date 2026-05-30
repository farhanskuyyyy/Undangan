# Design Spec: Halaman Proyektor Slideshow & Interupsi Tamu Baru (Sub-Proyek B)

> [!NOTE]
> Dokumen ini menjelaskan spesifikasi desain untuk Sub-Proyek B: pembuatan halaman khusus proyektor `/projector` (Live Greeting & Photo Wall) yang memutar slideshow foto tamu hadir dengan estetik Polaroid, guguran bunga `FloatingPetals`, dan fitur interupsi real-time instan saat ada tamu check-in baru berbasis Supabase WebSockets.

---

## 1. Tujuan & Fungsionalitas Utama

1. **Live Slideshow Wall**: Halaman layar lebar (16:9 widescreen) untuk diproyeksikan ke layar utama aula pernikahan yang menampilkan visual tamu-tamu hadir, nama, dan ucapan selamat mereka.
2. **Polaroid & Floral Aesthetic**: Desain visual klasik romantis bertema alam dengan kartu foto Polaroid, animasi kelopak bunga jatuh (`FloatingPetals`), dan dekorasi botanical sudut (`FloralDecor`).
3. **Real-time Interruption**: Mendeteksi check-in tamu baru secara instan (di bawah 500ms) menggunakan WebSocket Supabase. Layar otomatis menyela slideshow normal untuk menampilkan ucapan penyambutan mewah *"Selamat Datang"* beserta foto terbaru tamu tersebut selama 12 detik sebelum kembali memutar slideshow normal.

---

## 2. Arsitektur & Rute Navigasi

- **Rute Halaman**: `/projector`
- **Pendaftaran Rute**: Ditambahkan ke [App.tsx](file:///Users/farhanarfianto/Projects/react/Undangan/src/App.tsx).
- **Komunikasi Real-Time**: Menggunakan kueri awal tamu berfoto dari Supabase DB, lalu mendengarkan perubahan baris data tamu via kanal Supabase Postgres Changes:
  ```typescript
  supabase
    .channel('projector-live-changes')
    .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'guests' }, handleDatabaseUpdate)
    .subscribe()
  ```

---

## 3. Desain Antarmuka (UI/UX) & Layout

Halaman ini didesain berlatar belakang hijau hutan gelap (`#1B2B1E`) dengan perpaduan gradasi radial halus untuk kontras visual maksimal pada layar proyektor aula yang terang.

### 3.1 Slideshow Normal (8 Detik Per Tamu)
Layar terbagi secara asimetris menggunakan Flexbox/Grid:
- **Tampak Kiri (55% Lebar Layar)**:
  - Kartu Polaroid putih gading (`bg-[#FDFBF7] p-4 pb-12 rounded-xl shadow-2xl`) miring dengan sudut kemiringan dinamis (`rotate-2` atau `-rotate-1`).
  - Foto tamu berada di dalam bingkai persegi (`aspect-square object-cover rounded-sm`).
  - Nama tamu ditulis tebal di bagian bawah kertas foto menggunakan font gaya tulisan tangan yang artistik.
- **Tampak Kanan (45% Lebar Layar)**:
  - Tanda kutip besar transparan di latar belakang (`text-[#4A5D4E]/15`).
  - Teks ucapan selamat ditampilkan secara anggun dengan huruf Serif Miring besar (`text-3xl text-white font-serif italic leading-relaxed text-center`).
- **Elemen Dekorasi**:
  - Komponen kelopak bunga berguguran `<FloatingPetals />` dirender penuh di layar.
  - Ornamen botanical emas `<FloralDecor />` terpasang rapi di setiap sudut layar proyektor.

### 3.2 Tampilan Interupsi "Selamat Datang" (Welcome Screen Overlay - 12 Detik)
Ketika tamu baru terdeteksi:
- Slideshow dihentikan sementara (*paused*).
- Jendela hitam transparan tebal dengan **Glow Emas** menyelimuti layar (`fixed inset-0 bg-black/75 z-40 border-8 border-amber-500/20 backdrop-blur-sm`).
- Ucapan sambutan agung memantul di tengah:
  ```
  ==============================================
                 ✨ SELAMAT DATANG ✨
             Bapak / Ibu / Sdr. [Nama Tamu]
  ==============================================
                 +-------------------+
                 |     [ FOTO ]      |
                 |     POLAROID      |
                 +-------------------+
        "Terima kasih atas kehadiran & doa restunya"
  ```
- Partikel kilauan emas (glitter) menyembur dari sisi samping layar secara perlahan.

---

## 4. Logika Teknis & Implementasi Code (src/pages/ProjectorSlideshow.tsx)

### 4.1 State Management (React)
```typescript
import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { FloatingPetals } from '../components/FloatingPetals';
import { FloralDecor } from '../components/FloralDecor';
import { Camera, Clock, X, Heart } from 'lucide-react';

export const ProjectorSlideshow = () => {
  const [guests, setGuests] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [interruptedGuest, setInterruptedGuest] = useState<any>(null);
  const [isInterrupted, setIsInterrupted] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const welcomeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
```

### 4.2 Logika Pemicu Real-Time & Pemuatan Data
```typescript
  const fetchArrivedGuests = async () => {
    try {
      // Ambil tamu hadir yang memiliki foto
      const { data, error } = await supabase
        .from('guests')
        .select('id, name, arrival_time, is_vip, photo_url, message')
        .eq('has_arrived', true)
        .not('photo_url', 'is', null)
        .order('arrival_time', { ascending: false });
        
      if (error) throw error;
      setGuests(data || []);
    } catch (err) {
      console.error("Gagal memuat data tamu proyektor:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArrivedGuests();
    
    // Subscribe real-time
    const channel = supabase
      .channel('projector-live-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'guests' },
        (payload: any) => {
          const oldGuest = payload.old;
          const newGuest = payload.new;
          
          // Deteksi check-in baru dengan foto
          if ((!oldGuest || !oldGuest.has_arrived) && newGuest.has_arrived && newGuest.photo_url) {
            triggerNewArrivalWelcome(newGuest);
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
      if (timerRef.current) clearInterval(timerRef.current);
      if (welcomeTimeoutRef.current) clearTimeout(welcomeTimeoutRef.current);
    };
  }, []);
```

### 4.3 Logika Siklus Timer Slideshow & Interupsi
```typescript
  // Jalankan interval putaran normal
  useEffect(() => {
    if (loading || isInterrupted || guests.length === 0) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    
    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % guests.length);
    }, 8000); // 8 detik per tamu
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, isInterrupted, guests.length]);

  const triggerNewArrivalWelcome = (newGuest: any) => {
    // 1. Tampilkan mode interupsi
    setInterruptedGuest(newGuest);
    setIsInterrupted(true);
    
    // 2. Bersihkan timer lama jika ada
    if (welcomeTimeoutRef.current) clearTimeout(welcomeTimeoutRef.current);
    
    // 3. Masukkan tamu baru ke daftar teratas slideshow agar langsung muncul berikutnya
    setGuests((prev) => {
      const filtered = prev.filter(g => g.id !== newGuest.id);
      return [newGuest, ...filtered];
    });
    setCurrentIndex(0);
    
    // 4. Set waktu selaan 12 detik sebelum kembali normal
    welcomeTimeoutRef.current = setTimeout(() => {
      setIsInterrupted(false);
      setInterruptedGuest(null);
    }, 12000);
  };
```

---

## 5. Penanganan Kasus Khusus (Edge Cases)

1. **Tamu Tanpa Ucapan Selamat**: Jika ucapan (`message`) kosong, proyektor otomatis merender teks: *"Terima kasih banyak atas kehadiran dan doa restu Anda di hari bahagia kami."* sehingga tampilan tetap elegan tanpa kotak kosong.
2. **Koneksi Internet Meja Check-in Terputus**: Jika WebSocket terputus sesaat, Supabase Client akan otomatis menghubungkan ulang di latar belakang. Proyektor akan tetap memutar slideshow normal dari data lokal ter-cache.
3. **Mencegah Duplikasi Tampilan**: Logika `filter(g => g.id !== newGuest.id)` memastikan tamu baru tidak terduplikasi dalam putaran slideshow normal setelah status sambutan selesai.
4. **Format Waktu Kedatangan**: Waktu kedatangan dikonversi aman ke zona waktu setempat menggunakan `.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })` dengan imbuhan "WIB" di akhir baris teks.
