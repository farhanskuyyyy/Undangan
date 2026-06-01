# Twibbon Cetak Tamu & RSVP Nullable (Sub-Project G) Implementation Plan

## Goal
Implementasikan kamera ber-Twibbon saat tamu check-in, tombol ganti arah kamera (Switch Camera), tombol cetak di Galeri & Lightbox CMS dengan jendela cetak khusus, serta migrasi status konfirmasi kehadiran menjadi nullable guna membagi kategori statistik dan filter secara presisi.

---

### Task 1: Database Migration & Schema Updates
**Files:**
- Create: `update_schema_rsvp_nullable.sql`

- [ ] **Step 1: Buat file SQL migrasi di root proyek**
  Buat file `update_schema_rsvp_nullable.sql` untuk merubah default `rsvp_status` dan meng-update data lama.
  ```sql
  -- Ubah default constraint rsvp_status menjadi NULL
  ALTER TABLE guests ALTER COLUMN rsvp_status SET DEFAULT NULL;

  -- Rapikan data lama yang belum konfirmasi ke NULL
  UPDATE guests 
  SET rsvp_status = NULL 
  WHERE rsvp_status = false 
    AND message IS NULL 
    AND has_arrived = false;
  ```

- [ ] **Step 2: Terapkan migrasi tersebut ke Supabase SQL Editor**
  Salin isi file ini dan eksekusi di SQL Editor dashboard Supabase Anda.

---

### Task 2: Update Frontend RSVP Submission (`RSVPForm.tsx`)
**Files:**
- Modify: `src/components/RSVPForm.tsx`

- [ ] **Step 1: Perbarui select element untuk Konfirmasi Kehadiran**
  Sesuaikan input `<select>` agar memetakan input string `"true"`, `"false"` dengan benar.
  ```tsx
  <select
    {...register('rsvp_status', { required: true })}
    className="w-full bg-white/50 border border-primary/20 rounded-2xl px-5 py-4 focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all duration-300 font-sans text-burgundy cursor-pointer appearance-none"
  >
    <option value="true">Akan Hadir</option>
    <option value="false">Tidak Bisa Hadir</option>
  </select>
  ```

- [ ] **Step 2: Perbarui parser status RSVP di wishes list fetch**
  Ubah parser di fungsi `fetchMessages` sekitar baris 60:
  ```typescript
  rsvp_status: d.rsvp_status === true || String(d.rsvp_status) === 'true',
  ```
  Ini memastikan jika status di DB adalah `null`, ia tidak dideteksi sebagai "Hadir" atau "Tidak Hadir" yang salah.

---

### Task 3: Dashboard RSVP Statistics Updates (`AdminCMS.tsx`)
**Files:**
- Modify: `src/pages/AdminCMS.tsx`

- [ ] **Step 1: Perbarui logika perhitungan analitik di `AdminCMS.tsx`**
  Temukan perhitungan statistik RSVP di sekitar baris 844-848. Ganti dengan logika 3 kondisi:
  ```typescript
  const rsvpGuests = [...arrivedGuests, ...pendingGuests].filter(g => g.rsvp_status === true);
  const totalRsvpedCount = rsvpGuests.length;
  
  const totalConfirmedTidakHadir = [...arrivedGuests, ...pendingGuests].filter(g => g.rsvp_status === false).length;
  const totalBelumKonfirmasi = [...arrivedGuests, ...pendingGuests].filter(g => g.rsvp_status === null || g.rsvp_status === undefined).length;
  
  const rsvpPercent = totalGuestsCount > 0 ? (totalRsvpedCount / totalGuestsCount) * 100 : 0;
  const rsvpPaxCount = rsvpGuests.reduce((acc, g) => acc + (g.attendance_count || 1), 0);
  ```

