# Guest Photo Capture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menambahkan fitur pengambilan foto tamu undangan secara langsung menggunakan kamera (webcam/HP) di Admin CMS setelah scan barcode / check-in, lalu menyimpannya di Supabase Storage Bucket dan memperbarui tautan fotonya di database.

**Architecture:** Menggunakan API Native HTML5 MediaDevices (`getUserMedia`) untuk streaming kamera ke elemen `<video>`, memproyeksikan frame video ke `<canvas>` tersembunyi untuk menghasilkan Blob gambar JPEG yang dikompresi (kualitas 0.8), mengunggah gambar tersebut secara asinkron ke bucket Supabase Storage bernama `guest-photos`, dan memperbarui URL foto publiknya ke kolom `photo_url` pada database tamu.

**Tech Stack:** React, TypeScript, Supabase Client (@supabase/supabase-js), Lucide Icons, Tailwind CSS, HTML5 Canvas & MediaDevices API.

---

### File Structure Map

| File | Status | Tanggung Jawab |
| :--- | :--- | :--- |
| `update_schema.sql` | Modifikasi | Mendokumentasikan query perubahan skema database dengan kolom `photo_url`. |
| `src/pages/AdminCMS.tsx` | Modifikasi | Menambah logika manajemen kamera, upload Supabase, serta elemen UI premium pengambilan foto tamu di bawah status souvenir. |

---

### Task 1: Database Schema & Migration Document

**Files:**
- Modify: `update_schema.sql` (tambahkan query di baris paling bawah)

- [ ] **Step 1: Modifikasi file update_schema.sql**
  Tambahkan query ALTER TABLE di bagian paling bawah file `update_schema.sql` untuk memastikan perubahan terdokumentasi dengan baik.

  ```sql
  -- Add photo_url to guests table
  ALTER TABLE guests ADD COLUMN photo_url TEXT;
  ```

- [ ] **Step 2: Jalankan query SQL di Supabase SQL Editor**
  Karena kita tidak menggunakan migrasi otomatis di local development, jalankan perintah SQL berikut secara manual di dashboard Supabase SQL Editor Anda:
  ```sql
  ALTER TABLE guests ADD COLUMN photo_url TEXT;
  ```
  Expected: Query berhasil dijalankan tanpa error.

- [ ] **Step 3: Commit**
  ```bash
  git add update_schema.sql
  git commit -m "db: add photo_url column to guests table"
  ```

---

### Task 2: Import & State Setup in AdminCMS.tsx

**Files:**
- Modify: `src/pages/AdminCMS.tsx`

- [ ] **Step 1: Tambahkan Lucide icons baru**
  Tambahkan icon `Trash2`, `Check`, `RefreshCw`, dan `AlertCircle` pada import `lucide-react` di bagian atas berkas `src/pages/AdminCMS.tsx`.

  Ganti import (sekitar baris 5):
  ```typescript
  import { CheckCircle, XCircle, Gift, User, ScanLine, Clock, Users, Search, Camera, Image, Upload, LogOut } from 'lucide-react'
  ```
  Menjadi:
  ```typescript
  import { CheckCircle, XCircle, Gift, User, ScanLine, Clock, Users, Search, Camera, Image, Upload, LogOut, Trash2, Check, RefreshCw, AlertCircle } from 'lucide-react'
  ```

- [ ] **Step 2: Tambahkan state variables dan ref di AdminCMS component**
  Letakkan state & ref baru ini di dalam component `AdminCMS` (sekitar baris 19-20, tepat di bawah `fileInputRef`).

  ```typescript
    const [cameraActive, setCameraActive] = useState(false)
    const [capturedImage, setCapturedImage] = useState<string | null>(null)
    const [imageBlob, setImageBlob] = useState<Blob | null>(null)
    const [uploadingPhoto, setUploadingPhoto] = useState(false)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const streamRef = useRef<MediaStream | null>(null)
  ```

- [ ] **Step 3: Verifikasi tipe data dan kompilasi**
  Run: `npm run build` atau `npx tsc`
  Expected: Tidak ada error kompilasi TypeScript atau eslint terkait state baru.

- [ ] **Step 4: Commit**
  ```bash
  git add src/pages/AdminCMS.tsx
  git commit -m "feat: setup react state and icons for guest photo capture"
  ```

