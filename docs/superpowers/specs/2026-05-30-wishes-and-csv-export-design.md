# Design Spec: Fitur Input Wishes Tamu & Ekspor Laporan CSV (Sub-Proyek A)

> [!NOTE]
> Dokumen ini menjelaskan spesifikasi desain untuk Sub-Proyek A: penambahan modul pengisian **Wedding Wishes** tamu undangan dengan 5 rekomendasi ucapan cepat (Quick Templates) untuk mencegah antrean, serta penambahan tombol **Ekspor Data Tamu (CSV)** dengan encoding UTF-8 BOM untuk Microsoft Excel.

---

## 1. Tujuan & Alur Fitur

1. **Wishes Input**: Setelah check-in dan berfoto, admin dapat memasukkan ucapan selamat dari tamu. Data disimpan ke kolom `message` pada tabel `guests`.
2. **Quick Templates**: Menyediakan 5 rekomendasi ucapan bertombol pil (*pills*). Sekali klik, ucapan disalin ke input textarea. Tamu dapat melanjutkannya atau langsung menyimpannya. Hal ini menghemat waktu mengetik dan memperlancar antrean check-in.
3. **Ekspor CSV**: Menambahkan tombol premium di samping kolom pencarian tamu untuk mengunduh laporan kehadiran ter-update langsung ke file Excel/CSV dengan UTF-8 BOM.

---

## 2. Arsitektur & Perubahan Database

- **Database**: Menggunakan kolom `message` (`TEXT`) yang sudah ada secara bawaan pada tabel `guests` (tidak perlu migrasi kolom baru).
- **Format Ekspor**: Format file adalah `.csv` yang disandikan dengan **UTF-8 BOM (`\uFEFF`)** untuk kompabilitas penuh dengan Microsoft Excel tanpa masalah karakter berantakan.

---

## 3. Desain Antarmuka (UI/UX)

### 3.1 Wishes Input Card (Di bawah Foto Tamu)
Diletakkan di panel kanan tepat di bawah modul **Foto Kehadiran Tamu**.
```
+------------------------------------------+
| ✍️ Ucapan & Doa Tamu                     |
+------------------------------------------+
| ( R1 ) ( R2 ) ( R3 ) ( R4 ) ( R5 )       | <-- Pil Ucapan Cepat
|                                          |
|  +------------------------------------+  |
|  | Masukkan ucapan selamat tamu...    |  | <-- Textarea
|  +------------------------------------+  |
|                                          |
|  [ Tombol: Simpan Ucapan ]               |
+------------------------------------------+
```

### 3.2 Tombol Ekspor CSV
Ditempatkan di samping bar pencarian tamu:
```
+----------------------------------------------------+ +---------------+
| 🔍 Cari nama tamu...                               | | 📥 Ekspor CSV |
+----------------------------------------------------+ +---------------+
```

---

## 4. Logika Teknis & Implementasi Code

### 4.1 State Management Baru (React)
```typescript
const [wishesText, setWishesText] = useState('');
const [savingWishes, setSavingWishes] = useState(false);
```
Setiap kali data tamu dimuat/di-scan, state `wishesText` diperbarui:
```typescript
setWishesText(data.message || '');
```

### 4.2 Tombol Ucapan Cepat (Quick Templates Array)
Daftar 5 ucapan kustom yang akan dirender sebagai pil tombol:
```typescript
const QUICK_WISHES_TEMPLATES = [
  "Selamat menempuh hidup baru! Semoga cinta kalian abadi hingga hari tua.",
  "Selamat atas pernikahannya! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.",
  "Happy wedding! Semoga hari-hari kalian dipenuhi dengan kebahagiaan dan tawa bersama.",
  "Selamat berbahagia! Semoga dilancarkan selalu dalam membangun bahtera rumah tangga yang indah.",
  "Barakallahu lakuma wa baraka 'alaikuma wa jama'a bainakuma fii khair."
];
```

