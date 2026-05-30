# Design Spec: Live Dashboard Analytics & Real-time Sync Multi-Gate (Sub-Proyek C)

> [!NOTE]
> Dokumen ini menjelaskan spesifikasi desain untuk Sub-Proyek C: penambahan 4 kartu dasbor analitik interaktif dengan diagram lingkaran **SVG Progress Rings** di bagian atas CMS, serta fitur **Real-time Sync Multi-Gate** menggunakan komunikasi WebSocket Supabase untuk mensinkronisasi data kedatangan secara instan dan memunculkan pop-up notifikasi melayang (Toast Notification Feed).

---

## 1. Tujuan & Fungsionalitas Utama

1. **Dashboard Analytics (SVG Progress Rings)**: Menyediakan ringkasan visual *real-time* di bagian atas CMS dalam bentuk grid responsif 4 kartu. Setiap kartu dilengkapi dengan diagram lingkaran SVG dinamis berputar untuk metrik rasio kehadiran tamu, pembagian souvenir, kedatangan tamu VIP, dan total pax katering.
2. **Real-time Sync Multi-Gate**: Memastikan bahwa ketika admin di pintu gerbang check-in yang lain menandai tamu sebagai hadir, daftar tabel tamu hadir & belum hadir di semua layar admin gerbang lain ter-update seketika tanpa refresh manual.
3. **Toast Notification Feed**: Setiap check-in tamu (VIP maupun Regular) di gerbang mana pun akan memicu notifikasi melayang berdesain premium di pojok kanan bawah layar admin lainnya selama 4 detik.

---

## 2. Arsitektur & State Management (React)

### 2.1 State Tambahan di AdminCMS.tsx
Kita menambahkan satu state untuk melacak antrean notifikasi melayang:
```typescript
interface ToastMessage {
  id: string;
  name: string;
  is_vip: boolean;
  arrival_time: string;
}

const [toasts, setToasts] = useState<ToastMessage[]>([]);
```

### 2.2 Komputasi Statistik Reaktif (Client-Side)
Untuk menghemat kueri database, seluruh statistik dihitung langsung di memori browser dari data tamu yang sudah di-load:
```typescript
// Total undangan terdaftar
const totalGuestsCount = arrivedGuests.length + pendingGuests.length;

// 1. Rasio Kehadiran Tamu
const arrivalPercent = totalGuestsCount > 0 ? arrivedGuests.length / totalGuestsCount : 0;

// 2. Rasio Souvenir Terbagi
const souvenirPercent = arrivedGuests.length > 0 
  ? arrivedGuests.filter(g => g.souvenir_taken).length / arrivedGuests.length 
  : 0;

// 3. Rasio Kehadiran VIP
const totalVIPs = arrivedGuests.filter(g => g.is_vip).length + pendingGuests.filter(g => g.is_vip).length;
const vipArrivalPercent = totalVIPs > 0 
  ? arrivedGuests.filter(g => g.is_vip).length / totalVIPs 
  : 0;

// 4. Estimasi Total Pax Hadir (Porsi Katering)
const totalPaxArrived = arrivedGuests.reduce((acc, g) => acc + (g.attendance_count || 1), 0);
const maxExpectedPax = (arrivedGuests.length + pendingGuests.length) * 2; // Asumsi rata-rata 2 pax per undangan
const paxPercent = maxExpectedPax > 0 ? totalPaxArrived / maxExpectedPax : 0;
```

---

## 3. Desain Visual & Komponen UI

### 3.1 Grid Kartu Analitik (Widescreen 4 Kolom)
Ditempatkan di bagian paling atas halaman Admin CMS, di atas kolom pencarian dan kartu check-in.
- **Rasio Lingkaran SVG**: Menggunakan rumus matematika keliling lingkaran (`2 * Math.PI * r`) untuk menghitung properti `strokeDashoffset` secara dinamis:
  - Radius ($r$) = `24`, Keliling = `150.79`
  - Formula `strokeDashoffset` = `150.8 * (1 - percent)`
- **Sketsa Layout Kartu**:
  ```
  +---------------------------------------+
  |  📊 Total Tamu Hadir                  |
  |  120 / 350 Tamu      ( O ) Progress   | <-- Lingkaran SVG Ring (Sage Green)
  |  Rasio: 34.2%        (   ) Ring       |
  +---------------------------------------+
  ```

### 3.2 Toast Notification Feed (Melayang Kanan Bawah)
Container notifikasi dipasang secara fixed: `fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full`.
- **Tampilan Notifikasi**: Kartu transparan buram premium dengan bingkai tipis (`bg-white/90 backdrop-blur-md border border-[#E5E1DA] p-4 rounded-xl shadow-lg flex items-start gap-3`).
- **Elemen Notifikasi**:
  - Ikon Kedatangan (ikon `Users` dengan latar hijau lembut).
  - Teks: *"Tamu Tiba: [Nama Tamu]"*
  - Badge emas VIP jika tamu bertipe VIP.
  - Detail: *"Baru saja check-in pada pukul 19:45"*
  - Dilengkapi tombol tutup cepat (X).

---

## 4. Logika Aliran Data & Supabase WebSockets

### 4.1 Sinkronisasi Real-Time & Pemicu Toast
Kita memperluas langganan kueri real-time di `AdminCMS.tsx` untuk mendeteksi check-in tamu:
```typescript
useEffect(() => {
  const channel = supabase
    .channel('dashboard-realtime-sync')
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'guests' },
      (payload: any) => {
        const oldGuest = payload.old;
        const newGuest = payload.new;
        
        // Deteksi jika tamu ditandai hadir (check-in)
        if ((!oldGuest || !oldGuest.has_arrived) && newGuest.has_arrived) {
          // 1. Tarik ulang data segar untuk menyinkronkan daftar tabel secara instan
          fetchGuests();
          
          // 2. Tambahkan ke antrean toast untuk memicu pop-up di layar admin lain
          const newToast: ToastMessage = {
            id: newGuest.id,
            name: newGuest.name,
            is_vip: newGuest.is_vip,
            arrival_time: newGuest.arrival_time
          };
          
          setToasts((prev) => [newToast, ...prev]);
          
          // 3. Hapus notifikasi otomatis setelah 4 detik
          setTimeout(() => {
            setToasts((prev) => prev.filter(t => t.id !== newGuest.id));
          }, 4000);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

### 4.2 Tombol Tutup Toast Manual
Admin juga bisa menghilangkan pop-up notifikasi secara instan dengan mengklik ikon `X` pada kartu notifikasi:
```typescript
const removeToast = (id: string) => {
  setToasts((prev) => prev.filter(t => t.id !== id));
};
```

---

## 5. Penanganan Kasus Khusus (Edge Cases)

1. **Stres Test Antrean Toast**: Jika ada banyak tamu check-in dalam waktu bersamaan (misal: 10 tamu masuk gerbang dalam waktu 5 detik), feed notifikasi akan menumpuk secara vertikal dengan rapi. Kontainer membatasi maksimal 4 notifikasi teratas secara visual untuk mencegah *overflow* layar.
2. **Kompabilitas SVG Ring**: Properti `strokeDasharray` dan `strokeDashoffset` dihitung aman menggunakan tipe `number` untuk menghindari *flicker* visual pada browser mobile lama.
3. **Sinkronisasi Tab Aktif**: Logika `fetchGuests()` yang dipicu oleh WebSocket akan memperbarui daftar tamu hadir (`arrivedGuests`) dan belum hadir (`pendingGuests`) di latar belakang, tanpa mengganggu interaksi pencarian atau input teks yang sedang dilakukan admin saat itu.
