# Live Projector Slideshow & Real-Time Welcome Interruption (Sub-Proyek B) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Membuat halaman proyektor `/projector` (Live Greeting & Photo Wall) beresolusi layar lebar (16:9) yang menampilkan *slideshow* interaktif foto tamu dan ucapan selamatnya berestetika Polaroid, dihiasi animasi guguran bunga, serta memicu interupsi real-time sambutan *"Selamat Datang"* secara instan via WebSockets ketika tamu check-in.

**Architecture:** Menggunakan `@supabase/supabase-js` Real-time Channel untuk mendengarkan perubahan data check-in tamu, menghentikan sementara timer slideshow putaran normal (8 detik per tamu), menampilkan halaman selaan selamat datang fullscreen teranimasi emas mewah selama 12 detik, dan memasukkan tamu baru tersebut ke urutan awal rotasi sebelum mengaktifkan kembali timer normal.

**Tech Stack:** React, TypeScript, Supabase Realtime Client, Framer Motion, Lucide Icons (Camera, Clock, Heart, Sparkles), Tailwind CSS.

---

### File Structure Map

| File | Status | Tanggung Jawab |
| :--- | :--- | :--- |
| `src/pages/ProjectorSlideshow.tsx` | Pembuatan | Membuat halaman visual proyektor utama dengan frame Polaroid, animasi kelopak bunga gugur, transisi slide Framer Motion, serta logika WebSocket penyelaan real-time. |
| `src/App.tsx` | Modifikasi | Mengimpor komponen halaman baru `ProjectorSlideshow` dan mendaftarkan rute navigasi `/projector` di baris `<Routes>`. |

---

### Task 1: Create ProjectorSlideshow Component

**Files:**
- Create: `src/pages/ProjectorSlideshow.tsx`