---

### Task 3: Camera Controller Logic in AdminCMS.tsx

**Files:**
- Modify: `src/pages/AdminCMS.tsx`

- [ ] **Step 1: Tambahkan fungsi startCamera, captureSnapshot, dan stopCameraStream**
  Tambahkan fungsi-fungsi ini di dalam component `AdminCMS`, misalnya di atas fungsi `claimSouvenir` (sekitar baris 160).

  ```typescript
    const startCamera = async () => {
      try {
        setCapturedImage(null)
        setImageBlob(null)
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } } // Prioritaskan kamera belakang untuk memotret tamu
        })
        
        streamRef.current = stream
        setCameraActive(true)
        
        // Pasang stream ke elemen video setelah rendering
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream
          }
        }, 100)
      } catch (err) {
        console.error("Gagal membuka kamera:", err)
        alert("Gagal mengakses kamera. Mohon pastikan izin akses kamera telah diberikan.")
      }
    }

    const stopCameraStream = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
        streamRef.current = null;
      }
      setCameraActive(false)
    }

    const captureSnapshot = () => {
      if (videoRef.current) {
        const video = videoRef.current
        const canvas = document.createElement('canvas')
        
        // Dapatkan resolusi video asli
        canvas.width = video.videoWidth || 640
        canvas.height = video.videoHeight || 480
        
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          
          // Preview lokal instan berbasis base64
          const dataUrl = canvas.toDataURL('image/jpeg')
          setCapturedImage(dataUrl)
          
          // Blob terkompresi dengan kualitas 0.8 (80%) untuk diunggah ke storage
          canvas.toBlob((blob) => {
            if (blob) setImageBlob(blob)
          }, 'image/jpeg', 0.8)
        }
        
        stopCameraStream()
      }
    }
  ```

- [ ] **Step 2: Tambahkan cleanup kamera saat guest berubah atau component unmount**
  Ganti `useEffect` cleanup atau tambahkan pembersihan otomatis saat `guest` dibersihkan (misal di baris 63 atau di useEffect baru).

  Tambahkan `useEffect` berikut di dekat useEffect/fungsi inisialisasi:
  ```typescript
    useEffect(() => {
      // Hentikan kamera jika tamu yang aktif berubah atau ditutup
      return () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
        }
      }
    }, [guest])
  ```

- [ ] **Step 3: Verifikasi kompilasi**
  Run: `npm run build`
  Expected: PASS tanpa error TypeScript.

- [ ] **Step 4: Commit**
  ```bash
  git add src/pages/AdminCMS.tsx
  git commit -m "feat: implement native webcam streaming and capture snapshot logic"
  ```

---

### Task 4: Supabase Upload & DB Persistence Logic

**Files:**
- Modify: `src/pages/AdminCMS.tsx`

- [ ] **Step 1: Implementasi fungsi savePhoto**
  Tambahkan fungsi `savePhoto` tepat di bawah `captureSnapshot` untuk mengunggah foto ke Supabase Storage dan memperbarui tabel tamu.

  ```typescript
    const savePhoto = async () => {
      if (!imageBlob || !guest) return
      setUploadingPhoto(true)
      
      const filePath = `photos/${guest.id}.jpg`
      
      try {
        // 1. Upload ke bucket Supabase Storage dengan upsert: true
        const { error: uploadError } = await supabase.storage
          .from('guest-photos')
          .upload(filePath, imageBlob, {
            contentType: 'image/jpeg',
            upsert: true
          })
          
        if (uploadError) throw uploadError
        
        // 2. Ambil URL Publik
        const { data: { publicUrl } } = supabase.storage
          .from('guest-photos')
          .getPublicUrl(filePath)
          
        // 3. Update database di tabel guests
        const { error: dbError } = await supabase
          .from('guests')
          .update({ photo_url: publicUrl })
          .eq('id', guest.id)
          
        if (dbError) throw dbError
        
        // 4. Perbarui state lokal guest agar UI langsung merender foto baru
        setGuest({ ...guest, photo_url: publicUrl })
        setCapturedImage(null)
        setImageBlob(null)
        fetchGuests() // Refresh daftar tamu
        alert("Foto tamu berhasil disimpan!")
      } catch (err: any) {
        console.error("Gagal menyimpan foto:", err)
        alert(`Gagal menyimpan foto: ${err.message || 'Error tidak diketahui'}`)
      } finally {
        setUploadingPhoto(false)
      }
    }
  ```

