# Guest Photo Modal & Paginated Gallery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan fitur Modal Lightbox Zoom untuk memperbesar foto tamu saat diklik, serta Galeri Tamu Hadir yang menampilkan seluruh foto tamu dalam grid 8 item per halaman dengan navigasi paginasi di bagian bawah Admin CMS.

**Architecture:** Mengubah kueri Supabase tamu hadir untuk memuat kolom `id` dan `photo_url`, memperkenalkan state lokal baru untuk halaman galeri aktif (`galleryPage`) dan tamu terpilih di modal (`lightboxGuest`), serta menyisipkan komponen UI Modal Glassmorphism dan Grid Galeri Card berpaginasi di Admin CMS.

**Tech Stack:** React, TypeScript, Supabase Client, Lucide Icons (Eye, X, ChevronLeft, ChevronRight), Tailwind CSS.

---

### File Structure Map

| File | Status | Tanggung Jawab |
| :--- | :--- | :--- |
| `src/pages/AdminCMS.tsx` | Modifikasi | Mengubah kueri pemuatan data, menambahkan variabel state, menyisipkan JSX Modal Lightbox, dan menyisipkan Galeri Foto berpaginasi di bagian bawah. |

---

### Task 1: Update Database Select Queries in AdminCMS.tsx

**Files:**
- Modify: `src/pages/AdminCMS.tsx:20-40`

- [ ] **Step 1: Ubah select query pada fungsi fetchGuests**
  Temukan fungsi `fetchGuests` di sekitar baris 20-30. Ganti bagian pemuatan `arrivedGuests` agar mengambil juga kolom `id` dan `photo_url`.

  Cari potongan kode berikut:
  ```typescript
        const { data: arrivedData, error: arrivedError } = await supabase
          .from('guests')
          .select('name, arrival_time, is_vip')
          .eq('has_arrived', true)
          .order('arrival_time', { ascending: false })
  ```

  Ganti menjadi:
  ```typescript
        const { data: arrivedData, error: arrivedError } = await supabase
          .from('guests')
          .select('id, name, arrival_time, is_vip, photo_url')
          .eq('has_arrived', true)
          .order('arrival_time', { ascending: false })
  ```

- [ ] **Step 2: Verifikasi build kompilasi**
  Run: `npm run build`
  Expected: PASS tanpa error TypeScript.

- [ ] **Step 3: Commit**
  ```bash
  git add src/pages/AdminCMS.tsx
  git commit -m "feat: include id and photo_url in arrived guests supabase fetch query"
  ```

---

### Task 2: Imports & State Variables Setup

**Files:**
- Modify: `src/pages/AdminCMS.tsx`

- [ ] **Step 1: Tambahkan Lucide icons baru**
  Tambahkan icon `Eye`, `X`, `ChevronLeft`, dan `ChevronRight` pada impor `lucide-react` di bagian atas berkas `src/pages/AdminCMS.tsx`.

  Cari baris impor:
  ```typescript
  import { CheckCircle, XCircle, Gift, User, ScanLine, Clock, Users, Search, Camera, Image, Upload, LogOut, Trash2, Check, RefreshCw } from 'lucide-react'
  ```

  Ubah menjadi:
  ```typescript
  import { CheckCircle, XCircle, Gift, User, ScanLine, Clock, Users, Search, Camera, Image, Upload, LogOut, Trash2, Check, RefreshCw, Eye, X, ChevronLeft, ChevronRight } from 'lucide-react'
  ```

- [ ] **Step 2: Tambahkan state variables baru**
  Letakkan state `galleryPage` dan `lightboxGuest` di dalam komponen `AdminCMS`, tepat di bawah state kamera yang sudah ada (sekitar baris 23-28).

  ```typescript
    const [galleryPage, setGalleryPage] = useState(1)
    const [lightboxGuest, setLightboxGuest] = useState<any>(null)
  ```

- [ ] **Step 3: Verifikasi kompilasi**
  Run: `npm run build`
  Expected: PASS (Pastikan untuk mereferensikan variabel sementara jika terjadi error linter tentang unused variables sebelum UI selesai diintegrasikan).

- [ ] **Step 4: Commit**
  ```bash
  git add src/pages/AdminCMS.tsx
  git commit -m "feat: add gallery page and lightbox states and import Lucide icons"
  ```

---

### Task 3: Lightbox Modal UI & Handlers

**Files:**
- Modify: `src/pages/AdminCMS.tsx`

