# Guest Description & Split Pax Verification (Sub-Project F) Implementation Plan

## Goal
Implementasikan kolom deskripsi (`description`) untuk mengatasi tabrakan nama tamu di lapangan dan kolom kapasitas ekspektasi (`invited_pax`) untuk memisahkan target kapasitas dengan jumlah kedatangan tamu riil, lengkap dengan validasi batas input kehadiran di form RSVP.

---

### Task 1: Update Supabase Fetch Query and Computations in AdminCMS
**Files:**
- Modify: `src/pages/AdminCMS.tsx`

- [x] **Step 1: Perbarui select query di fetchGuests**
  Tambahkan kolom `invited_pax` dan `description` di select query tabel `guests` pada fungsi `fetchGuests` (sekitar baris 52-70).
  ```typescript
        const { data: arrivedData, error: arrivedError } = await supabase
          .from('guests')
          .select('id, name, arrival_time, is_vip, photo_url, souvenir_taken, attendance_count, invited_pax, description')
          .eq('has_arrived', true)
          .order('arrival_time', { ascending: false })
  ```
  Dan untuk pending:
  ```typescript
        const { data: pendingData, error: pendingError } = await supabase
          .from('guests')
          .select('id, name, is_vip, attendance_count, invited_pax, description')
          .eq('has_arrived', false)
          .order('name', { ascending: true })
  ```

- [x] **Step 2: Perbarui perhitungan dashboard analytics untuk kapasitas piring (pax)**
  Ubah perhitungan `maxExpectedPax` di `AdminCMS.tsx` (sekitar baris 558-560) agar menjumlahkan kapasitas `invited_pax` (default ke `2` jika NULL) dari seluruh tamu di memori.
  ```typescript
    const totalPaxArrived = arrivedGuests.reduce((acc, g) => acc + (g.attendance_count || 1), 0);
    const maxExpectedPax = arrivedGuests.reduce((acc, g) => acc + (g.invited_pax || 2), 0) + pendingGuests.reduce((acc, g) => acc + (g.invited_pax || 2), 0);
    const paxPercent = maxExpectedPax > 0 ? totalPaxArrived / maxExpectedPax : 0;
  ```

- [x] **Step 3: Uji build sementara**
  Jalankan: `npm run build`
  Expected: PASS

---

### Task 2: Integrate Description & Pax Info in Search Results and Guest Cards
**Files:**
- Modify: `src/pages/AdminCMS.tsx`

- [x] **Step 1: Perbarui UI hasil pencarian manual**
  Temukan rendering `combinedSearchGuests.map` (sekitar baris 820-850) dan sisipkan visual deskripsi serta porsi pax:
  ```tsx
                              <div className="flex flex-col">
                                <span className="text-sm font-serif flex items-center gap-2">
                                  {guest.name}
                                  {guest.is_vip && <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">VIP</span>}
                                </span>
                                {guest.description && (
                                  <span className="text-[10px] text-gray-500 italic mt-0.5">
                                    {guest.description}
                                  </span>
                                )}
                                <span className="text-[10px] text-gray-400 mt-0.5 font-sans">
                                  {guest.has_arrived 
                                    ? `Hadir: ${guest.attendance_count || 1} / ${guest.invited_pax || 2} Pax` 
                                    : `Ekspektasi: ${guest.invited_pax || 2} Pax`
                                  }
                                </span>
                                {guest.has_arrived && (
                                  <span className="text-[9px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full font-semibold inline-block w-fit mt-1 border border-green-100">
                                    Sudah Check-in
                                  </span>
                                )}
                              </div>
  ```

- [x] **Step 2: Perbarui Panel Detail Tamu di sebelah kanan**
  Temukan render `guest.name` (sekitar baris 887) dan status RSVP (sekitar baris 890).
  Tampilkan sub-label deskripsi dan rincian RSVP split:
  ```tsx
                      <p className="text-2xl font-serif">{guest.name}</p>
                      {guest.description && (
                        <p className="text-xs text-[#8C9A8E] mt-1 font-sans italic">Keterangan: {guest.description}</p>
                      )}
  ```
  Dan ubah blok RSVP status:
  ```tsx
                    <div className="flex items-center justify-between py-2 border-b border-[#F3F1ED]">
                      <span className="text-sm text-[#8C9A8E]">Status RSVP</span>
                      {guest.rsvp_status ? (
                        <span className="flex items-center gap-1.5 text-[#4A5D4E] text-sm font-medium bg-[#F0F4F1] px-3 py-1 rounded-full">
                          <CheckCircle size={14} /> Hadir ({guest.attendance_count} dari {guest.invited_pax || 2} Pax)
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-[#C17E61] text-sm font-medium bg-[#FEF5F1] px-3 py-1 rounded-full">
                          <XCircle size={14} /> Belum RSVP (Kapasitas: {guest.invited_pax || 2} Pax)
                        </span>
                      )}
                    </div>
  ```

