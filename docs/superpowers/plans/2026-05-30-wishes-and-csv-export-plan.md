# Guest Wishes & CSV Export (Sub-Proyek A) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan modul pengisian ucapan selamat pernikahan (*Wishes*) bagi tamu check-in dengan 5 rekomendasi ucapan cepat (*Quick Templates*), serta tombol ekspor laporan tamu dalam format CSV ber-encoding UTF-8 BOM untuk Microsoft Excel di Admin CMS.

**Architecture:** Menggunakan kolom database bawaan `message` pada tabel `guests` untuk menyimpan ucapan tamu, menambahkan tombol pil rekomendasi ucapan cepat yang otomatis menyalin teks ke *textarea* masukan dan mengarahkan fokus kursor, serta mengimplementasikan generator berkas CSV client-side yang mengambil data dari database Supabase secara real-time dan menyisipkan tanda BOM (`\uFEFF`).

**Tech Stack:** React, TypeScript, Supabase Client, Lucide Icons (Download), Tailwind CSS.

---

### File Structure Map

| File | Status | Tanggung Jawab |
| :--- | :--- | :--- |
| `src/pages/AdminCMS.tsx` | Modifikasi | Mengimplementasikan state ucapan, logika penyimpanan data ke Supabase, antarmuka Form Wishes dengan Quick Templates, tombol Ekspor CSV responsif, dan fungsi penyusunan format CSV UTF-8 BOM. |

---

### Task 1: State & Function Setup for Guest Wishes

**Files:**
- Modify: `src/pages/AdminCMS.tsx`

- [x] **Step 1: Tambahkan state variables baru**
  Letakkan state `wishesText` dan `savingWishes` di bagian atas komponen `AdminCMS` (sekitar baris 25-30, di bawah state `lightboxGuest`).

  ```typescript
    const [wishesText, setWishesText] = useState('')
    const [savingWishes, setSavingWishes] = useState(false)
  ```

- [x] **Step 2: Sinkronisasikan state ucapan saat guest baru dimuat**
  Di dalam `onScanSuccess` (sekitar baris 132), `handleManualCheckIn` (sekitar baris 154), dan kueri pemuatan data tamu lainnya, pastikan kita meng-update state `wishesText` dengan ucapan tamu yang sudah tersimpan sebelumnya.

  Cari:
  ```typescript
        setGuest(data)
  ```

  Ubah/tambahkan baris sinkronisasi di bawahnya menjadi:
  ```typescript
        setGuest(data)
        setWishesText(data?.message || '')
  ```

  *Lakukan hal yang sama di dalam `handleManualCheckIn` (sekitar baris 154) dan fungsi kueri detail lainnya.*

- [x] **Step 3: Implementasikan fungsi saveGuestWishes**
  Tambahkan fungsi penyimpanan ucapan tamu ke Supabase Database di dalam komponen `AdminCMS` (misalnya di bawah fungsi `deletePhoto` sekitar baris 275).

  ```typescript
    const saveGuestWishes = async () => {
      if (!guest) return
      setSavingWishes(true)
      
      try {
        const { error } = await supabase
          .from('guests')
          .update({ message: wishesText })
          .eq('id', guest.id)
          
        if (error) throw error
        
        // Perbarui data guest lokal
        setGuest({ ...guest, message: wishesText })
        fetchGuests() // Segarkan daftar tamu hadir/belum hadir
        alert("Ucapan tamu berhasil disimpan!")
      } catch (err: any) {
        console.error("Gagal menyimpan ucapan:", err)
        alert(`Gagal menyimpan ucapan: ${err.message || 'Error tidak diketahui'}`)
      } finally {
        setSavingWishes(false)
      }
    }
  ```

- [x] **Step 4: Verifikasi kompilasi**
  Run: `npm run build`
  Expected: PASS (Abaikan atau bungkus referensi `wishesText` / `saveGuestWishes` jika ada error linter unused variables sebelum UI diintegrasikan pada Task berikutnya).

- [x] **Step 5: Commit**
  ```bash
  git add src/pages/AdminCMS.tsx
  git commit -m "feat: setup state and saveGuestWishes logic for guest wishes"
  ```

---

### Task 2: Wishes Form & Quick Templates UI

**Files:**
- Modify: `src/pages/AdminCMS.tsx`

