# Design Spec: Fitur Foto Tamu Undangan di Admin CMS

> [!NOTE]
> Dokumen ini menjelaskan spesifikasi desain untuk penambahan fitur pengambilan foto tamu undangan secara langsung melalui kamera di Admin CMS setelah melakukan check-in / scan QR Code. Data foto akan diunggah ke Supabase Storage Bucket dan disimpan ke database Supabase.

---

## 1. Tujuan & Latar Belakang

Fitur ini dirancang untuk mendokumentasikan kehadiran tamu undangan pernikahan secara visual di meja penerima tamu (Check-in / Gate). Setelah proses verifikasi QR Code atau pencarian manual berhasil, penerima tamu (Admin) dapat langsung mengambil foto tamu sebagai bukti kehadiran fisik dan kenang-kenangan, ditempatkan tepat di bawah status penyerahan souvenir.

---

## 2. Arsitektur & Perubahan Database

### 2.1 Tambahan Kolom Database
Kita perlu menambahkan kolom baru pada tabel `guests` di database Supabase untuk menampung tautan URL foto tamu.

```sql
-- Query migrasi database
ALTER TABLE guests ADD COLUMN photo_url TEXT;
```

### 2.2 Konfigurasi Supabase Storage
Foto tamu akan diunggah langsung ke layanan penyimpanan Supabase Storage:
- **Nama Bucket**: `guest-photos`
- **Aksesibilitas**: **Public** (agar foto dapat diakses dan ditampilkan di browser melalui URL publik).
- **Struktur File**: `photos/[guest_id].jpg`
- **Kebijakan Akses (RLS - Row Level Security)**:
  - `SELECT`: Diizinkan untuk publik (`true`).
  - `INSERT` / `UPDATE`: Diizinkan untuk semua pengakses (atau dibatasi ke pengguna terotentikasi).
  - `DELETE`: Diizinkan untuk pengguna terotentikasi (admin).

---

## 3. Desain Antarmuka (UI/UX States)

