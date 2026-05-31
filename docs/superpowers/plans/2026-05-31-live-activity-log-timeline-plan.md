# Live Activity Log Timeline (Sub-Proyek D) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan modul kronologis kedatangan tamu (Live Activity Log) berukuran sepertiga lebar di bagian bawah CMS (3-Kolom berdampingan), menampilkan inisial atau foto tamu check-in, lencana VIP, dan waktu kedatangan secara real-time.

**Architecture:** Memanfaatkan state reaktif `arrivedGuests` yang sudah terurut berdasarkan waktu terbaru di atas, memotong 15 item teratas secara reaktif, mengimplementasikan generator inisial nama tamu jika foto kosong, dan merestrukturisasi layout grid dari 2-Kolom menjadi 3-Kolom di Admin CMS dengan animasi transisi pegas Framer Motion.

**Tech Stack:** React, TypeScript, Framer Motion (AnimatePresence, motion), Lucide Icons (Clock, Users, Sparkles), Tailwind CSS.

---

### File Structure Map

| File | Status | Tanggung Jawab |
| :--- | :--- | :--- |
| `src/pages/AdminCMS.tsx` | Modifikasi | Menambahkan fungsi utilitas inisial nama, mendefinisikan array pemotongan timeline, merubah layout grid bawah menjadi 3-Kolom, dan menyusun JSX alur log aktivitas ber-avatar dan beranimasi Framer Motion. |

---

### Task 1: Initials Helper & Timeline Slice Logic Setup

**Files:**
- Modify: `src/pages/AdminCMS.tsx`

- [ ] **Step 1: Tambahkan fungsi utilitas getInitials**
  Letakkan fungsi `getInitials` di bagian luar komponen `AdminCMS` (misalnya di bagian paling bawah atau di bawah konstanta ucapan `QUICK_WISHES_TEMPLATES`).

  ```typescript
  const getInitials = (name: string) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return parts[0].substring(0, 2).toUpperCase();
  };
  ```

- [ ] **Step 2: Tambahkan logika pemotongan timeline kronologis**
  Temukan bagian kalkulasi dasbor analitik reaktif di komponen `AdminCMS` (sekitar baris 520-530, di bawah `paxPercent`).

  Tambahkan baris berikut untuk mengambil 15 check-in terbaru secara reaktif dari state yang sudah ada:
  ```typescript
    // Slice 15 kedatangan tamu terbaru secara kronologis untuk timeline
    const timelineEvents = arrivedGuests.slice(0, 15);
  ```

- [ ] **Step 3: Verifikasi kompilasi**
  Run: `npm run build`
  Expected: PASS (Gunakan variabel sementara jika ada unused error sebelum UI diintegrasikan pada tugas berikutnya).

---

### Task 2: Convert Tables Grid Layout from 2-Column to 3-Column

**Files:**
- Modify: `src/pages/AdminCMS.tsx`

- [ ] **Step 1: Modifikasi kolom pembungkus tabel tamu**
  Temukan baris pembuka pembungkus tabel tamu hadir & belum hadir di bagian bawah (sekitar baris 780).
  Cari baris kontainer grid asli:
  ```tsx
            <div className="grid lg:grid-cols-2 gap-8">
  ```

  Ganti pembungkus grid tersebut menjadi 3 kolom seimbang:
  ```tsx
            <div className="grid lg:grid-cols-3 gap-6 items-start">
  ```

- [ ] **Step 2: Uji build kompilasi TypeScript**
  Run: `npm run build`
  Expected: PASS

---

### Task 3: Implement Live Activity Log Timeline UI

**Files:**
- Modify: `src/pages/AdminCMS.tsx`

- [ ] **Step 1: Pasang kolom ke-3 (Timeline) di dalam grid tabel**
  Temukan akhir dari kolom ke-2 tabel tamu belum hadir (Pending Guests Table) di sekitar baris 850. Kolom kedua ditutup dengan `</div>` penutup, tepat sebelum penutup grid utama dan kontainer halaman.

  Cari baris kode penutup kolom ke-2 tabel pending:
  ```tsx
                </div>
              </div>
            </div>
            {/* Tutup Grid pembungkus */}
          </div>
  ```

  Sisipkan kode komponen **Live Activity Log** berikut tepat di bawah penutup kolom tabel pending (sebelum penutup grid):

  ```tsx
              {/* Live Activity Log Timeline Table (Kolom ke-3) */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E1DA] flex flex-col min-h-[464px]">
                <div className="flex items-center justify-between mb-6 border-b border-[#F3F1ED] pb-3">
                  <div className="flex items-center gap-2 text-[#4A5D4E]">
                    <Clock size={18} />
                    <h2 className="font-medium font-serif">Aktivitas Kedatangan</h2>
                  </div>
                  <span className="bg-[#FEF5F1] text-[#C17E61] px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider animate-pulse">
                    LIVE FEED
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[380px] pr-1 custom-scrollbar relative pl-3 border-l border-dashed border-[#E5E1DA]/80 space-y-4">
                  {timelineEvents.length > 0 ? (
                    <AnimatePresence initial={false}>
                      {timelineEvents.map((g) => (
                        <motion.div
                          key={g.id}
                          initial={{ opacity: 0, y: -15, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 100, damping: 12 }}
                          className="relative flex items-start gap-3 group"
                        >
                          {/* Timeline bullet indicator */}
                          <div className="absolute -left-[17px] top-3.5 w-2.5 h-2.5 rounded-full bg-[#4A5D4E] border border-white group-hover:bg-[#C17E61] transition-colors duration-300" />
                          
                          {/* Mini Avatar Bulat (32px) */}
                          <div className="flex-shrink-0">
                            {g.photo_url ? (
                              <img 
                                src={g.photo_url} 
                                alt={g.name} 
                                className="w-8 h-8 rounded-full object-cover border border-[#E5E1DA] shadow-sm hover:scale-105 transition-transform cursor-zoom-in" 
                                onClick={() => setLightboxGuest(g)}
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-[#F0F4F1] flex items-center justify-center text-[10px] font-serif font-bold text-[#4A5D4E] border border-[#E5E1DA]">
                                {getInitials(g.name)}
                              </div>
                            )}
                          </div>

                          {/* Log Text & Details */}
                          <div className="flex-1 min-w-0 space-y-0.5">
                            <p className="text-xs text-gray-700 leading-tight">
                              <span className="font-serif font-bold text-[#4A5D4E]">{g.name}</span>
                              {g.is_vip && (
                                <span className="bg-amber-100 text-amber-800 text-[8px] px-1 py-0.2 rounded font-bold border border-amber-200 ml-1.5 inline-block align-middle">
                                  VIP
                                </span>
                              )}
                              <span className="text-gray-400 font-sans ml-1 text-[10px]">telah tiba di lokasi.</span>
                            </p>
                            <span className="text-[9px] text-[#8C9A8E] flex items-center gap-1 font-medium">
                              <Clock size={10} /> {g.arrival_time ? new Date(g.arrival_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'} WIB
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  ) : (
                    <div className="text-center py-12 text-[#8C9A8E] -ml-3">
                      <p className="text-xs">Belum ada aktivitas kedatangan tamu.</p>
                    </div>
                  )}
                </div>
              </div>
  ```

- [ ] **Step 2: Uji produksi kompilasi proyek akhir**
  Run: `npm run build`
  Expected: PASS build produksi Vite 100% sukses tanpa ada error.