- [ ] **Step 1: Tambahkan aksi klik zoom pada foto di Kartu Detail Tamu**
  Ubah kontainer foto yang sudah tersimpan agar ketika diklik akan membuka Modal Lightbox, serta tambahkan ikon "Eye" untuk memperjelas fungsionalitas zoom.

  Temukan potongan kode berikut di sekitar baris 680 (State 3: Foto Sudah Tersimpan):
  ```tsx
                        <div className="relative aspect-square w-full max-w-[240px] mx-auto overflow-hidden rounded-xl border-2 border-[#E5E1DA] shadow-md group">
                          <img 
                            src={guest.photo_url} 
                            alt={`Foto ${guest.name}`} 
                            className="w-full h-full object-cover" 
                          />
                          <button
                            onClick={deletePhoto}
                            disabled={uploadingPhoto}
                            className="absolute bottom-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all shadow-md active:scale-95"
                            title="Hapus Foto"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
  ```

  Ganti dengan:
  ```tsx
                        <div className="relative aspect-square w-full max-w-[240px] mx-auto overflow-hidden rounded-xl border-2 border-[#E5E1DA] shadow-md group">
                          <img 
                            src={guest.photo_url} 
                            alt={`Foto ${guest.name}`} 
                            className="w-full h-full object-cover cursor-zoom-in transition-transform duration-300 group-hover:scale-105" 
                            onClick={() => setLightboxGuest(guest)}
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 pointer-events-none">
                            <span className="bg-white/90 text-[#4A5D4E] text-xs px-2.5 py-1.5 rounded-lg font-medium shadow flex items-center gap-1">
                              <Eye size={12} /> Perbesar
                            </span>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); deletePhoto(); }}
                            disabled={uploadingPhoto}
                            className="absolute bottom-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all shadow-md active:scale-95 z-10"
                            title="Hapus Foto"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
  ```

- [ ] **Step 2: Sisipkan Komponen JSX Modal Lightbox di bagian bawah halaman**
  Kita letakkan kode JSX Modal Lightbox di bagian paling bawah komponen sebelum tag penutup `AdminCMS` (tepat di atas tag penutup utama `return (...)`).

  Temukan akhir dari JSX utama:
  ```tsx
      </div>
    )
  }
  ```

  Sisipkan kode berikut tepat di atas tag penutup `</div>` utama (sebelum tag `)` penutup return):
  ```tsx
        {/* Modal Lightbox Zoom Foto Tamu */}
        {lightboxGuest && (
          <div 
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-4 transition-all duration-300 animate-fadeIn"
            onClick={() => setLightboxGuest(null)}
          >
            <button 
              className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all duration-200"
              onClick={() => setLightboxGuest(null)}
            >
              <X size={24} />
            </button>
            <div 
              className="relative max-w-md w-full bg-[#FDFBF7] rounded-2xl overflow-hidden border border-[#E5E1DA] shadow-2xl transition-all duration-300"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="aspect-square w-full bg-black flex items-center justify-center">
                <img 
                  src={lightboxGuest.photo_url} 
                  alt={lightboxGuest.name} 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="p-5 bg-white border-t border-[#F3F1ED]">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-serif text-[#4A5D4E] font-semibold truncate flex-1">{lightboxGuest.name}</h3>
                  {lightboxGuest.is_vip && (
                    <span className="bg-amber-400 text-amber-950 text-[9px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                      VIP
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#8C9A8E] flex items-center gap-1.5">
                  <Clock size={13} /> Hadir pukul {lightboxGuest.arrival_time ? new Date(lightboxGuest.arrival_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'} WIB
                </p>
              </div>
            </div>
          </div>
        )}
  ```

- [ ] **Step 3: Tambahkan animasi CSS di custom-scrollbar styles**
  Temukan tag `<style>` di sekitar baris 840+ dan tambahkan animasi transpirasi fadeIn sederhana:
  ```css
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
  ```

- [ ] **Step 4: Verifikasi kompilasi**
  Run: `npm run build`
  Expected: PASS

- [ ] **Step 5: Commit**
  ```bash
  git add src/pages/AdminCMS.tsx
  git commit -m "feat: implement lightbox zoom modal for guest photos with backdrop blur"
  ```

---

### Task 4: Paginated Guest Photo Gallery UI

**Files:**
- Modify: `src/pages/AdminCMS.tsx` (di bawah blok tabel list tamu hadir & belum hadir)

- [ ] **Step 1: Sisipkan logika paginasi galeri**
  Letakkan perhitungan paginasi ini di dalam komponen `AdminCMS`, misalnya sebelum baris `return (` (sekitar baris 350, tepat di bawah perhitungan filter daftar tamu lainnya).

  Cari:
  ```typescript
    const filteredPendingGuests = pendingGuests.filter(g => 
      g.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  ```

  Tambahkan di bawahnya:
  ```typescript
    const ITEMS_PER_PAGE = 8
    const guestsWithPhotos = arrivedGuests.filter(g => g.photo_url)
    const totalPages = Math.max(1, Math.ceil(guestsWithPhotos.length / ITEMS_PER_PAGE))
    const paginatedGuests = guestsWithPhotos.slice(
      (galleryPage - 1) * ITEMS_PER_PAGE,
      galleryPage * ITEMS_PER_PAGE
    )
  ```