- [ ] **Step 2: Tata ulang Grid Kartu Statistik menjadi 5 Kolom**
  Ubah grid kelas pembungkus sekitar baris 1797 dari `lg:grid-cols-4` menjadi `lg:grid-cols-5`.
  Tambahkan kartu statistik baru untuk **Tidak Hadir** dan sesuaikan kartu **Belum Konfirmasi**:
  ```tsx
  {/* Total Tamu */}
  <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#E5E1DA] shadow-sm">
    <span className="text-[10px] text-[#8C9A8E] uppercase tracking-wider font-semibold flex items-center gap-1">
      <Users size={12} /> Total Tamu
    </span>
    <p className="text-2xl font-bold text-[#4A5D4E] font-serif mt-1">{totalGuestsCount}</p>
    <p className="text-[10px] text-[#8C9A8E] mt-0.5">Tamu terdaftar</p>
  </div>

  {/* RSVP Hadir */}
  <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#E5E1DA] shadow-sm">
    <span className="text-[10px] text-[#8C9A8E] uppercase tracking-wider font-semibold flex items-center gap-1">
      <CheckCircle size={12} className="text-green-600" /> RSVP Hadir
    </span>
    <p className="text-2xl font-bold text-green-700 font-serif mt-1">
      {totalRsvpedCount} <span className="text-xs text-gray-400 font-sans font-normal">({rsvpPercent.toFixed(0)}%)</span>
    </p>
    <p className="text-[10px] text-[#8C9A8E] mt-0.5">Total: {rsvpPaxCount} Pax</p>
  </div>

  {/* RSVP Tidak Hadir */}
  <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#E5E1DA] shadow-sm">
    <span className="text-[10px] text-[#8C9A8E] uppercase tracking-wider font-semibold flex items-center gap-1">
      <XCircle size={12} className="text-rose-600" /> Tidak Hadir
    </span>
    <p className="text-2xl font-bold text-rose-700 font-serif mt-1">{totalConfirmedTidakHadir}</p>
    <p className="text-[10px] text-[#8C9A8E] mt-0.5">Tamu berhalangan hadir</p>
  </div>

  {/* Belum Konfirmasi */}
  <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#E5E1DA] shadow-sm">
    <span className="text-[10px] text-[#8C9A8E] uppercase tracking-wider font-semibold flex items-center gap-1">
      <HelpCircle size={12} className="text-amber-600" /> Belum Konfirmasi
    </span>
    <p className="text-2xl font-bold text-amber-700 font-serif mt-1">{totalBelumKonfirmasi}</p>
    <p className="text-[10px] text-[#8C9A8E] mt-0.5">Belum merespons undangan</p>
  </div>

  {/* Kapasitas Pax */}
  <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#E5E1DA] shadow-sm">
    <span className="text-[10px] text-[#8C9A8E] uppercase tracking-wider font-semibold flex items-center gap-1">
      <TrendingUp size={12} /> Kapasitas Pax
    </span>
    <p className="text-2xl font-bold text-blue-600 font-serif mt-1">{maxExpectedPax}</p>
    <p className="text-[10px] text-[#8C9A8E] mt-0.5">Maksimal porsi katering</p>
  </div>
  ```

---

### Task 4: Guest List Filters Extension (`AdminCMS.tsx`)
**Files:**
- Modify: `src/pages/AdminCMS.tsx`

- [ ] **Step 1: Perbarui state dan tipe untuk `crudRsvpFilter`**
  Temukan deklarasi filter di sekitar baris 68-75:
  ```typescript
  const [crudRsvpFilter, setCrudRsvpFilter] = useState<'all' | 'confirmed' | 'not_attending' | 'unconfirmed'>('all');
  ```

- [ ] **Step 2: Perbarui penyaringan daftar tamu**
  Temukan bagian filter untuk `filteredAllGuests` di sekitar baris 871-875:
  ```typescript
    .filter(g => {
      if (crudRsvpFilter === 'confirmed') return g.rsvp_status === true;
      if (crudRsvpFilter === 'not_attending') return g.rsvp_status === false;
      if (crudRsvpFilter === 'unconfirmed') return g.rsvp_status === null || g.rsvp_status === undefined;
      return true;
    })
  ```

- [ ] **Step 3: Perbarui select dropdown di HTML**
  Ubah opsi elemen `<select>` filter RSVP di sekitar baris 1865-1878:
  ```tsx
  <select
    value={crudRsvpFilter}
    onChange={(e) => {
      setCrudRsvpFilter(e.target.value as any)
      setCrudPage(1)
    }}
    className="w-full bg-[#FDFBF7] border border-[#E5E1DA] rounded-xl py-2.5 px-4 outline-none focus:ring-1 focus:ring-[#4A5D4E] transition-all shadow-sm text-sm text-[#4A5D4E]"
  >
    <option value="all">Semua RSVP</option>
    <option value="confirmed">RSVP Hadir</option>
    <option value="not_attending">Tidak Hadir ❌</option>
    <option value="unconfirmed">Belum Konfirmasi ⏳</option>
  </select>
  ```

---

### Task 5: Switch Camera Integration in Check-in Camera (`AdminCMS.tsx`)
**Files:**
- Modify: `src/pages/AdminCMS.tsx`

