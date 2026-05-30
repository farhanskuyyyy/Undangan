# Dashboard Analytics & Real-Time Sync Multi-Gate (Sub-Proyek C) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan 4 kartu dasbor analitik visual di bagian paling atas CMS menggunakan diagram lingkaran **SVG Progress Rings** berputar, serta mengaktifkan sinkronisasi asinkron **Multi-Gate** instan menggunakan WebSocket Supabase lengkap dengan pop-up feed notifikasi melayang (*Toast Notifications*) saat tamu gerbang lain check-in.

**Architecture:** Memanfaatkan data tamu di memori browser (`arrivedGuests` dan `pendingGuests`) untuk secara reaktif mengomputasi persentase visual pada lingkaran SVG, menyematkan WebSockets subscription pada tabel database tamu di Admin CMS untuk mendeteksi pembaruan gerbang check-in lain, memicu pembaruan segar daftar tamu lokal, serta menambahkan pesan notifikasi ber-timer 4 detik ke antrean `toasts`.

**Tech Stack:** React, TypeScript, Supabase Realtime client, Lucide Icons (Users, Gift, Award, TrendingUp, Sparkles, X), Tailwind CSS.

---

### File Structure Map

| File | Status | Tanggung Jawab |
| :--- | :--- | :--- |
| `src/pages/AdminCMS.tsx` | Modifikasi | Mengimplementasikan logika perhitungan data reaktif, menyisipkan 4 kartu dasbor analitik SVG Progress Ring di bagian atas, mengaktifkan channel WebSocket real-time Supabase, serta mendesain antarmuka feed notifikasi melayang di pojok kanan bawah. |

---

### Task 1: Reactive Analytics Calculations Setup

**Files:**
- Modify: `src/pages/AdminCMS.tsx`

- [x] **Step 1: Sisipkan kalkulasi ringkasan data di dalam komponen AdminCMS**
  Temukan bagian komputasi filter daftar tamu di dalam komponen `AdminCMS` (sekitar baris 350-360, tepat di bawah perhitungan paginasi galeri tamu).

  Sisipkan baris logika kalkulasi persentase dan pax reaktif berikut:

  ```typescript
    // TOTAL QUANTITY CALCULATIONS
    const totalGuestsCount = arrivedGuests.length + pendingGuests.length;

    // 1. Rasio Kedatangan Tamu (Undangan Check-in)
    const arrivalPercent = totalGuestsCount > 0 ? arrivedGuests.length / totalGuestsCount : 0;

    // 2. Rasio Souvenir Terbagi (dibanding tamu hadir)
    const souvenirPercent = arrivedGuests.length > 0 
      ? arrivedGuests.filter(g => g.souvenir_taken).length / arrivedGuests.length 
      : 0;

    // 3. Rasio Kehadiran VIP (VIP Hadir dibanding total VIP)
    const arrivedVIPsCount = arrivedGuests.filter(g => g.is_vip).length;
    const totalVIPsCount = arrivedVIPsCount + pendingGuests.filter(g => g.is_vip).length;
    const vipArrivalPercent = totalVIPsCount > 0 ? arrivedVIPsCount / totalVIPsCount : 0;

    // 4. Estimasi Total Pax Hadir (Porsi Katering)
    const totalPaxArrived = arrivedGuests.reduce((acc, g) => acc + (g.attendance_count || 1), 0);
    const maxExpectedPax = totalGuestsCount * 2; // Asumsi rata-rata maksimal 2 pax per undangan
    const paxPercent = maxExpectedPax > 0 ? totalPaxArrived / maxExpectedPax : 0;
  ```

- [x] **Step 2: Uji build kompilasi TypeScript**
  Run: `npm run build`
  Expected: PASS (Pastikan tidak ada error kompilasi terkait unused variables).

- [x] **Step 3: Commit**
  ```bash
  git add src/pages/AdminCMS.tsx
  git commit -m "feat: implement reactive analytics computed state logic for dashboard metrics"
  ```

---

### Task 2: Implement 4 Circle Charts (SVG Rings) UI Cards

**Files:**
- Modify: `src/pages/AdminCMS.tsx`

- [x] **Step 1: Impor ikon Lucide baru untuk dasbor**
  Tambahkan ikon `TrendingUp`, `Award`, `Sparkles` ke bagian impor `lucide-react` di bagian atas berkas `src/pages/AdminCMS.tsx`.