- [ ] **Step 2: Sisipkan UI Galeri di bawah kontainer tabel tamu hadir/belum hadir**
  Temukan baris penutup dari blok tabel tamu hadir & belum hadir.
  Cari baris berikut di akhir list tabel (sekitar baris 836-838):
  ```tsx
              </div>
            </div>
          </div>
        </div>
  ```

  Sisipkan kode komponen Galeri berpaginasi tepat di antara tag `</div>` penutup kolom grid tabel dan tag `</div>` penutup pembungkus luar (sebelum tag pembatas akhir):

  ```tsx
          {/* Galeri Kehadiran Tamu Berpaginasi */}
          <div className="mt-12 pt-10 border-t border-[#E5E1DA] space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#4A5D4E]">
                <Camera size={20} />
                <h2 className="text-xl font-medium font-serif">Galeri Kehadiran Tamu</h2>
              </div>
              <span className="bg-[#F0F4F1] text-[#4A5D4E] px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                {guestsWithPhotos.length} Foto Tamu
              </span>
            </div>

            {paginatedGuests.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {paginatedGuests.map((g) => (
                    <div 
                      key={g.id} 
                      className="bg-white rounded-xl overflow-hidden border border-[#E5E1DA] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col group"
                    >
                      <div 
                        className="aspect-square w-full overflow-hidden bg-gray-50 relative cursor-zoom-in"
                        onClick={() => setLightboxGuest(g)}
                      >
                        <img 
                          src={g.photo_url} 
                          alt={g.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                          <span className="bg-white/95 text-[#4A5D4E] text-[10px] px-3 py-1.5 rounded-lg font-medium shadow flex items-center gap-1">
                            <Eye size={12} /> Lihat Foto
                          </span>
                        </div>
                      </div>
                      <div className="p-3 flex flex-col flex-1 border-t border-[#F3F1ED]">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-serif text-sm font-semibold text-[#4A5D4E] truncate flex-1">{g.name}</span>
                          {g.is_vip && <span className="text-[8px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold border border-amber-200">VIP</span>}
                        </div>
                        <span className="text-[10px] text-[#8C9A8E] flex items-center gap-1">
                          <Clock size={10} /> Tiba pukul {g.arrival_time ? new Date(g.arrival_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Kontrol Paginasi Galeri */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-4 border-t border-[#F3F1ED]">
                    <button
                      onClick={() => setGalleryPage(p => Math.max(1, p - 1))}
                      disabled={galleryPage === 1}
                      className="flex items-center gap-1 text-xs text-[#4A5D4E] hover:text-[#3D4C40] disabled:text-gray-300 font-semibold transition-all disabled:pointer-events-none"
                    >
                      <ChevronLeft size={16} /> Sebelumnya
                    </button>
                    <span className="text-xs text-[#8C9A8E] font-medium">
                      Halaman {galleryPage} dari {totalPages}
                    </span>
                    <button
                      onClick={() => setGalleryPage(p => Math.min(totalPages, p + 1))}
                      disabled={galleryPage === totalPages}
                      className="flex items-center gap-1 text-xs text-[#4A5D4E] hover:text-[#3D4C40] disabled:text-gray-300 font-semibold transition-all disabled:pointer-events-none"
                    >
                      Selanjutnya <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50/40 rounded-2xl border border-dashed border-[#E5E1DA]">
                <Camera size={32} className="text-gray-300 mb-2" />
                <p className="text-xs font-medium text-[#8C9A8E]">Belum ada foto tamu yang terdokumentasi.</p>
              </div>
            )}
          </div>
  ```

- [ ] **Step 3: Tambahkan reset halaman galeri ke halaman 1 saat data tamu di-fetch**
  Untuk mencegah bug halaman kosong ketika daftar tamu diperbarui, tambahkan reset `setGalleryPage(1)` di fungsi `fetchGuests` saat data berhasil dimuat (opsional tapi disarankan untuk sinkronisasi, letakkan di akhir try-catch `fetchGuests`).

- [ ] **Step 4: Lakukan Build Verifikasi Terakhir**
  Run: `npm run build`
  Expected: PASS build produksi tanpa ada error.

- [ ] **Step 5: Commit**
  ```bash
  git add src/pages/AdminCMS.tsx
  git commit -m "feat: add paginated visual guest gallery with card layouts and custom transitions"
  ```
