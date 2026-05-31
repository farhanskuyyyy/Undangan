# Guest Re-edit & Combined Manual Search (Sub-Proyek E) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Memungkinkan admin untuk mencari tamu yang sudah check-in dan mengedit kembali fotonya, status souvenir, atau ucapan selamat tamu yang tertinggal melalui kolom pencarian nama manual.

**Architecture:** Menggabungkan data tamu hadir dan belum hadir di memori browser untuk disaring secara bersamaan di kolom pencarian, mengimplementasikan fungsi `handleSelectGuest` untuk memuat ulang baris tamu utuh langsung dari database Supabase berdasarkan ID, serta menyesuaikan tampilan antarmuka hasil pencarian dengan badge check-in dan tombol "Edit / Detail".

**Tech Stack:** React, TypeScript, Supabase Client, Tailwind CSS.

---

### File Structure Map

| File | Status | Tanggung Jawab |
| :--- | :--- | :--- |
| `src/pages/AdminCMS.tsx` | Modifikasi | Mengimplementasikan fungsi asinkron `handleSelectGuest`, mendefinisikan array filter pencarian gabungan `combinedSearchGuests`, serta memperbarui JSX hasil pencarian manual dengan integrasi dua status check-in. |

---

### Task 1: Implement handleSelectGuest Function

**Files:**
- Modify: `src/pages/AdminCMS.tsx`

- [x] **Step 1: Tambahkan fungsi handleSelectGuest**
  Tambahkan fungsi asinkron baru di komponen `AdminCMS` (misalnya di bawah `handleManualCheckIn` sekitar baris 190).

  ```typescript
    const handleSelectGuest = async (guestId: string) => {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('guests')
          .select('*')
          .eq('id', guestId)
          .single()
          
        if (error) throw error
        
        // Pasang ke state detail tamu aktif
        setGuest(data)
        setWishesText(data?.message || '')
      } catch (err: any) {
        console.error("Gagal memuat detail tamu:", err)
        alert(`Gagal memuat detail tamu: ${err.message || 'Error tidak diketahui'}`)
      } finally {
        setLoading(false)
      }
    }
  ```

- [x] **Step 2: Tambahkan compiler safety linter check**
  Karena fungsi ini belum digunakan di JSX dan strict `"noUnusedLocals": true` aktif, tambahkan ke dalam `if (false as boolean)` block sementara di dekat state/fungsi lainnya:
  ```typescript
    if (false as boolean) {
      console.log(handleSelectGuest)
    }
  ```

- [x] **Step 3: Uji build kompilasi TypeScript**
  Run: `npm run build`
  Expected: PASS

---

### Task 2: Implement Combined Search Filtering Logic

**Files:**
- Modify: `src/pages/AdminCMS.tsx`

- [x] **Step 1: Ganti filter filteredManualPendingGuests dengan combinedSearchGuests**
  Temukan baris filter pencarian di komponen `AdminCMS` (sekitar baris 542).
  Aslinya filter tertulis seperti ini:
  ```typescript
    const filteredManualPendingGuests = pendingGuests.filter(g => 
      g.name.toLowerCase().includes(manualSearchQuery.toLowerCase())
    )
  ```

  Ganti blok tersebut dengan penggabungan dan penyaringan kueri tamu berikut:
  ```typescript
    const combinedSearchGuests = [
      ...arrivedGuests.map(g => ({ ...g, has_arrived: true })),
      ...pendingGuests.map(g => ({ ...g, has_arrived: false }))
    ].filter(g => g.name.toLowerCase().includes(manualSearchQuery.toLowerCase()))
  ```

- [x] **Step 2: Tambahkan safety check sementara untuk combinedSearchGuests**
  Bungkus `combinedSearchGuests` ke dalam `if (false as boolean)` block sementara untuk menghindari linter warning:
  ```typescript
    if (false as boolean) {
      console.log(combinedSearchGuests)
    }
  ```

- [x] **Step 3: Uji build kompilasi**
  Run: `npm run build`
  Expected: PASS

---

### Task 3: Update Manual Search Results UI Layout

**Files:**
- Modify: `src/pages/AdminCMS.tsx`

- [x] **Step 1: Perbarui rendering hasil pencarian manual**
  Temukan blok rendering hasil pencarian manual (sekitar baris 790-820, di bawah `manualSearchQuery.length > 0`).
  Aslinya render ditulis seperti ini:
  ```tsx
                  <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {manualSearchQuery.length > 0 ? (
                      filteredManualPendingGuests.length > 0 ? (
                        <div className="space-y-2">
                          {filteredManualPendingGuests.map((guest) => (
                            <div 
                              key={guest.id} 
                              className="flex items-center justify-between p-3 rounded-xl border border-[#F3F1ED] hover:bg-[#FDFBF7] transition-all"
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-serif flex items-center gap-2">
                                  {guest.name}
                                  {guest.is_vip && <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">VIP</span>}
                                </span>
                              </div>
                              <button
                                onClick={() => handleManualCheckIn(guest.id)}
                                disabled={loading}
                                className="text-[10px] bg-[#4A5D4E] text-white px-3 py-1.5 rounded-lg hover:bg-[#3d4d41] transition-all font-medium disabled:opacity-50"
                              >
                                Check In
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-[#8C9A8E]">
                          <p className="text-xs">Tamu tidak ditemukan</p>
                        </div>
                      )
                    ) : (
  ```

  Ganti seluruh blok tersebut agar merender `combinedSearchGuests` dengan pembedaan warna tombol dan lencana sudah hadir:
  ```tsx
                  <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                    {manualSearchQuery.length > 0 ? (
                      combinedSearchGuests.length > 0 ? (
                        <div className="space-y-2">
                          {combinedSearchGuests.map((guest) => (
                            <div 
                              key={guest.id} 
                              className="flex items-center justify-between p-3 rounded-xl border border-[#F3F1ED] hover:bg-[#FDFBF7] transition-all"
                            >
                              <div className="flex flex-col">
                                <span className="text-sm font-serif flex items-center gap-2">
                                  {guest.name}
                                  {guest.is_vip && <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">VIP</span>}
                                </span>
                                {guest.has_arrived && (
                                  <span className="text-[9px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-semibold inline-block w-fit mt-1 border border-green-100">
                                    Sudah Check-in
                                  </span>
                                )}
                              </div>
                              {guest.has_arrived ? (
                                <button
                                  onClick={() => handleSelectGuest(guest.id)}
                                  disabled={loading}
                                  className="text-[10px] bg-[#C17E61] text-white px-3 py-1.5 rounded-lg hover:bg-[#A96B51] transition-all font-medium disabled:opacity-50 shadow-sm"
                                >
                                  Edit / Detail
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleManualCheckIn(guest.id)}
                                  disabled={loading}
                                  className="text-[10px] bg-[#4A5D4E] text-white px-3 py-1.5 rounded-lg hover:bg-[#3d4d41] transition-all font-medium disabled:opacity-50 shadow-sm"
                                >
                                  Check In
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-[#8C9A8E]">
                          <p className="text-xs">Tamu tidak ditemukan</p>
                        </div>
                      )
                    ) : (
  ```

- [x] **Step 2: Bersihkan seluruh compiler safety checks**
  Hapus blok `if (false as boolean)` check untuk `handleSelectGuest` dan `combinedSearchGuests` karena keduanya kini telah aktif 100% dipanggil dalam JSX rendering pencarian manual!

- [x] **Step 3: Lakukan build produksi akhir proyek**
  Run: `npm run build`
  Expected: PASS build produksi Vite 100% sukses tanpa ada error.