- [x] **Step 2: Pasang kartu dasbor visual di bagian paling atas konten CMS**
  Temukan baris pembuka tag kontainer konten utama di dalam `return (...)` setelah penutup navbar / judul dasbor (sekitar baris 440-450).
  Cari baris kontainer grid asli:
  ```tsx
        <div className="grid lg:grid-cols-3 gap-8 items-start">
  ```

  Sisipkan kode JSX 4 kartu analitik ber-SVG Progress Ring berikut **tepat di atas** baris `grid lg:grid-cols-3 gap-8 items-start` tersebut:

  ```tsx
        {/* Dashboard Analytics Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Card 1: Rasio Kehadiran */}
          <div className="bg-white p-4 rounded-2xl border border-[#E5E1DA] shadow-sm flex items-center justify-between group hover:shadow transition-all duration-300">
            <div className="space-y-1">
              <span className="text-[10px] text-[#8C9A8E] uppercase tracking-wider font-semibold flex items-center gap-1">
                <Users size={12} /> Kehadiran Tamu
              </span>
              <p className="text-xl font-bold text-[#4A5D4E] font-serif">{arrivedGuests.length} <span className="text-xs text-gray-400 font-sans font-normal">/ {totalGuestsCount}</span></p>
              <p className="text-[10px] text-[#8C9A8E]">Rasio: {(arrivalPercent * 100).toFixed(1)}%</p>
            </div>
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="28" cy="28" r="24" stroke="#F3F1ED" strokeWidth="4" fill="transparent" />
                <circle 
                  cx="28" 
                  cy="28" 
                  r="24" 
                  stroke="#4A5D4E" 
                  strokeWidth="4" 
                  fill="transparent" 
                  strokeDasharray="150.8"
                  strokeDashoffset={150.8 * (1 - arrivalPercent)}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-[#4A5D4E]">{(arrivalPercent * 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* Card 2: Pembagian Souvenir */}
          <div className="bg-white p-4 rounded-2xl border border-[#E5E1DA] shadow-sm flex items-center justify-between group hover:shadow transition-all duration-300">
            <div className="space-y-1">
              <span className="text-[10px] text-[#8C9A8E] uppercase tracking-wider font-semibold flex items-center gap-1">
                <Gift size={12} /> Souvenir Terbagi
              </span>
              <p className="text-xl font-bold text-[#4A5D4E] font-serif">
                {arrivedGuests.filter(g => g.souvenir_taken).length} <span className="text-xs text-gray-400 font-sans font-normal">/ {arrivedGuests.length}</span>
              </p>
              <p className="text-[10px] text-[#8C9A8E]">Rasio: {(souvenirPercent * 100).toFixed(1)}%</p>
            </div>
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="28" cy="28" r="24" stroke="#F3F1ED" strokeWidth="4" fill="transparent" />
                <circle 
                  cx="28" 
                  cy="28" 
                  r="24" 
                  stroke="#C17E61" 
                  strokeWidth="4" 
                  fill="transparent" 
                  strokeDasharray="150.8"
                  strokeDashoffset={150.8 * (1 - souvenirPercent)}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-[#C17E61]">{(souvenirPercent * 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* Card 3: Kehadiran VIP */}
          <div className="bg-white p-4 rounded-2xl border border-[#E5E1DA] shadow-sm flex items-center justify-between group hover:shadow transition-all duration-300">
            <div className="space-y-1">
              <span className="text-[10px] text-[#8C9A8E] uppercase tracking-wider font-semibold flex items-center gap-1">
                <Award size={12} /> Kehadiran VIP
              </span>
              <p className="text-xl font-bold text-[#4A5D4E] font-serif">
                {arrivedVIPsCount} <span className="text-xs text-gray-400 font-sans font-normal">/ {totalVIPsCount}</span>
              </p>
              <p className="text-[10px] text-[#8C9A8E]">VIP Tiba: {(vipArrivalPercent * 100).toFixed(1)}%</p>
            </div>
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="28" cy="28" r="24" stroke="#F3F1ED" strokeWidth="4" fill="transparent" />
                <circle 
                  cx="28" 
                  cy="28" 
                  r="24" 
                  stroke="#D97706" 
                  strokeWidth="4" 
                  fill="transparent" 
                  strokeDasharray="150.8"
                  strokeDashoffset={150.8 * (1 - vipArrivalPercent)}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-amber-600">{(vipArrivalPercent * 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* Card 4: Total Pax Hadir */}
          <div className="bg-white p-4 rounded-2xl border border-[#E5E1DA] shadow-sm flex items-center justify-between group hover:shadow transition-all duration-300">
            <div className="space-y-1">
              <span className="text-[10px] text-[#8C9A8E] uppercase tracking-wider font-semibold flex items-center gap-1">
                <TrendingUp size={12} /> Total Pax (Tamu)
              </span>
              <p className="text-xl font-bold text-[#4A5D4E] font-serif">
                {totalPaxArrived} <span className="text-xs text-gray-400 font-sans font-normal">pax</span>
              </p>
              <p className="text-[10px] text-[#8C9A8E]">Estimasi Porsi Hadir</p>
            </div>
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="28" cy="28" r="24" stroke="#F3F1ED" strokeWidth="4" fill="transparent" />
                <circle 
                  cx="28" 
                  cy="28" 
                  r="24" 
                  stroke="#3B82F6" 
                  strokeWidth="4" 
                  fill="transparent" 
                  strokeDasharray="150.8"
                  strokeDashoffset={150.8 * (1 - paxPercent)}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-blue-600">{totalPaxArrived}</span>
            </div>
          </div>
        </div>
  ```

- [x] **Step 3: Uji build kompilasi proyek terintegrasi**
  Run: `npm run build`
  Expected: PASS