- [ ] **Step 1: Sisipkan array QUICK_WISHES_TEMPLATES**
  Tambahkan konstanta daftar ucapan kustom di luar komponen `AdminCMS` (misalnya di bagian atas file, di bawah import ikon).

  ```typescript
  const QUICK_WISHES_TEMPLATES = [
    "Selamat menempuh hidup baru! Semoga cinta kalian abadi hingga hari tua.",
    "Selamat atas pernikahannya! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.",
    "Happy wedding! Semoga hari-hari kalian dipenuhi dengan kebahagiaan dan tawa bersama.",
    "Selamat berbahagia! Semoga dilancarkan selalu dalam membangun bahtera rumah tangga yang indah.",
    "Barakallahu lakuma wa baraka 'alaikuma wa jama'a bainakuma fii khair."
  ];
  ```

- [ ] **Step 2: Sisipkan UI Wishes Card**
  Cari akhir dari blok kartu Foto Tamu (sekitar baris 720). Blok kartu foto diakhiri dengan `</div>` penutup, tepat di atas blok tombol scan tamu lain `<div className="flex flex-col gap-2">`.

  Sisipkan JSX berikut tepat di bawah kartu foto tamu dan di atas pembungkus tombol scan:

  ```tsx
                  {/* Blok Ucapan & Doa Tamu */}
                  <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#E5E1DA] space-y-4">
                    <div className="flex items-center justify-between border-b border-[#F3F1ED] pb-2">
                      <span className="text-sm font-semibold text-[#4A5D4E] flex items-center gap-1.5">
                        <Heart size={16} className="text-[#C17E61]" /> Ucapan & Doa Tamu
                      </span>
                    </div>

                    {/* Quick Wishes Recommendations */}
                    <div className="space-y-1.5">
                      <p className="text-[10px] text-[#8C9A8E] font-medium">Rekomendasi ucapan cepat (Klik untuk memilih):</p>
                      <div className="flex flex-wrap gap-1.5">
                        {QUICK_WISHES_TEMPLATES.map((tmpl, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setWishesText(tmpl);
                              document.getElementById('wishes-textarea')?.focus();
                            }}
                            className="text-[9px] bg-[#F0F4F1] hover:bg-[#E2EAE4] text-[#4A5D4E] px-2 py-1 rounded-full transition-all font-medium border border-transparent hover:border-[#4A5D4E]/20 text-left truncate max-w-[180px]"
                            title={tmpl}
                          >
                            {idx + 1}. {tmpl.substring(0, 18)}...
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Textarea Input & Save Button */}
                    <div className="space-y-2">
                      <textarea
                        id="wishes-textarea"
                        rows={3}
                        value={wishesText}
                        onChange={(e) => setWishesText(e.target.value)}
                        placeholder="Tuliskan ucapan selamat atau harapan dari tamu di sini..."
                        className="w-full bg-white border border-[#E5E1DA] rounded-xl p-3 outline-none focus:ring-1 focus:ring-[#4A5D4E] transition-all text-xs resize-none"
                      />
                      <button
                        onClick={saveGuestWishes}
                        disabled={savingWishes || !wishesText.trim()}
                        className="w-full bg-[#4A5D4E] hover:bg-[#3D4C40] disabled:bg-gray-200 disabled:text-gray-400 text-white py-2 rounded-xl transition-all font-medium text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
                      >
                        {savingWishes ? (
                          <>
                            <RefreshCw size={12} className="animate-spin" /> Menyimpan...
                          </>
                        ) : (
                          <>
                            <Check size={14} /> Simpan Ucapan
                          </>
                        )}
                      </button>
                    </div>
                  </div>
  ```

- [ ] **Step 3: Tambahkan Heart ke impor lucide-react**
  Tambahkan `Heart` di baris import lucide-react bagian atas berkas `src/pages/AdminCMS.tsx`.

- [ ] **Step 4: Uji Build Kompilasi**
  Run: `npm run build`
  Expected: PASS tanpa error TypeScript.

- [ ] **Step 5: Commit**
  ```bash
  git add src/pages/AdminCMS.tsx
  git commit -m "feat: integrate wishes form cards and 5 quick template pills in Admin CMS"
  ```

---

### Task 3: CSV Export Generation Logic

**Files:**
- Modify: `src/pages/AdminCMS.tsx`