- [ ] **Step 1: Tambahkan state untuk camera switch**
  Tambahkan state `facingMode` setelah state kamera dasar:
  ```typescript
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  ```

- [ ] **Step 2: Modifikasi fungsi `startCamera`**
  Sesuaikan parameter `facingMode` pada constraints kamera:
  ```typescript
  const startCamera = async () => {
    setCameraActive(true)
    setCapturedImage(null)
    setImageBlob(null)
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      })
      streamRef.current = stream
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      }, 100)
    } catch (err) {
      console.error("Gagal membuka kamera:", err)
      showAlert("Gagal mengakses kamera. Mohon pastikan izin akses kamera telah diberikan.", "error", "Kamera Gagal")
    }
  }
  ```

- [ ] **Step 3: Implementasikan tombol Switch Camera di UI Kamera**
  Temukan render panel kamera modal (sekitar baris 2200) dan tambahkan tombol ganti arah kamera menggunakan icon `RefreshCw`:
  ```tsx
  <button
    type="button"
    onClick={async () => {
      stopCameraStream();
      setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    }}
    className="bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-md shadow-lg transition-all"
    title="Ganti Kamera"
  >
    <RefreshCw size={20} />
  </button>
  ```
  Dan pastikan kita menambahkan pemicu ulang `startCamera` saat `facingMode` berubah di `useEffect`.

---

### Task 6: Canvas Composite Twibbon Merging (`AdminCMS.tsx`)
**Files:**
- Modify: `src/pages/AdminCMS.tsx`