- [x] **Step 4: Commit**
  ```bash
  git add src/pages/AdminCMS.tsx
  git commit -m "feat: render 4 interactive SVG progress ring analytics cards at the top of CMS"
  ```

---

### Task 3: Real-Time Sync & Toast Setup

**Files:**
- Modify: `src/pages/AdminCMS.tsx`

- [ ] **Step 1: Tambahkan antrean state untuk Toasts**
  Tambahkan definisi antrean state `toasts` di bagian atas komponen `AdminCMS` (sekitar baris 28-32, di bawah state `wishesText`).

  ```typescript
    const [toasts, setToasts] = useState<any[]>([])
  ```

- [ ] **Step 2: Hubungkan jalur WebSockets untuk Sinkronisasi Gerbang**
  Sisipkan `useEffect` hook langganan real-time database di komponen `AdminCMS` (sekitar baris 170, di samping useEffect cleanup kamera).

  ```typescript
    useEffect(() => {
      // Jalur WebSocket untuk mendengarkan check-in gerbang lain
      const channel = supabase
        .channel('dashboard-realtime-sync')
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'guests' },
          (payload: any) => {
            const oldGuest = payload.old
            const newGuest = payload.new
            
            // Gerbang lain menandai tamu hadir
            if ((!oldGuest || !oldGuest.has_arrived) && newGuest.has_arrived) {
              // 1. Tarik ulang data segar agar tabel daftar tamu sinkron instan
              fetchGuests()
              
              // 2. Tambahkan ke antrean notifikasi melayang
              const newToast = {
                id: newGuest.id,
                name: newGuest.name,
                is_vip: newGuest.is_vip,
                arrival_time: newGuest.arrival_time
              }
              
              setToasts((prev) => {
                // Batasi maksimal 4 notifikasi pop-up bertumpuk agar tidak menutupi layar
                const truncated = prev.slice(0, 3)
                return [newToast, ...truncated]
              })
              
              // 3. Bersihkan notifikasi otomatis setelah 4 detik
              setTimeout(() => {
                setToasts((prev) => prev.filter(t => t.id !== newGuest.id))
              }, 4000)
            }
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }, [])
  ```

- [ ] **Step 3: Uji kompilasi mandiri**
  Run: `npm run build`
  Expected: PASS (Abaikan jika ada unused variables terkait toasts linter sebelum UI dipasang).

- [ ] **Step 4: Commit**
  ```bash
  git add src/pages/AdminCMS.tsx
  git commit -m "feat: add real-time postgres sync listener and toasts state queue"
  ```

---

### Task 4: Toast Notifications Feed Layout

**Files:**
- Modify: `src/pages/AdminCMS.tsx`

- [ ] **Step 1: Sisipkan UI Feed Notifikasi Melayang di bagian bawah halaman**
  Kita letakkan kontainer melayang `toasts` ini di baris paling bawah, tepat di samping JSX Lightbox Modal (sebelum tag `)` penutup return komponen).

  Cari tag penutup modal lightbox (sekitar baris 830+):
  ```tsx
        {/* Modal Lightbox Zoom Foto Tamu */}
        ...
        )}
  ```

  Sisipkan kode JSX antrean notifikasi melayang di bawahnya:

  ```tsx
        {/* Toast Real-time Check-In Notifications Feed */}
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className="bg-white/95 backdrop-blur-md border border-[#E5E1DA] p-4 rounded-xl shadow-lg flex items-start gap-3 pointer-events-auto w-full select-none"
              >
                <div className={`p-2 rounded-lg ${t.is_vip ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-[#F0F4F1] text-[#4A5D4E]'}`}>
                  <Sparkles size={16} className={t.is_vip ? 'animate-pulse' : ''} />
                </div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-serif font-bold text-gray-800">{t.name}</span>
                    {t.is_vip && (
                      <span className="bg-amber-400 text-amber-950 text-[8px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                        VIP
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-gray-500">Baru saja check-in di pintu gerbang.</p>
                  <span className="text-[9px] text-gray-400 flex items-center gap-1 font-medium">
                    <Clock size={10} /> Tiba pukul {t.arrival_time ? new Date(t.arrival_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                  </span>
                </div>
                <button
                  onClick={() => setToasts((prev) => prev.filter(toast => toast.id !== t.id))}
                  className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full transition-all"
                >
                  <X size={12} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
  ```

- [ ] **Step 2: Tambahkan AnimatePresence ke impor framer-motion**
  Impor `AnimatePresence` dan `motion` dari `framer-motion` di bagian atas berkas `src/pages/AdminCMS.tsx`.

  Cari baris impor:
  ```typescript
  import { useState, useEffect, useRef } from 'react'
  ```

  Tambahkan di bawahnya:
  ```typescript
  import { motion, AnimatePresence } from 'framer-motion'
  ```

- [ ] **Step 3: Uji produksi kompilasi proyek akhir**
  Run: `npm run build`
  Expected: PASS build produksi Vite 100% sukses tanpa ada error.

- [ ] **Step 4: Commit**
  ```bash
  git add src/pages/AdminCMS.tsx
  git commit -m "feat: render live toast check-in notifications feed using framer-motion and Lucide"
  ```