- [ ] **Step 1: Tambahkan fungsi handleExportCSV**
  Tambahkan logika penyusunan teks CSV dan trigger unduh berkas di dalam komponen `AdminCMS` (misalnya di bawah fungsi `saveGuestWishes` sekitar baris 295).

  ```typescript
    const handleExportCSV = async () => {
      try {
        // 1. Ambil data segar terlengkap langsung dari database
        const { data: allGuests, error } = await supabase
          .from('guests')
          .select('name, is_vip, rsvp_status, has_arrived, arrival_time, souvenir_taken, message, photo_url')
          .order('name', { ascending: true })
          
        if (error) throw error
        if (!allGuests || allGuests.length === 0) {
          alert("Tidak ada data tamu untuk diekspor.")
          return
        }
        
        // 2. Judul Kolom (Headers)
        const headers = [
          "Nama Tamu",
          "Kategori (VIP)",
          "RSVP Status",
          "Kehadiran",
          "Waktu Tiba (WIB)",
          "Souvenir Status",
          "Ucapan Selamat (Wishes)",
          "Tautan Foto"
        ]
        
        // 3. Format Baris Data
        const csvRows = [headers.join(",")]
        
        allGuests.forEach((g) => {
          const row = [
            `"${g.name.replace(/"/g, '""')}"`,
            g.is_vip ? "VIP" : "Regular",
            g.rsvp_status ? "Hadir" : "Belum RSVP",
            g.has_arrived ? "Sudah Check-in" : "Belum Hadir",
            g.arrival_time ? new Date(g.arrival_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : "-",
            g.souvenir_taken ? "Sudah Diambil" : "Belum Diambil",
            `"${(g.message || "").replace(/"/g, '""').replace(/\n/g, " ")}"`, // Bersihkan tanda kutip ganda & baris baru
            g.photo_url ? g.photo_url : "-"
          ]
          csvRows.push(row.join(","))
        })
        
        // 4. Susun konten CSV dan sisipkan UTF-8 BOM (\uFEFF) untuk kompabilitas Microsoft Excel
        const csvContent = csvRows.join("\n")
        const BOM = "\uFEFF"
        const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" })
        
        // 5. Memicu unduh berkas di browser
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.setAttribute("href", url)
        link.setAttribute("download", `Laporan_Kehadiran_Tamu_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } catch (err: any) {
        console.error("Gagal mengekspor CSV:", err)
        alert(`Gagal melakukan ekspor data: ${err.message}`)
      }
    }
  ```

- [ ] **Step 2: Uji kompilasi**
  Run: `npm run build`
  Expected: PASS

- [ ] **Step 3: Commit**
  ```bash
  git add src/pages/AdminCMS.tsx
  git commit -m "feat: implement client-side UTF-8 BOM CSV export logic"
  ```

---

### Task 4: CSV Export UI Button Next to Search Bar

**Files:**
- Modify: `src/pages/AdminCMS.tsx`

- [ ] **Step 1: Modifikasi kontainer pencarian untuk menyisipkan tombol ekspor**
  Temukan bar pencarian tamu di sekitar baris 751 (di bawah tag `{/* Search Bar */}`).
  Aslinya bar pencarian ditulis seperti ini:
  ```tsx
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C9A8E]" size={18} />
            <input 
              type="text"
              placeholder="Cari nama tamu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#E5E1DA] rounded-full py-3 pl-12 pr-6 outline-none focus:ring-1 focus:ring-[#4A5D4E] transition-all shadow-sm"
            />
          </div>
  ```

  Ganti dengan struktur flexbox responsif berikut yang menyandingkan kolom input pencarian dengan tombol ekspor CSV baru:
  ```tsx
          {/* Search Bar & Export CSV */}
          <div className="flex flex-col sm:flex-row items-center gap-4 max-w-2xl mx-auto">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C9A8E]" size={18} />
              <input 
                type="text"
                placeholder="Cari nama tamu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#E5E1DA] rounded-full py-3 pl-12 pr-6 outline-none focus:ring-1 focus:ring-[#4A5D4E] transition-all shadow-sm text-sm"
              />
            </div>
            <button
              onClick={handleExportCSV}
              className="w-full sm:w-auto bg-[#4A5D4E] hover:bg-[#3D4C40] text-white px-6 py-3 rounded-full transition-all flex items-center justify-center gap-2 font-medium shadow-sm active:scale-95 text-xs whitespace-nowrap"
              title="Unduh Laporan Tamu CSV"
            >
              <Download size={14} /> Ekspor Laporan CSV
            </button>
          </div>
  ```

- [ ] **Step 2: Tambahkan Download ke impor lucide-react**
  Tambahkan properti `Download` di baris import lucide-react paling atas.

- [ ] **Step 3: Uji produksi kompilasi proyek akhir**
  Run: `npm run build`
  Expected: PASS build produksi Vite 100% sukses tanpa ada peringatan atau error.

- [ ] **Step 4: Commit**
  ```bash
  git add src/pages/AdminCMS.tsx
  git commit -m "feat: insert responsive Export CSV button next to the search bar"
  ```