Fungsi ketika pil diklik:
```typescript
const handleSelectTemplate = (template: string) => {
  setWishesText(template);
  // Fokus otomatis ke textarea
  const textarea = document.getElementById('wishes-textarea');
  if (textarea) textarea.focus();
};
```

### 4.3 Logika Menyimpan Ucapan ke Database
```typescript
const saveGuestWishes = async () => {
  if (!guest) return;
  setSavingWishes(true);
  try {
    const { error } = await supabase
      .from('guests')
      .update({ message: wishesText })
      .eq('id', guest.id);

    if (error) throw error;

    // Perbarui state lokal guest
    setGuest({ ...guest, message: wishesText });
    fetchGuests(); // Refresh daftar tamu
    alert("Ucapan tamu berhasil disimpan!");
  } catch (err: any) {
    console.error("Gagal menyimpan ucapan:", err);
    alert(`Gagal menyimpan ucapan: ${err.message}`);
  } finally {
    setSavingWishes(false);
  }
};
```

### 4.4 Logika Ekspor CSV (UTF-8 BOM)
```typescript
const handleExportCSV = async () => {
  try {
    // 1. Ambil data segar langsung dari database
    const { data: allGuests, error } = await supabase
      .from('guests')
      .select('name, is_vip, rsvp_status, has_arrived, arrival_time, souvenir_taken, message, photo_url')
      .order('name', { ascending: true });

    if (error) throw error;
    if (!allGuests || allGuests.length === 0) {
      alert("Tidak ada data tamu untuk diekspor.");
      return;
    }

    // 2. Tentukan Header CSV
    const headers = [
      "Nama Tamu",
      "Kategori (VIP)",
      "RSVP Status",
      "Kehadiran",
      "Waktu Tiba (WIB)",
      "Souvenir Status",
      "Ucapan Selamat (Wishes)",
      "Tautan Foto"
    ];

    // 3. Format Baris Data
    const csvRows = [headers.join(",")];
    
    allGuests.forEach((g) => {
      const row = [
        `"${g.name.replace(/"/g, '""')}"`,
        g.is_vip ? "VIP" : "Regular",
        g.rsvp_status ? "Hadir" : "Belum RSVP",
        g.has_arrived ? "Sudah Check-in" : "Belum Hadir",
        g.arrival_time ? new Date(g.arrival_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : "-",
        g.souvenir_taken ? "Sudah Diambil" : "Belum Diambil",
        `"${(g.message || "").replace(/"/g, '""').replace(/\n/g, " ")}"`, // Bersihkan tanda kutip & baris baru
        g.photo_url ? g.photo_url : "-"
      ];
      csvRows.push(row.join(","));
    });

    // 4. Gabungkan dan tambahkan UTF-8 BOM
    const csvContent = csvRows.join("\n");
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });
    
    // 5. Trigger download file
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Laporan_Kehadiran_Tamu_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
  } catch (err: any) {
    console.error("Gagal mengekspor CSV:", err);
    alert(`Gagal melakukan ekspor data: ${err.message}`);
  }
};
```

---

## 5. Penanganan Kasus Khusus (Edge Cases)

1. **Escaping Tanda Kutip**: Tamu sering kali menggunakan tanda kutip `"` atau membuat baris baru `\n` dalam ucapan mereka. Karakter ini akan disaring secara otomatis dalam logika ekspor (`replace(/"/g, '""')` dan `replace(/\n/g, " ")`) untuk mencegah kolom Excel pecah dan berantakan.
2. **Tanpa Koneksi Internet Saat Ekspor**: Jika ekspor gagal karena jaringan terputus, sistem akan memicu pesan peringatan yang aman dan mencegah halaman crash.
3. **Template Responsif**: Pil rekomendasi ucapan diatur dengan properti Tailwind `flex-wrap` agar di layar HP yang sempit tetap melipat ke bawah secara rapi tanpa keluar dari batas kartu.