- [ ] **Step 1: Definisikan fungsi SVG Twibbon generator di kode**
  Buat fungsi utilitas di luar komponen untuk menghasilkan XML String SVG Twibbon estetik yang memuat nama mempelai dinamis:
  ```typescript
  const getTwibbonSVGString = (names: string, date: string) => {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
      <!-- Bingkai Floral Tipis & Ornamen Emas di Sudut -->
      <rect x="25" y="25" width="750" height="750" rx="30" fill="none" stroke="#D4AF37" stroke-width="4" opacity="0.65"/>
      <rect x="35" y="35" width="730" height="730" rx="20" fill="none" stroke="#8A9A86" stroke-width="1.5" opacity="0.4"/>
      
      <!-- Ornamen Pojok Floral -->
      <path d="M 25 150 C 25 75 75 25 150 25" fill="none" stroke="#D4AF37" stroke-width="6"/>
      <path d="M 650 25 C 725 25 775 75 775 150" fill="none" stroke="#D4AF37" stroke-width="6"/>
      <path d="M 25 650 C 25 725 75 775 150 775" fill="none" stroke="#D4AF37" stroke-width="6"/>
      <path d="M 650 775 C 725 775 775 725 775 650" fill="none" stroke="#D4AF37" stroke-width="6"/>
      
      <!-- Banner Gradasi Bawah Tamu -->
      <rect x="0" y="660" width="800" height="140" fill="rgba(253, 251, 247, 0.93)"/>
      <line x1="0" y1="660" x2="800" y2="660" stroke="#E5E1DA" stroke-width="2"/>
      
      <!-- Teks Ucapan Pernikahan Dinamis -->
      <text x="400" y="715" font-family="'Cormorant Garamond', Georgia, serif" font-size="28" font-weight="bold" fill="#4A5D4E" text-anchor="middle" letter-spacing="1">THE WEDDING OF</text>
      <text x="400" y="755" font-family="'Cormorant Garamond', Georgia, serif" font-size="34" font-weight="bold" font-style="italic" fill="#C17E61" text-anchor="middle" letter-spacing="1.5">${names}</text>
      <text x="400" y="785" font-family="'Montserrat', sans-serif" font-size="12" font-weight="bold" fill="#8A9A86" text-anchor="middle" letter-spacing="3">${date.toUpperCase()}</text>
    </svg>`;
  };
  ```

- [ ] **Step 2: Gabungkan Twibbon saat `captureSnapshot` berjalan**
  Perbarui fungsi `captureSnapshot` (sekitar baris 520) agar memuat Twibbon dinamis di canvas sebelum Blob diekspor:
  ```typescript
  const captureSnapshot = () => {
    if (videoRef.current) {
      const video = videoRef.current
      const canvas = document.createElement('canvas')
      
      canvas.width = 800
      canvas.height = 800
      
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // Potong video menjadi rasio square 1:1 di tengah
        const videoSize = Math.min(video.videoWidth, video.videoHeight);
        const sx = (video.videoWidth - videoSize) / 2;
        const sy = (video.videoHeight - videoSize) / 2;
        
        ctx.drawImage(video, sx, sy, videoSize, videoSize, 0, 0, 800, 800);
        
        // Overlay Twibbon SVG
        const twibbonImg = new Image();
        twibbonImg.onload = () => {
          ctx.drawImage(twibbonImg, 0, 0, 800, 800);
          
          // Dapatkan base64 instan
          const dataUrl = canvas.toDataURL('image/jpeg')
          setCapturedImage(dataUrl)
          
          // Konversi ke blob terkompresi
          canvas.toBlob((blob) => {
            if (blob) setImageBlob(blob)
          }, 'image/jpeg', 0.8)
        };
        twibbonImg.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(getTwibbonSVGString("Farhan & Tazkiah", "19 Juni 2026"));
      }
      stopCameraStream()
    }
  }
  ```

---

### Task 7: Gallery Printing System (`AdminCMS.tsx`)
**Files:**
- Modify: `src/pages/AdminCMS.tsx`

- [ ] **Step 1: Buat fungsi helper pencetakan `handlePrintPhoto`**
  Tambahkan fungsi ini di dalam komponen `AdminCMS`:
  ```typescript
  const handlePrintPhoto = (guest: any) => {
    if (!guest || !guest.photo_url) return;
    
    const printWindow = window.open('', '_blank', 'width=800,height=850');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Cetak Twibbon - ${guest.name}</title>
          <style>
            html, body {
              margin: 0;
              padding: 0;
              width: 100%;
              height: 100%;
              background: white;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            }
            .print-card {
              width: 100%;
              max-width: 600px;
              text-align: center;
              padding: 20px;
              box-sizing: border-box;
            }
            img {
              max-width: 100%;
              height: auto;
              border-radius: 12px;
              border: 1px solid #E5E1DA;
            }
            p {
              font-family: serif;
              font-style: italic;
              color: #4A5D4E;
              margin-top: 15px;
              font-size: 14px;
              line-height: 1.5;
            }
            @media print {
              body { background: white; }
              .print-card { padding: 0; }
              img { border: none; border-radius: 0; }
            }
          </style>
        </head>
        <body>
          <div class="print-card">
            <img src="${guest.photo_url}" />
            <p>Terima kasih telah berbagi kebahagiaan bersama kami. <br><strong>— Farhan & Tazkiah</strong></p>
          </div>
          <script>
            window.onload = function() {
              window.focus();
              setTimeout(function() {
                window.print();
                window.close();
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };
  ```

- [ ] **Step 2: Tambahkan tombol cetak pada Kartu Galeri**
  Temukan render kartu galeri di sekitar baris 1740. Sisipkan tombol printer:
  ```tsx
  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all duration-300">
    <span 
      onClick={() => setLightboxGuest(g)}
      className="bg-white/95 hover:bg-white text-[#4A5D4E] text-[10px] px-2.5 py-1.5 rounded-lg font-medium shadow flex items-center gap-1 cursor-pointer"
    >
      <Eye size={12} /> Lihat
    </span>
    <span 
      onClick={(e) => {
        e.stopPropagation();
        handlePrintPhoto(g);
      }}
      className="bg-[#4A5D4E] hover:bg-[#3D4C40] text-white text-[10px] px-2.5 py-1.5 rounded-lg font-medium shadow flex items-center gap-1 cursor-pointer"
    >
      <Printer size={12} /> Cetak
    </span>
  </div>
  ```

- [ ] **Step 3: Tambahkan tombol cetak pada Modal Zoom (Lightbox)**
  Temukan render detail Lightbox (sekitar baris 2146) dan tambahkan tombol print di bawah detail info tamu:
  ```tsx
  <div className="mt-4 pt-3 border-t border-[#F3F1ED] flex justify-end">
    <button
      onClick={() => handlePrintPhoto(lightboxGuest)}
      className="bg-[#4A5D4E] hover:bg-[#3D4C40] text-white px-4 py-2 rounded-xl text-xs font-semibold shadow flex items-center gap-1.5 transition-all cursor-pointer"
    >
      <Printer size={14} /> Cetak Twibbon Tamu
    </button>
  </div>
  ```

---

### Task 8: Verification & Project Build
- [ ] **Step 1: Jalankan audit build lokal**
  Jalankan perintah berikut di root proyek untuk memastikan tidak ada eror kompilasi TypeScript atau bundling:
  `npm run build`
  Expected: **PASS**
