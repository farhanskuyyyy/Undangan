# Guest Inline RSVP & Management CRUD with CSV Import (Sub-Project G) Implementation Plan

## Goal
Implementasikan form RSVP tamu secara menyatu (inline) pada halaman utama undangan, serta buat tab navigasi baru di Admin CMS berisi tabel manajemen tamu lengkap (Tambah/Ubah/Hapus/Salin Link WA) dan fitur impor massal data tamu berbasis unggahan berkas CSV.

---

### Task 1: Dapatkan Status Tamu & Tampilkan Form RSVP Inline
**Files:**
- Modify: `src/pages/Invitation.tsx`

- [x] **Step 1: Dapatkan data tamu di Invitation.tsx**
  Mengambil parameter `to` (`qr_code`) dan mengambil kolom `name`, `invited_pax`, dan `description` dari database Supabase secara aman.
  
- [x] **Step 2: Teruskan props dan render RSVPForm secara inline**
  Merender komponen `<RSVPForm>` secara langsung di bawah detail lokasi undangan utama, mengirimkan prop `guestId`, `guestName`, `invitedPax`, dan `guestDescription` agar tersinkronisasi.

- [x] **Step 3: Uji build**
  Jalankan: `npm run build`
  Expected: PASS

---

### Task 2: Implement Segmented Tabs & Guest List in AdminCMS
**Files:**
- Modify: `src/pages/AdminCMS.tsx`

- [x] **Step 1: Deklarasikan state activeTab di AdminCMS**
  Tambahkan state baru untuk navigasi tab di komponen `AdminCMS` (sekitar baris 48):
  ```typescript
  const [activeTab, setActiveTab] = useState<'presence' | 'management'>('presence')
  ```

- [x] **Step 2: Desain elemen toggle navigasi tab**
  Buka JSX AdminCMS, di bawah `<header>` (sekitar baris 587), sisipkan tombol segmented tab modern:
  ```tsx
          <div className="flex bg-[#FDFBF7] p-1.5 rounded-2xl mb-8 border border-[#E5E1DA] max-w-md">
            <button
              onClick={() => setActiveTab('presence')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'presence'
                  ? 'bg-[#4A5D4E] text-white shadow-sm'
                  : 'text-[#8C9A8E] hover:text-[#4A5D4E]'
              }`}
            >
              Dashboard Kehadiran
            </button>
            <button
              onClick={() => setActiveTab('management')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'management'
                  ? 'bg-[#4A5D4E] text-white shadow-sm'
                  : 'text-[#8C9A8E] hover:text-[#4A5D4E]'
              }`}
            >
              Manajemen Undangan
            </button>
          </div>
  ```

- [x] **Step 3: Bungkus antarmuka lama di bawah tab presence**
  Bungkus seluruh dashboard lama (mulai dari `<div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">` sampai penutupan grid 3 kolom tabel, sekitar baris 1310) ke dalam kondisi:
  ```tsx
  {activeTab === 'presence' ? (
    <>
      {/* Seluruh konten lama */}
    </>
  ) : (
    // Area Manajemen Undangan
  )}
  ```

- [x] **Step 4: Impor ikon Lucide-React tambahan**
  Tambahkan ikon `Plus`, `Edit`, `Trash2`, `Copy`, `FileSpreadsheet`, `Check` ke daftar impor `lucide-react` di bagian atas file `AdminCMS.tsx`.

- [x] **Step 5: Uji build sementara**
  Jalankan: `npm run build`
  Expected: PASS

---

### Task 3: Create Guest Management Table and CRUD Modal Form
**Files:**
- Modify: `src/pages/AdminCMS.tsx`

- [x] **Step 1: Deklarasikan state manajemen tamu baru**
  Tambahkan state untuk form modal Tambah/Ubah tamu di komponen `AdminCMS` (sekitar baris 49):
  ```typescript
  const [showCrudModal, setShowCrudModal] = useState(false)
  const [editingGuest, setEditingGuest] = useState<any>(null)
  const [crudName, setCrudName] = useState('')
  const [crudDescription, setCrudDescription] = useState('')
  const [crudInvitedPax, setCrudInvitedPax] = useState(2)
  const [crudIsVip, setCrudIsVip] = useState(false)
  const [crudSearch, setCrudSearch] = useState('')
  ```

- [x] **Step 2: Desain layout utama Manajemen Undangan**
  Di area `activeTab === 'management'`, desain layout tabel daftar tamu lengkap, bar pencarian manajemen, tombol tambah tamu baru, serta tombol unduh template CSV dan unggah file impor CSV.
  
- [x] **Step 3: Implementasikan fungsi simpan tamu (Save / Update)**
  Buat fungsi `handleSaveGuest` untuk menyimpan tamu baru (insert) atau memperbarui tamu yang ada (update) langsung ke tabel `guests` di Supabase. Fungsi ini otomatis men-generate QR Code acak unik berformat `GUEST-XXXXX` jika menambahkan tamu baru.

- [x] **Step 4: Implementasikan aksi Edit dan Hapus**
  * **Edit:** Mengisi state modal dengan data tamu terpilih dan menampilkan dialog.
  * **Hapus:** Melakukan query `.delete()` tamu dari Supabase setelah konfirmasi admin disetujui.

- [x] **Step 5: Uji build sementara**
  Jalankan: `npm run build`
  Expected: PASS

---

### Task 4: Implement Copy Whatsapp Link & CSV Importer
**Files:**
- Modify: `src/pages/AdminCMS.tsx`

- [x] **Step 1: Salin Tautan WhatsApp**
  Implementasikan fungsionalitas salin ke papan klip (*clipboard*) tautan undangan digital personalisasi:
  `const url = `${window.location.origin}/?to=${guest.qr_code}``
  Tampilkan notifikasi toast kecil saat tautan disalin dengan sukses.

- [x] **Step 2: Download Template CSV**
  Implementasikan fungsi `handleDownloadCSVTemplate` yang menghasilkan file `template_import_tamu.csv` berisi header `Nama,Keterangan,Kapasitas_Pax,VIP_Ya_Tidak` dan satu baris contoh instan secara client-side menggunakan teknik Blob.

- [x] **Step 3: Impor CSV Massal (Client-Side Parser & Bulk Insert)**
  Implementasikan logika `handleImportCSV` untuk membaca file CSV yang diunggah admin, mem-parse konten barisnya secara otomatis (mengabaikan baris kosong dan header), men-generate QR Code unik acak untuk masing-masing tamu baru, mencocokkan VIP Boolean, dan menjalankan `.insert(bulkGuests)` secara sekaligus ke Supabase database.

- [x] **Step 4: Uji build kompilasi akhir secara menyeluruh**
  Jalankan: `npm run build`
  Expected: PASS 100% tanpa error, warning, atau linter warnings.