- [x] **Step 3: Uji build kompilasi**
  Jalankan: `npm run build`
  Expected: PASS

---

### Task 3: Update Tables Layout and CSV Export
**Files:**
- Modify: `src/pages/AdminCMS.tsx`

- [x] **Step 1: Perbarui render kolom tabel Tamu Hadir**
  Temukan render tabel Tamu Hadir (`filteredArrivedGuests.map`, sekitar baris 1200). Sisipkan deskripsi tamu dan porsi kehadiran:
  ```tsx
                              <div className="flex items-center gap-2">
                                <p className="text-[#4A5D4E] font-serif">{guest.name}</p>
                                {guest.is_vip && <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">VIP</span>}
                              </div>
                              {guest.description && (
                                <p className="text-[10px] text-amber-900/60 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100/50 w-fit mt-0.5 font-sans">
                                  {guest.description}
                                </p>
                              )}
                              <div className="flex items-center gap-1.5 text-[11px] text-[#8C9A8E] mt-0.5 font-sans">
                                <Clock size={12} />
                                <span>{guest.arrival_time ? new Date(guest.arrival_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}</span>
                                <span className="mx-1 text-gray-300">•</span>
                                <span className="font-medium text-[#4A5D4E]/80">{guest.attendance_count || 1}/{guest.invited_pax || 2} Pax</span>
                              </div>
  ```

- [x] **Step 2: Perbarui render kolom tabel Belum Hadir**
  Temukan render tabel Belum Hadir (`filteredPendingGuests.map`, sekitar baris 1240). Sisipkan deskripsi dan kapasitas ekspektasi:
  ```tsx
                            <td className="py-4 text-[#8C9A8E] font-serif">
                              <div className="flex items-center gap-2">
                                {guest.name}
                                {guest.is_vip && <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold border border-amber-100">VIP</span>}
                              </div>
                              {guest.description && (
                                <p className="text-[10px] text-[#8C9A8E]/80 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100/50 w-fit mt-0.5 font-sans">
                                  {guest.description}
                                </p>
                              )}
                              <div className="text-[11px] text-[#8C9A8E] mt-1 font-sans flex items-center gap-1">
                                <span>Ekspektasi: {guest.invited_pax || 2} Pax</span>
                              </div>
                            </td>
  ```