- [ ] **Step 1: Tulis kode lengkap berkas ProjectorSlideshow.tsx**
  Buat berkas baru di `src/pages/ProjectorSlideshow.tsx` dengan implementasi lengkap, tanpa ada TBD/TODO, terintegrasi penuh dengan `FloatingPetals`, `FloralDecor`, dan animasi `framer-motion`:

  ```tsx
  import { useState, useEffect, useRef } from 'react';
  import { supabase } from '../lib/supabase';
  import { motion, AnimatePresence } from 'framer-motion';
  import FloatingPetals from '../components/FloatingPetals';
  import FloralDecor from '../components/FloralDecor';
  import { Camera, Clock, Heart, Sparkles } from 'lucide-react';

  interface Guest {
    id: string;
    name: string;
    arrival_time: string;
    is_vip: boolean;
    photo_url: string;
    message: string;
  }

  export const ProjectorSlideshow = () => {
    const [guests, setGuests] = useState<Guest[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [interruptedGuest, setInterruptedGuest] = useState<Guest | null>(null);
    const [isInterrupted, setIsInterrupted] = useState(false);
    const [loading, setLoading] = useState(true);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const welcomeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const fetchArrivedGuests = async () => {
      try {
        const { data, error } = await supabase
          .from('guests')
          .select('id, name, arrival_time, is_vip, photo_url, message')
          .eq('has_arrived', true)
          .not('photo_url', 'is', null)
          .order('arrival_time', { ascending: false });

        if (error) throw error;
        setGuests(data || []);
      } catch (err) {
        console.error("Gagal mengambil data tamu hadir:", err);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchArrivedGuests();

      // Subscribe real-time ke tabel guests
      const channel = supabase
        .channel('projector-live-changes')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'guests' },
          (payload: any) => {
            const oldGuest = payload.old;
            const newGuest = payload.new;

            // Pemicu interupsi: has_arrived berubah dari false ke true DAN memiliki photo_url
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

    // Timer slideshow normal (8 detik)
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
      }, 8000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }, [loading, isInterrupted, guests.length]);

    const triggerNewArrivalWelcome = (newGuest: Guest) => {
      setInterruptedGuest(newGuest);
      setIsInterrupted(true);

      if (welcomeTimeoutRef.current) clearTimeout(welcomeTimeoutRef.current);

      // Masukkan tamu baru ke daftar paling depan slideshow agar langsung muncul berikutnya
      setGuests((prev) => {
        const filtered = prev.filter(g => g.id !== newGuest.id);
        return [newGuest, ...filtered];
      });
      setCurrentIndex(0);

      // Sambutan tampil selama 12 detik
      welcomeTimeoutRef.current = setTimeout(() => {
        setIsInterrupted(false);
        setInterruptedGuest(null);
      }, 12000);
    };

    const currentGuest = guests[currentIndex];

    if (loading) {
      return (
        <div className="min-h-screen bg-[#1B2B1E] flex flex-col items-center justify-center text-[#F3F1ED] font-serif">
          <Camera size={48} className="animate-pulse mb-4 text-[#C17E61]" />
          <p className="text-lg tracking-widest animate-pulse uppercase">Memuat Galeri Live Proyektor...</p>
        </div>
      );
    }

    return (
      <div className="relative min-h-screen bg-[#1B2B1E] overflow-hidden flex items-center justify-center p-8 select-none">
        {/* Dynamic Flying Flower Petals */}
        <FloatingPetals />

        {/* Botanical Gold Ornaments in Corners */}
        <FloralDecor />

        <AnimatePresence mode="wait">
          {!isInterrupted ? (
            // NORMAL SLIDESHOW DISPLAY
            currentGuest ? (
              <motion.div
                key={currentGuest.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="w-full max-w-6xl grid md:grid-cols-12 gap-12 items-center z-10"
              >
                {/* Polaroid Frame (Left half) */}
                <div className="md:col-span-6 flex justify-center">
                  <motion.div 
                    initial={{ rotate: -5 }}
                    animate={{ rotate: currentIndex % 2 === 0 ? 2 : -1.5 }}
                    className="bg-[#FDFBF7] p-6 pb-14 rounded-xl shadow-2xl border border-white/10 max-w-md w-full relative flex flex-col items-center justify-center"
                  >
                    <div className="aspect-square w-full overflow-hidden bg-gray-50 border border-gray-100 shadow-inner">
                      <img 
                        src={currentGuest.photo_url} 
                        alt={currentGuest.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h2 className="font-serif italic text-3xl text-[#4A5D4E] mt-8 text-center truncate max-w-[280px]">
                      {currentGuest.name}
                    </h2>
                    <span className="absolute bottom-4 right-6 text-[10px] tracking-widest text-[#8C9A8E] flex items-center gap-1 uppercase font-sans font-medium">
                      <Clock size={10} /> Tiba pukul {currentGuest.arrival_time ? new Date(currentGuest.arrival_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </span>
                  </motion.div>
                </div>

                {/* Wishes Text Panel (Right half) */}
                <div className="md:col-span-6 text-center md:text-left space-y-6 flex flex-col justify-center px-4 relative">
                  <span className="absolute -top-16 -left-4 font-serif text-[180px] text-[#4A5D4E]/10 select-none pointer-events-none font-bold leading-none">“</span>
                  <p className="font-serif italic text-2xl md:text-4xl text-[#F3F1ED] leading-relaxed max-w-xl z-10 font-medium">
                    {currentGuest.message || "Terima kasih banyak atas kehadiran dan doa restu Anda di hari bahagia kami."}
                  </p>
                  <div className="flex items-center gap-2 text-[#C17E61] justify-center md:justify-start mt-2">
                    <Heart size={16} fill="currentColor" />
                    <span className="font-serif text-sm tracking-wider text-[#C17E61]/90 uppercase font-medium">Wedding wishes</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="text-center text-[#F3F1ED]/50 font-serif tracking-widest z-10 animate-pulse">
                <Camera size={32} className="mx-auto mb-2 opacity-40" />
                Belum ada foto tamu hadir berfoto.
              </div>
            )
          ) : (
            // NEW ARRIVAL WELCOME INTERRUPTION SCREEN
            interruptedGuest && (
              <motion.div
                key="welcome-screen"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="fixed inset-0 bg-black/75 z-40 border-[12px] border-amber-500/10 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="max-w-4xl w-full space-y-8 z-50">
                  <motion.div
                    initial={{ scale: 0.4, y: -80, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 90, damping: 12, delay: 0.2 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-center text-amber-400 gap-1.5 animate-bounce mb-2">
                      <Sparkles size={28} />
                      <span className="text-sm font-sans tracking-[0.3em] uppercase font-bold">New Check-In</span>
                      <Sparkles size={28} />
                    </div>
                    <h1 className="text-5xl md:text-7xl font-serif text-amber-400 font-extrabold tracking-wide uppercase">
                      Selamat Datang
                    </h1>
                    <p className="text-2xl md:text-3xl text-white font-serif tracking-wide italic">
                      {interruptedGuest.name}
                      {interruptedGuest.is_vip && (
                        <span className="bg-amber-400 text-amber-950 text-[10px] px-3 py-1 rounded-full font-extrabold shadow-md inline-block ml-3 align-middle font-sans not-italic uppercase tracking-widest">
                          VIP Guest
                        </span>
                      )}
                    </p>
                  </motion.div>

                  <div className="grid md:grid-cols-12 gap-8 items-center pt-4">
                    {/* Polaroid Pop Reveal */}
                    <div className="md:col-span-6 flex justify-center">
                      <motion.div
                        initial={{ scale: 0.5, rotate: -25, opacity: 0 }}
                        animate={{ scale: 1.05, rotate: -3, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 80, damping: 10, delay: 0.5 }}
                        className="bg-[#FDFBF7] p-5 pb-12 rounded-xl shadow-2xl border border-white/20 w-full max-w-sm"
                      >
                        <div className="aspect-square w-full overflow-hidden bg-gray-50 border border-gray-100 shadow-inner">
                          <img 
                            src={interruptedGuest.photo_url} 
                            alt={interruptedGuest.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h3 className="font-serif italic text-2xl text-[#4A5D4E] mt-6 text-center truncate">
                          {interruptedGuest.name}
                        </h3>
                      </motion.div>
                    </div>

                    {/* Typewriter wishes display */}
                    <motion.div
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ duration: 0.8, delay: 0.9 }}
                      className="md:col-span-6 text-center md:text-left space-y-4 px-4 flex flex-col justify-center"
                    >
                      <p className="font-serif italic text-xl md:text-3xl text-[#F3F1ED]/95 leading-relaxed max-w-md font-medium">
                        "{interruptedGuest.message || "Terima kasih banyak atas kehadiran dan doa restu Anda di hari bahagia kami."}"
                      </p>
                      <span className="text-xs font-sans tracking-[0.2em] text-[#C17E61] uppercase font-bold flex items-center gap-1 justify-center md:justify-start">
                        <Heart size={12} fill="currentColor" /> Doa & Harapan Tamu
                      </span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )
          )}
        </AnimatePresence>
      </div>
    );
  };
  ```

