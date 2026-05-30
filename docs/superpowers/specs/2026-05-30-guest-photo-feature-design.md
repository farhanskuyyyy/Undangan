# Design Spec: Fitur Foto Tamu Undangan di Admin CMS (Updated)

> [!NOTE]
> Dokumen ini menjelaskan spesifikasi desain terpadu untuk fitur foto tamu undangan di Admin CMS: proses pengambilan foto menggunakan kamera, penyimpanan di Supabase Storage & DB, penambahan **Modal Lightbox Zoom**, serta **Galeri Tamu Hadir Berpaginasi** di bagian bawah halaman.

---

## 1. Tujuan & Fitur Utama

Fitur ini dirancang untuk mendokumentasikan kehadiran tamu undangan secara visual di Admin CMS Check-in:
1. **Ambil Foto**: Kamera native menangkap snapshot tamu terkompresi (JPEG 80%), diunggah ke Supabase Storage `guest-photos`, dan disimpan ke kolom `photo_url`.
2. **Modal Lightbox Zoom**: Admin dapat mengklik gambar tamu di kartu informasi atau di galeri untuk memperbesar foto tamu dalam modal popup bergaya *glassmorphism backdrop blur* yang elegan.
3. **Galeri Tamu Hadir Berpaginasi**: Menampilkan grid modern visual seluruh tamu hadir yang memiliki foto di bagian bawah CMS dengan kapasitas 8 kartu per halaman, lengkap dengan navigasi paginasi.

---

## 2. Arsitektur & Perubahan Database

### 2.1 Tambahan Kolom Database & Storage
- **Database**: Kolom `photo_url` (`TEXT`) pada tabel `guests`.
- **Storage**: Bucket publik Supabase bernama `guest-photos` dengan path berkas `photos/[guest_id].jpg`.

### 2.2 Perubahan Kueri Pengambilan Data
Kueri pengambilan tamu hadir pada fungsi `fetchGuests` diubah agar turut memuat kolom `id` dan `photo_url` untuk memfasilitasi kebutuhan galeri foto tamu hadir:
```typescript
const { data: arrivedData, error: arrivedError } = await supabase
  .from('guests')
  .select('id, name, arrival_time, is_vip, photo_url')
  .eq('has_arrived', true)
  .order('arrival_time', { ascending: false })
```

---

## 3. Desain Antarmuka (UI/UX States)

### 3.1 Modal Lightbox Zoom
Modal melayang yang merender foto tamu dalam resolusi tinggi di tengah layar.
```
+------------------------------------------+
|  [X]                                     |
|                                          |
|                [ FOTO ]                  |
|                                          |
|        NAMA TAMU [ VIP ]                 |
|        Tiba: 19:45 WIB                   |
+------------------------------------------+
```
- **CSS Styling**: `fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md transition-all duration-300`
- **Interaksi**: Klik tombol [X] atau area gelap di luar foto untuk menutup modal.

### 3.2 Galeri Tamu Hadir (Bagian Bawah Halaman)
Diposisikan di bawah tabel "Tamu Hadir" & "Belum Hadir".
```
============================================================
                  📸 Galeri Kehadiran Tamu (12 Foto)
============================================================
+----------------+ +----------------+ +----------------+
|    [ FOTO ]    | |    [ FOTO ]    | |    [ FOTO ]    |
| Nama [VIP]     | | Nama [VIP]     | | Nama [VIP]     |
| 19:45 WIB      | | 19:48 WIB      | | 19:50 WIB      |
+----------------+ +----------------+ +----------------+
                 Halaman 1 dari 2
             [< Sebelum]  [Sesudah >]
```

---

## 4. Logika Teknis & Penambahan State

### 4.1 State Management Baru (React)
```typescript
const [galleryPage, setGalleryPage] = useState(1);
const [lightboxGuest, setLightboxGuest] = useState<any>(null);
```

### 4.2 Logika Paginasi Galeri
Filter data tamu hadir yang memiliki foto, lalu potong array sesuai halaman aktif:
```typescript
const ITEMS_PER_PAGE = 8;
const guestsWithPhotos = arrivedGuests.filter(g => g.photo_url);
const totalPages = Math.max(1, Math.ceil(guestsWithPhotos.length / ITEMS_PER_PAGE));
const paginatedGuests = guestsWithPhotos.slice(
  (galleryPage - 1) * ITEMS_PER_PAGE,
  galleryPage * ITEMS_PER_PAGE
);
```