- [ ] **Step 2: Implementasi fungsi deletePhoto**
  Tambahkan fungsi untuk menghapus foto tamu agar admin bisa melakukan pembersihan data jika salah ambil foto.

  ```typescript
    const deletePhoto = async () => {
      if (!guest || !guest.photo_url) return
      if (!confirm("Apakah Anda yakin ingin menghapus foto tamu ini?")) return
      
      setUploadingPhoto(true)
      const filePath = `photos/${guest.id}.jpg`
      
      try {
        // Hapus dari Storage
        await supabase.storage.from('guest-photos').remove([filePath])
        
        // Reset di Database
        const { error: dbError } = await supabase
          .from('guests')
          .update({ photo_url: null })
          .eq('id', guest.id)
          
        if (dbError) throw dbError
        
        setGuest({ ...guest, photo_url: null })
        fetchGuests()
        alert("Foto tamu berhasil dihapus!")
      } catch (err: any) {
        console.error("Gagal menghapus foto:", err)
        alert(`Gagal menghapus foto: ${err.message}`)
      } finally {
        setUploadingPhoto(false)
      }
    }
  ```

- [ ] **Step 3: Verifikasi kompilasi**
  Run: `npm run build`
  Expected: PASS

- [ ] **Step 4: Commit**
  ```bash
  git add src/pages/AdminCMS.tsx
  git commit -m "feat: add savePhoto and deletePhoto integration with Supabase Storage and DB"
  ```

---

### Task 5: UI Integration in AdminCMS.tsx

**Files:**
- Modify: `src/pages/AdminCMS.tsx` (di bawah blok kartu souvenir)