Fitur ini akan diintegrasikan pada berkas [AdminCMS.tsx](file:///Users/farhanarfianto/Projects/react/Undangan/src/pages/AdminCMS.tsx) di dalam kartu informasi tamu detail, tepat di bawah kartu **Status Souvenir**.

```
+------------------------------------------+
|             STATUS SOUVENIR              |
| [ Sudah Diambil ] / [ Belum Diambil ]    |
|   (Tombol: Berikan Souvenir)             |
+------------------------------------------+
|                FOTO TAMU                 |
|                                          |
|  [State 1: Kosong]                       |
|  (Ikon Kamera)                           |
|  [ Tombol: Buka Kamera ]                 |
|                                          |
|  [State 2: Kamera Aktif]                 |
|  [ Video Stream (Live) ]                 |
|  [ Tombol: Ambil Foto ] [ Tombol: Batal ]|
|                                          |
|  [State 3: Preview Hasil]                |
|  [ Foto Beku (Freeze)  ]                 |
|  [ Tombol: Simpan ] [ Tombol: Ulang ]    |
|                                          |
|  [State 4: Foto Terunggah]               |
|  [ Gambar Tamu (Rounded) ]               |
|  (Lencana: Foto Tersimpan)               |
|  [ Tombol: Ambil Foto Baru ]             |
+------------------------------------------+
```

---

## 4. Logika Teknis & Implementasi Code

### 4.1 State Management (React)
Beberapa state baru yang diperlukan di `AdminCMS.tsx`:
```typescript
const [cameraActive, setCameraActive] = useState(false);
const [capturedImage, setCapturedImage] = useState<string | null>(null); // base64 untuk preview lokal
const [imageBlob, setImageBlob] = useState<Blob | null>(null); // blob untuk di-upload ke Supabase
const [uploadingPhoto, setUploadingPhoto] = useState(false);
const videoRef = useRef<HTMLVideoElement | null>(null);
const streamRef = useRef<MediaStream | null>(null);
```

### 4.2 Alur Logika Kamera (Native API)

1. **Mengaktifkan Kamera**:
   ```typescript
   const startCamera = async () => {
     try {
       const stream = await navigator.mediaDevices.getUserMedia({
         video: { facingMode: 'environment' } // Mengutamakan kamera belakang (admin memotret tamu)
       });
       if (videoRef.current) {
         videoRef.current.srcObject = stream;
       }
       streamRef.current = stream;
       setCameraActive(true);
       setCapturedImage(null);
     } catch (err) {
       console.error("Gagal membuka kamera:", err);
       alert("Gagal mengakses kamera. Mohon berikan izin akses kamera.");
     }
   };
   ```

2. **Menangkap Foto (Snapshot)**:
   ```typescript
   const captureSnapshot = () => {
     if (videoRef.current) {
       const video = videoRef.current;
       const canvas = document.createElement('canvas');
       
       // Mengatur resolusi canvas sesuai resolusi video asli
       canvas.width = video.videoWidth;
       canvas.height = video.videoHeight;
       
       const ctx = canvas.getContext('2d');
       if (ctx) {
         // Gambar frame video ke canvas
         ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
         
         // Konversi ke base64 untuk preview lokal instan
         const dataUrl = canvas.toDataURL('image/jpeg');
         setCapturedImage(dataUrl);
         
         // Konversi ke Blob terkompresi (kualitas 0.8) untuk di-upload
         canvas.toBlob((blob) => {
           setImageBlob(blob);
         }, 'image/jpeg', 0.8);
       }
       
       // Matikan kamera setelah snapshot diambil
       stopCameraStream();
     }
   };
   ```

3. **Menghentikan Aliran Kamera**:
   ```typescript
   const stopCameraStream = () => {
     if (streamRef.current) {
       streamRef.current.getTracks().forEach(track => track.stop());
       streamRef.current = null;
     }
     setCameraActive(false);
   };
   ```

4. **Mengunggah & Menyimpan ke Supabase**:
   ```typescript
   const savePhoto = async () => {
     if (!imageBlob || !guest) return;
     setUploadingPhoto(true);
     
     const filePath = `photos/${guest.id}.jpg`;
     
     try {
       // 1. Upload ke Supabase Storage (upsert = true untuk overwrite jika ambil foto ulang)
       const { error: uploadError } = await supabase.storage
         .from('guest-photos')
         .upload(filePath, imageBlob, {
           contentType: 'image/jpeg',
           upsert: true
         });
         
       if (uploadError) throw uploadError;
       
       // 2. Dapatkan URL Publik
       const { data: { publicUrl } } = supabase.storage
         .from('guest-photos')
         .getPublicUrl(filePath);
         
       // 3. Update data URL foto di tabel guests
       const { error: dbError } = await supabase
         .from('guests')
         .update({ photo_url: publicUrl })
         .eq('id', guest.id);
         
       if (dbError) throw dbError;
       
       // 4. Perbarui state guest lokal
       setGuest({ ...guest, photo_url: publicUrl });
       setCapturedImage(null);
       setImageBlob(null);
       alert("Foto tamu berhasil disimpan!");
       
     } catch (err) {
       console.error("Gagal menyimpan foto:", err);
       alert("Gagal mengunggah foto tamu.");
     } finally {
       setUploadingPhoto(false);
     }
   };
   ```

---

## 5. Penanganan Error & Skenario Alternatif

1. **Izin Kamera Ditolak**:
   Jika pengguna menolak izin kamera, sistem akan menampilkan pesan peringatan yang ramah dan memandu admin untuk mengizinkan kamera di browser mereka.
2. **Kamera Tidak Ditemukan**:
   Pada perangkat desktop yang tidak memiliki webcam, tombol "Buka Kamera" akan diblokir dengan penjelasan yang sesuai agar admin mengetahui perangkat tersebut tidak mendukung kamera.
3. **Koneksi Terputus Saat Upload**:
   Jika proses unggah gagal karena masalah jaringan, tombol "Simpan" tetap aktif sehingga admin bisa mencoba menyimpan ulang tanpa kehilangan foto yang sudah diambil.
4. **Pembersihan Resource**:
   Setiap kali halaman dibongkar (*unmounted*) atau tamu lain dipilih, semua aliran kamera dipastikan mati lewat *cleanup hook* `useEffect`.