---

## 5. Implementasi UI Code (Sketsa Sintaks)

### 5.1 Modal Lightbox JSX
```tsx
{lightboxGuest && (
  <div 
    className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-4 transition-all duration-300"
    onClick={() => setLightboxGuest(null)}
  >
    <button 
      className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all"
      onClick={() => setLightboxGuest(null)}
    >
      <X size={24} />
    </button>
    <div 
      className="relative max-w-lg w-full bg-[#FDFBF7] rounded-2xl overflow-hidden border border-[#E5E1DA] shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="aspect-square w-full">
        <img 
          src={lightboxGuest.photo_url} 
          alt={lightboxGuest.name} 
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="p-6 bg-white border-t border-[#F3F1ED]">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-xl font-serif text-[#4A5D4E] font-medium">{lightboxGuest.name}</h3>
          {lightboxGuest.is_vip && (
            <span className="bg-amber-400 text-amber-950 text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
              VIP
            </span>
          )}
        </div>
        <p className="text-xs text-[#8C9A8E] flex items-center gap-1.5">
          <Clock size={14} /> Tiba pukul {new Date(lightboxGuest.arrival_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
        </p>
      </div>
    </div>
  </div>
)}
```

### 5.2 Galeri Tamu JSX
```tsx
<div className="mt-12 pt-12 border-t border-[#E5E1DA] space-y-6">
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2 text-[#4A5D4E]">
      <Camera size={22} />
      <h2 className="text-xl font-medium">Galeri Kehadiran Tamu</h2>
    </div>
    <span className="bg-[#F0F4F1] text-[#4A5D4E] px-3 py-1 rounded-full text-xs font-bold">
      {guestsWithPhotos.length} Foto
    </span>
  </div>

  {paginatedGuests.length > 0 ? (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        {paginatedGuests.map((g) => (
          <div 
            key={g.id} 
            className="bg-white rounded-xl overflow-hidden border border-[#E5E1DA] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col"
          >
            <div 
              className="aspect-square w-full overflow-hidden bg-gray-50 relative group cursor-zoom-in"
              onClick={() => setLightboxGuest(g)}
            >
              <img src={g.photo_url} alt={g.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                <span className="bg-white/90 text-[#4A5D4E] text-xs px-3 py-1.5 rounded-lg font-medium shadow flex items-center gap-1">
                  <Eye size={14} /> Lihat Foto
                </span>
              </div>
            </div>
            <div className="p-3 flex flex-col flex-1 border-t border-[#F3F1ED]">
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className="font-serif text-sm font-medium text-[#4A5D4E] truncate flex-1">{g.name}</span>
                {g.is_vip && <span className="text-[8px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-bold">VIP</span>}
              </div>
              <span className="text-[10px] text-[#8C9A8E] flex items-center gap-1">
                <Clock size={10} /> {new Date(g.arrival_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Navigasi Paginasi */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <button
            onClick={() => setGalleryPage(p => Math.max(1, p - 1))}
            disabled={galleryPage === 1}
            className="flex items-center gap-1 text-xs text-[#4A5D4E] hover:text-[#3D4C40] disabled:text-gray-300 font-medium transition-all"
          >
            <ChevronLeft size={16} /> Sebelumnya
          </button>
          <span className="text-xs text-[#8C9A8E] font-medium">
            Halaman {galleryPage} dari {totalPages}
          </span>
          <button
            onClick={() => setGalleryPage(p => Math.min(totalPages, p + 1))}
            disabled={galleryPage === totalPages}
            className="flex items-center gap-1 text-xs text-[#4A5D4E] hover:text-[#3D4C40] disabled:text-gray-300 font-medium transition-all"
          >
            Selanjutnya <ChevronRight size={16} />
          </button>
        </div>
      )}
    </>
  ) : (
    <div className="text-center py-12 text-[#8C9A8E] bg-gray-50/50 rounded-2xl border border-dashed border-[#E5E1DA]">
      <Camera size={32} className="mx-auto mb-2 opacity-50" />
      <p className="text-sm">Belum ada foto tamu terkumpul</p>
    </div>
  )}
</div>
```