- [ ] **Step 1: Masukkan blok UI Foto Tamu**
  Temukan baris penutup dari blok Status Souvenir. Di file asli, kartu souvenir diakhiri di sekitar baris 443 dengan `</div>`. Kita akan menempatkan kode di bawahnya, tepat sebelum penutup tag div utama panel kanan (sebelum `<div className="flex flex-col gap-2">` di baris 445).

  Cari baris target berikut:
  ```typescript
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2">
  ```

  Sisipkan kode UI berikut tepat di antara `</div>` souvenir dan `<div className="flex flex-col gap-2">`:

  ```tsx
                  {/* Blok Kamera & Foto Tamu */}
                  <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#E5E1DA] space-y-4">
                    <div className="flex items-center justify-between border-b border-[#F3F1ED] pb-2">
                      <span className="text-sm font-semibold text-[#4A5D4E] flex items-center gap-1.5">
                        <Camera size={16} /> Foto Kehadiran Tamu
                      </span>
                      {guest.photo_url && (
                        <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                          <Check size={10} /> Tersimpan
                        </span>
                      )}
                    </div>

                    {/* STATE 1: Kamera Aktif (Live Streaming) */}
                    {cameraActive && !capturedImage && (
                      <div className="space-y-3">
                        <div className="relative aspect-square w-full max-w-[280px] mx-auto overflow-hidden rounded-xl bg-black border border-[#E5E1DA] shadow-inner">
                          <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            className="w-full h-full object-cover transform scale-x-[-1]"
                          />
                          <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm animate-pulse">
                            Kamera Aktif
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={captureSnapshot}
                            className="flex-1 bg-[#C17E61] hover:bg-[#A96B51] text-white py-2 rounded-xl transition-all font-medium text-sm flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
                          >
                            <Camera size={16} /> Tangkap Foto
                          </button>
                          <button
                            onClick={stopCameraStream}
                            className="bg-white hover:bg-gray-50 border border-[#E5E1DA] text-gray-500 px-3 py-2 rounded-xl transition-all font-medium text-xs flex items-center justify-center"
                          >
                            Batal
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STATE 2: Preview Hasil Foto (Menunggu Konfirmasi Simpan) */}
                    {capturedImage && (
                      <div className="space-y-3">
                        <div className="aspect-square w-full max-w-[280px] mx-auto overflow-hidden rounded-xl bg-gray-100 border border-[#E5E1DA] shadow-sm">
                          <img 
                            src={capturedImage} 
                            alt="Preview Tamu" 
                            className="w-full h-full object-cover transform scale-x-[-1]" 
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={savePhoto}
                            disabled={uploadingPhoto}
                            className="flex-1 bg-[#4A5D4E] hover:bg-[#3D4C40] disabled:bg-gray-400 text-white py-2 rounded-xl transition-all font-medium text-sm flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.98]"
                          >
                            {uploadingPhoto ? (
                              <>
                                <RefreshCw size={14} className="animate-spin" /> Menyimpan...
                              </>
                            ) : (
                              <>
                                <Check size={16} /> Simpan Foto
                              </>
                            )}
                          </button>
                          <button
                            onClick={startCamera}
                            disabled={uploadingPhoto}
                            className="bg-white hover:bg-gray-50 disabled:opacity-50 border border-[#E5E1DA] text-gray-600 px-3 py-2 rounded-xl transition-all font-medium text-xs flex items-center justify-center gap-1"
                          >
                            <RefreshCw size={14} /> Ulang
                          </button>
                        </div>
                      </div>
                    )}

                    {/* STATE 3: Foto Sudah Tersimpan & Ditampilkan */}
                    {!cameraActive && !capturedImage && guest.photo_url && (
                      <div className="space-y-3 text-center">
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
                        <button
                          onClick={startCamera}
                          className="text-xs text-[#C17E61] hover:text-[#A96B51] font-semibold border-b border-[#C17E61] hover:border-[#A96B51] transition-all inline-flex items-center gap-1"
                        >
                          <RefreshCw size={12} /> Ambil Ulang Foto Tamu
                        </button>
                      </div>
                    )}

                    {/* STATE 4: Kosong / Belum Ada Foto */}
                    {!cameraActive && !capturedImage && !guest.photo_url && (
                      <div className="flex flex-col items-center justify-center py-6 text-center bg-gray-50/50 rounded-xl border border-dashed border-[#E5E1DA]">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
                          <Camera size={22} />
                        </div>
                        <p className="text-xs font-medium text-[#8C9A8E] mb-3">Belum ada foto kehadiran tamu</p>
                        <button
                          onClick={startCamera}
                          className="bg-[#4A5D4E] hover:bg-[#3D4C40] text-white text-xs px-4 py-2 rounded-xl transition-all font-medium flex items-center gap-1.5 shadow-sm active:scale-[0.98]"
                        >
                          <Camera size={14} /> Ambil Foto Tamu
                        </button>
                      </div>
                    )}
                  </div>
  ```

- [ ] **Step 2: Lakukan Build Tes untuk Validasi Kode & Sintaks JSX/TSX**
  Run: `npm run build`
  Expected: Proses kompilasi TypeScript dan bundler Vite berhasil 100% tanpa error syntax.

- [ ] **Step 3: Commit**
  ```bash
  git add src/pages/AdminCMS.tsx
  git commit -m "feat: integrate guest photo capture UI card into Admin CMS"
  ```

---

### Task 6: Supabase Bucket Creation Verification

**Files:**
- Test: Manual check on Supabase Storage Bucket

- [ ] **Step 1: Buat Storage Bucket di Dashboard Supabase**
  1. Masuk ke dashboard proyek Supabase Anda.
  2. Buka menu **Storage** di sidebar kiri.
  3. Klik **New Bucket** di panel storage.
  4. Beri nama bucket: `guest-photos` (pastikan sama persis, huruf kecil, tanda hubung).
  5. Centang pilihan **Public bucket** agar foto dapat diakses langsung oleh browser penerima tamu via URL.
  6. Simpan konfigurasi bucket.

- [ ] **Step 2: Konfigurasi Policies (RLS) untuk Bucket**
  Buat policy baru di bucket `guest-photos`:
  - **SELECT Policy**: Pilih *Allowed for Everyone (Public)*.
  - **INSERT/UPDATE Policy**: Izinkan untuk semua orang (anon/public) untuk mempermudah upload langsung dari browser, atau batasi hanya untuk pengguna terotentikasi.
  Expected: Bucket berhasil dibuat dan dikonfigurasi sebagai publik.