- [ ] **Step 2: Uji kompilasi mandiri**
  Run: `npm run build`
  Expected: PASS

- [ ] **Step 3: Commit**
  ```bash
  git add src/pages/ProjectorSlideshow.tsx
  git commit -m "feat: create ProjectorSlideshow component with Polaroid layouts and Websocket welcome sync"
  ```

---

### Task 2: Page Route Setup in App.tsx

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Impor komponen halaman baru ProjectorSlideshow**
  Tambahkan impor `ProjectorSlideshow` di bagian atas berkas `src/App.tsx`.

  Cari:
  ```typescript
  import { AdminCMS } from './pages/AdminCMS'
  ```

  Tambahkan di bawahnya:
  ```typescript
  import { ProjectorSlideshow } from './pages/ProjectorSlideshow'
  ```

- [ ] **Step 2: Daftarkan rute baru /projector**
  Temukan blok `<Routes>` di dalam `App.tsx` dan tambahkan rute `/projector` di dalamnya.

  Cari:
  ```tsx
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminCMS />
            </ProtectedRoute>
          } />
  ```

  Tambahkan rute di bawahnya (di luar ProtectedRoute karena halaman proyektor dirancang publik agar mudah diproyeksikan langsung di laptop monitor panitia aula):
  ```tsx
          <Route path="/projector" element={<ProjectorSlideshow />} />
  ```

- [ ] **Step 3: Verifikasi build kompilasi proyek terintegrasi**
  Run: `npm run build`
  Expected: PASS build produksi Vite 100% sukses tanpa ada error.

- [ ] **Step 4: Commit**
  ```bash
  git add src/App.tsx
  git commit -m "feat: register projector slideshow page route in App.tsx"
  ```

---

### Task 3: Supabase Dashboard Realtime Configuration Instructions

**Files:**
- Test: Manual config check

- [ ] **Step 1: Aktifkan Realtime di Supabase Dashboard**
  1. Buka dashboard proyek **Supabase** Anda di browser.
  2. Klik ikon menu **Database** (ikon silinder database) di sidebar kiri.
  3. Buka submenu **Replication**.
  4. Cari baris publikasi bernama **supabase_realtime** lalu klik **Edit**.
  5. Klik tombol sakelar (*toggle*) di samping nama tabel **guests** agar berada dalam status aktif (berwarna hijau). Hal ini mengizinkan broadcast WebSocket instan untuk kueri Postgres UPDATE pada tabel tersebut.
  6. Simpan perubahan.
  Expected: Fitur Realtime berhasil diaktifkan untuk tabel guests.