- [x] **Step 3: Perbarui fungsi handleExportCSV**
  Pilih kolom `description` dan `invited_pax` dari Supabase, tambahkan sebagai kolom *"Keterangan (Description)"* dan *"Kapasitas Undangan (Pax)"* di header & baris CSV:
  ```typescript
        const { data: allGuests, error } = await supabase
          .from('guests')
          .select('name, is_vip, rsvp_status, attendance_count, invited_pax, description, has_arrived, arrival_time, souvenir_taken, message, photo_url')
          .order('name', { ascending: true })
  ```
  Sesuaikan header CSV:
  ```typescript
        const headers = [
          "Nama Tamu",
          "Keterangan (Description)",
          "Kategori (VIP)",
          "RSVP Status",
          "Jumlah Kehadiran (Pax)",
          "Kapasitas Undangan (Pax)",
          "Kehadiran",
          "Waktu Tiba (WIB)",
          "Souvenir Status",
          "Ucapan Selamat (Wishes)",
          "Tautan Foto"
        ]
  ```
  Dan mapping baris CSV:
  ```typescript
          const row = [
            `"${g.name.replace(/"/g, '""')}"`,
            `"${(g.description || "").replace(/"/g, '""')}"`,
            g.is_vip ? "VIP" : "Regular",
            g.rsvp_status ? "Hadir" : "Belum RSVP",
            g.rsvp_status ? g.attendance_count : 0,
            g.invited_pax || 2,
            g.has_arrived ? "Sudah Check-in" : "Belum Hadir",
            g.arrival_time ? new Date(g.arrival_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : "-",
            g.souvenir_taken ? "Sudah Diambil" : "Belum Diambil",
            `"${(g.message || "").replace(/"/g, '""').replace(/\n/g, " ")}"`,
            g.photo_url ? g.photo_url : "-"
          ]
  ```

- [x] **Step 4: Uji build**
  Jalankan: `npm run build`
  Expected: PASS

---

### Task 4: Integrate invitedPax & description in Invitation and RSVPForm validation
**Files:**
- Modify: `src/pages/Invitation.tsx`, `src/components/RSVPForm.tsx`

- [x] **Step 1: Perbarui fetch tamu di Invitation.tsx**
  Di `Invitation.tsx` (sekitar baris 102), ubah kueri pemanggilan tamu berdasarkan parameter `to` (`qr_code`) agar mengambil `invited_pax` dan `description` juga:
  ```typescript
          if (guestId) {
            const { data: guestData } = await supabase
              .from('guests')
              .select('name, invited_pax, description')
              .eq('qr_code', guestId)
              .single()
            
            if (guestData) {
              setGuestName(guestData.name)
              setInvitedPax(guestData.invited_pax || 2)
              setGuestDescription(guestData.description)
            }
          }
  ```
  Beri inisialisasi state baru di atas `fetchData`:
  ```typescript
    const [invitedPax, setInvitedPax] = useState<number>(2)
    const [guestDescription, setGuestDescription] = useState<string | undefined>(undefined)
  ```
  Lalu teruskan prop ini ke pemanggilan komponen RSVPForm (sekitar baris 278):
  ```tsx
              <RSVPForm 
                guestId={guestId} 
                guestName={guestName} 
                invitedPax={invitedPax} 
                guestDescription={guestDescription} 
              />
  ```

- [x] **Step 2: Perbarui tipe props dan input validasi RSVPForm**
  Buka `src/components/RSVPForm.tsx`.
  Ubah penanda tipe parameter props di komponen `RSVPForm` agar menerima `invitedPax` (default 2) dan `guestDescription` (optional string):
  ```typescript
  export const RSVPForm = ({ 
    guestId, 
    guestName, 
    invitedPax = 2, 
    guestDescription 
  }: { 
    guestId?: string; 
    guestName?: string; 
    invitedPax?: number; 
    guestDescription?: string; 
  }) => {
  ```
  Ubah deklarasi `useForm` agar menangkap `errors`:
  ```typescript
    const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<RSVPData>()
  ```
  Bumbuhi form dengan **Welcome Card** jika `guestName` tersedia di bagian atas form (di atas label nama lengkap):
  ```tsx
                {guestName && (
                  <div className="mb-6 p-4 bg-primary/5 border border-primary/10 rounded-2xl text-burgundy text-xs space-y-1">
                    <p className="font-semibold text-sm">Selamat datang, {guestName}!</p>
                    {guestDescription && (
                      <p className="text-gray-500 italic">Grup Undangan: {guestDescription}</p>
                    )}
                    <p className="text-gray-400 font-sans">Anda diundang dengan batas kapasitas maksimal: <strong>{invitedPax} pax</strong>.</p>
                  </div>
                )}
  ```
  Sesuaikan input `attendance_count` agar menggunakan `max: invitedPax` sebagai validasi dinamis:
  ```tsx
                  <input
                    type="number"
                    {...register('attendance_count', { min: 1, max: invitedPax })}
                    defaultValue={1}
                    className="w-full bg-white/50 border border-primary/20 rounded-2xl px-5 py-4 focus:border-primary focus:ring-2 focus:ring-primary/15 outline-none transition-all duration-300 font-sans text-burgundy"
                  />
                  <span className="text-[10px] text-gray-400 italic mt-1 block font-sans">Maksimal porsi kehadiran: {invitedPax} pax</span>
                  {errors.attendance_count && (
                    <span className="text-[10px] text-red-500 font-medium mt-1 block font-sans">
                      {errors.attendance_count.type === 'max' 
                        ? `Jumlah hadir melebihi alokasi porsi undangan Anda (${invitedPax} pax).` 
                        : 'Jumlah hadir minimal 1 pax.'
                      }
                    </span>
                  )}
  ```

- [x] **Step 3: Uji build akhir proyek secara menyeluruh**
  Jalankan: `npm run build`
  Expected: PASS 100% sukses build tanpa ada error atau warning sama sekali.
