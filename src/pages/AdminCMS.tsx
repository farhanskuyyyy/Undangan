import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Html5Qrcode } from 'html5-qrcode'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { CheckCircle, XCircle, Gift, User, ScanLine, Clock, Users, Search, Camera, Image, Upload, LogOut, Trash2, Check, RefreshCw, Eye, X, ChevronLeft, ChevronRight, Heart, Download, TrendingUp, Award, Sparkles, Plus, Copy, FileSpreadsheet } from 'lucide-react'
import Swal from 'sweetalert2'

const QUICK_WISHES_TEMPLATES = [
  "Selamat menempuh hidup baru! Semoga cinta kalian abadi hingga hari tua.",
  "Selamat atas pernikahannya! Semoga menjadi keluarga yang sakinah, mawaddah, warahmah.",
  "Happy wedding! Semoga hari-hari kalian dipenuhi dengan kebahagiaan dan tawa bersama.",
  "Selamat berbahagia! Semoga dilancarkan selalu dalam membangun bahtera rumah tangga yang indah.",
  "Barakallahu lakuma wa baraka 'alaikuma wa jama'a bainakuma fii khair."
];

const getInitials = (name: string) => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
};

const toastTheme = Swal.mixin({
  background: '#FDFBF7',
  color: '#4A5D4E',
  confirmButtonColor: '#4A5D4E',
  cancelButtonColor: '#C17E61',
  customClass: {
    popup: 'rounded-2xl border border-[#E5E1DA] font-serif shadow-xl',
    title: 'text-[#4A5D4E] font-serif font-semibold text-lg',
    htmlContainer: 'text-sm text-[#8C9A8E] font-sans mt-2',
    confirmButton: 'rounded-xl px-5 py-2.5 text-xs font-semibold shadow-sm cursor-pointer mx-1 focus:ring-2 focus:ring-[#4A5D4E] text-white bg-[#4A5D4E] border border-transparent hover:bg-[#3D4C40] transition-colors',
    cancelButton: 'rounded-xl px-5 py-2.5 text-xs font-semibold shadow-sm cursor-pointer mx-1 focus:ring-2 focus:ring-[#C17E61] text-white bg-[#C17E61] border border-transparent hover:bg-[#A96B51] transition-colors'
  },
  buttonsStyling: false
})

const showAlert = (text: string, icon: 'success' | 'error' | 'warning' | 'info' = 'info', title?: string) => {
  let defaultTitle = 'Informasi'
  if (icon === 'success') defaultTitle = 'Berhasil'
  if (icon === 'error') defaultTitle = 'Gagal'
  if (icon === 'warning') defaultTitle = 'Peringatan'
  
  return toastTheme.fire({
    title: title || defaultTitle,
    text,
    icon,
    iconColor: icon === 'success' ? '#4A5D4E' : icon === 'error' || icon === 'warning' ? '#C17E61' : '#8C9A8E'
  })
}

export const AdminCMS = () => {
  const { user, signOut } = useAuth()
  const [guest, setGuest] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [arrivedGuests, setArrivedGuests] = useState<any[]>([])
  const [pendingGuests, setPendingGuests] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [checkInMode, setCheckInMode] = useState<'scan' | 'search'>('scan')
  const [manualSearchQuery, setManualSearchQuery] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [imageBlob, setImageBlob] = useState<Blob | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [galleryPage, setGalleryPage] = useState(1)
  const [lightboxGuest, setLightboxGuest] = useState<any>(null)
  const [wishesText, setWishesText] = useState('')
  const [savingWishes, setSavingWishes] = useState(false)
  const [toasts, setToasts] = useState<any[]>([])





  const [activeTab, setActiveTab] = useState<'presence' | 'management'>('presence')
  const [showCrudModal, setShowCrudModal] = useState(false)
  const [editingGuest, setEditingGuest] = useState<any>(null)
  const [crudName, setCrudName] = useState('')
  const [crudDescription, setCrudDescription] = useState('')
  const [crudInvitedPax, setCrudInvitedPax] = useState(2)
  const [crudIsVip, setCrudIsVip] = useState(false)
  const [crudSearch, setCrudSearch] = useState('')
  const [crudVipFilter, setCrudVipFilter] = useState<'all' | 'vip' | 'non-vip'>('all')
  const [crudRsvpFilter, setCrudRsvpFilter] = useState<'all' | 'confirmed' | 'unconfirmed'>('all')
  const [crudPage, setCrudPage] = useState(1)
  const [copiedGuestId, setCopiedGuestId] = useState<string | null>(null)
  const fileImportRef = useRef<HTMLInputElement>(null)
  const [importingCSV, setImportingCSV] = useState(false)

  const handleSaveGuest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!crudName.trim()) {
      showAlert("Nama tamu tidak boleh kosong.", "warning")
      return
    }
    
    setLoading(true)
    try {
      if (editingGuest) {
        const cleanedName = crudName.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
        const randomSuffix = Math.floor(1000 + Math.random() * 9000)
        const qrCode = `${cleanedName}${randomSuffix}`

        const { error } = await supabase
          .from('guests')
          .update({
            name: crudName.trim(),
            qr_code: qrCode, // Regenerate/update QR code based on new name format
            description: crudDescription.trim() || null,
            invited_pax: Number(crudInvitedPax) || 2,
            is_vip: crudIsVip
          })
          .eq('id', editingGuest.id)
        
        if (error) throw error
        showAlert("Data tamu berhasil diperbarui!", "success")
      } else {
        const cleanedName = crudName.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
        const randomSuffix = Math.floor(1000 + Math.random() * 9000)
        const qrCode = `${cleanedName}${randomSuffix}`
        const invitedPax = Number(crudInvitedPax) || 2
        const { error } = await supabase
          .from('guests')
          .insert({
            name: crudName.trim(),
            qr_code: qrCode,
            description: crudDescription.trim() || null,
            invited_pax: invitedPax,
            attendance_count: invitedPax, // Default to match invited_pax
            is_vip: crudIsVip,
            has_arrived: false,
            souvenir_taken: false
          })
        
        if (error) throw error
        showAlert("Tamu baru berhasil ditambahkan!", "success")
      }
      
      setShowCrudModal(false)
      setEditingGuest(null)
      setCrudName('')
      setCrudDescription('')
      setCrudInvitedPax(2)
      setCrudIsVip(false)
      fetchGuests()
    } catch (err: any) {
      console.error("Gagal menyimpan data tamu:", err)
      showAlert(`Gagal menyimpan data tamu: ${err.message || 'Error tidak diketahui'}`, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteGuest = async (guestId: string, guestName: string) => {
    const result = await toastTheme.fire({
      title: 'Hapus Tamu',
      text: `Apakah Anda yakin ingin menghapus tamu "${guestName}"? Tindakan ini tidak dapat dibatalkan.`,
      icon: 'warning',
      iconColor: '#C17E61',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    })
    
    if (!result.isConfirmed) {
      return
    }
    
    setLoading(true)
    try {
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', guestId)
      
      if (error) throw error
      showAlert(`Tamu "${guestName}" berhasil dihapus.`, "success")
      fetchGuests()
      if (guest && guest.id === guestId) {
        setGuest(null)
      }
    } catch (err: any) {
      console.error("Gagal menghapus tamu:", err)
      showAlert(`Gagal menghapus tamu: ${err.message || 'Error tidak diketahui'}`, "error")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyInvitationLink = async (qrCode: string, guestId: string) => {
    const url = `${window.location.origin}/?to=${qrCode}`
    try {
      await navigator.clipboard.writeText(url)
      setCopiedGuestId(guestId)
      
      const newToast = {
        id: `copy-${guestId}`,
        name: "Tautan Undangan",
        is_vip: false,
        arrival_time: new Date().toISOString(),
        description: "Berhasil disalin ke clipboard!"
      }
      setToasts((prev) => [newToast, ...prev.slice(0, 3)])
      setTimeout(() => {
        setToasts((prev) => prev.filter(t => t.id !== `copy-${guestId}`))
      }, 3000)

      setTimeout(() => {
        setCopiedGuestId(null)
      }, 2000)
    } catch (err) {
      console.error("Gagal menyalin tautan:", err)
      showAlert("Gagal menyalin tautan ke clipboard.", "error")
    }
  }

  const handleDownloadCSVTemplate = () => {
    const headers = ["Nama", "Keterangan", "Kapasitas_Pax", "VIP_Ya_Tidak"]
    const exampleRow = ["Ahmad Fauzi", "Tamu CPW", "2", "Ya"]
    
    const csvContent = [headers.join(","), exampleRow.join(",")].join("\n")
    const BOM = "\uFEFF"
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" })
    
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "template_import_tamu.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    setImportingCSV(true)
    try {
      const text = await file.text()
      const lines = text.split(/\r?\n/)
      if (lines.length <= 1) {
        showAlert("Berkas CSV kosong atau hanya berisi baris header.", "warning")
        setImportingCSV(false)
        return
      }
      
      const bulkGuests: any[] = []
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        
        const cells = line.split(",").map(cell => cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"'))
        const name = cells[0]
        if (!name) continue
        
        const description = cells[1] || null
        const invited_pax = Number(cells[2]) || 2
        const vipText = (cells[3] || "").toLowerCase()
        const is_vip = vipText === "ya" || vipText === "yes" || vipText === "1" || vipText === "true"
        
        const cleanedName = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
        const randomSuffix = Math.floor(1000 + Math.random() * 9000)
        const qrCode = `${cleanedName}${randomSuffix}`
        
        bulkGuests.push({
          name,
          qr_code: qrCode,
          description,
          invited_pax,
          attendance_count: invited_pax, // Default to match invited_pax
          is_vip,
          has_arrived: false,
          souvenir_taken: false
        })
      }
      
      if (bulkGuests.length === 0) {
        showAlert("Tidak ada baris data tamu yang valid ditemukan di dalam CSV.", "warning")
        setImportingCSV(false)
        return
      }
      
      const { error } = await supabase
        .from('guests')
        .insert(bulkGuests)
        
      if (error) throw error
      
      showAlert(`Berhasil mengimpor massal ${bulkGuests.length} tamu baru!`, "success")
      fetchGuests()
    } catch (err: any) {
      console.error("Gagal mengimpor CSV:", err)
      showAlert(`Gagal mengimpor CSV: ${err.message || 'Error tidak diketahui'}`, "error")
    } finally {
      setImportingCSV(false)
      if (fileImportRef.current) {
        fileImportRef.current.value = ""
      }
    }
  }

  const fetchGuests = async () => {
    try {
      const { data: arrivedData, error: arrivedError } = await supabase
        .from('guests')
        .select('id, name, qr_code, arrival_time, is_vip, photo_url, souvenir_taken, attendance_count, invited_pax, description, rsvp_status')
        .eq('has_arrived', true)
        .order('arrival_time', { ascending: false })
      
      if (arrivedError) throw arrivedError
      setArrivedGuests(arrivedData || [])

      const { data: pendingData, error: pendingError } = await supabase
        .from('guests')
        .select('id, name, qr_code, is_vip, attendance_count, invited_pax, description, rsvp_status')
        .eq('has_arrived', false)
        .order('name', { ascending: true })
      
      if (pendingError) throw pendingError
      setPendingGuests(pendingData || [])
      setGalleryPage(1)
    } catch (error) {
      console.error('Error fetching guests:', error)
    }
  }

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      try {
        await scannerRef.current.stop()
        setIsScanning(false)
      } catch (err) {
        console.error('Failed to stop scanner:', err)
      }
    }
  }

  const startScanner = async () => {
    if (!scannerRef.current) {
      scannerRef.current = new Html5Qrcode("reader")
    }

    if (isScanning) return

    setIsScanning(true)
    setGuest(null) // Clear previous guest info when starting new scan

    try {
      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        onScanSuccess,
        () => {}
      )
    } catch (err) {
      console.error('Failed to start scanner:', err)
      setIsScanning(false)
      showAlert('Gagal mengakses kamera. Pastikan izin kamera telah diberikan.', 'error', 'Kamera Gagal')
    }
  }

  const handleScanOtherGuest = async () => {
    setCheckInMode('scan')
    setGuest(null)
    setTimeout(() => {
      startScanner()
    }, 150)
  }

  const handleUploadOtherGuest = () => {
    setCheckInMode('scan')
    setGuest(null)
    setTimeout(() => {
      fileInputRef.current?.click()
    }, 150)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setGuest(null)
    
    // Stop camera scanner if it's running
    if (isScanning) {
      await stopScanner()
    }

    try {
      const html5QrCode = new Html5Qrcode("reader")
      const decodedText = await html5QrCode.scanFile(file, true)
      await onScanSuccess(decodedText)
    } catch (err) {
      console.error('Failed to scan file:', err)
      showAlert('Tidak ada QR Code ditemukan dalam gambar. Pastikan gambar jelas dan berisi QR Code.', 'warning', 'QR Code Tidak Ditemukan')
    } finally {
      setLoading(false)
      if (e.target) e.target.value = '' // Reset input
    }
  }

  const onScanSuccess = async (decodedText: string) => {
    setLoading(true)
    await stopScanner() // Auto-close on success
    
    const trimmedCode = decodedText.trim()
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('qr_code', trimmedCode)
        .single()
      
      if (error) throw error
      
      setGuest(data)
      setWishesText(data?.wishes || '')
      fetchGuests()
    } catch (error) {
      console.error('Error fetching guest:', error)
      showAlert('Tamu tidak ditemukan atau QR Code salah.', 'error', 'Tidak Ditemukan')
    } finally {
      setLoading(false)
    }
  }

  const handleManualCheckIn = async (guestId: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('guests')
        .update({ has_arrived: true, arrival_time: new Date().toISOString() })
        .eq('id', guestId)
        .select('*')
        .single()
      
      if (error) throw error
      
      setGuest(data)
      setWishesText(data?.wishes || '')
      fetchGuests()
      setManualSearchQuery('') // Clear search after successful check-in
      showAlert(`Berhasil check-in: ${data.name}${data.description ? ` (${data.description})` : ''}`, 'success', 'Check-in Berhasil')
    } catch (error) {
      console.error('Error manual check-in:', error)
      showAlert('Gagal melakukan check-in manual.', 'error')
    } finally {
      setLoading(false)
    }
  }

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
      setWishesText(data?.wishes || '')
    } catch (err: any) {
      console.error("Gagal memuat detail tamu:", err)
      showAlert(`Gagal memuat detail tamu: ${err.message || 'Error tidak diketahui'}`, 'error')
    } finally {
      setLoading(false)
    }
  }


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
      showAlert("Gagal mengakses kamera. Mohon pastikan izin akses kamera telah diberikan.", "error", "Kamera Gagal")
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
      showAlert("Foto tamu berhasil disimpan!", "success")
    } catch (err: any) {
      console.error("Gagal menyimpan foto:", err)
      showAlert(`Gagal menyimpan foto: ${err.message || 'Error tidak diketahui'}`, "error")
    } finally {
      setUploadingPhoto(false)
    }
  }

  const deletePhoto = async () => {
    if (!guest || !guest.photo_url) return
    
    const confirmResult = await toastTheme.fire({
      title: 'Hapus Foto',
      text: 'Apakah Anda yakin ingin menghapus foto tamu ini?',
      icon: 'warning',
      iconColor: '#C17E61',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    })
    
    if (!confirmResult.isConfirmed) return
    
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
      showAlert("Foto tamu berhasil dihapus!", "success")
    } catch (err: any) {
      console.error("Gagal menghapus foto:", err)
      showAlert(`Gagal menghapus foto: ${err.message}`, "error")
    } finally {
      setUploadingPhoto(false)
    }
  }

  const saveGuestWishes = async () => {
    if (!guest) return
    setSavingWishes(true)
    
    try {
      const { error } = await supabase
        .from('guests')
        .update({ wishes: wishesText })
        .eq('id', guest.id)
        
      if (error) throw error
      
      // Perbarui data guest lokal
      setGuest({ ...guest, wishes: wishesText })
      fetchGuests() // Segarkan daftar tamu hadir/belum hadir
      showAlert("Ucapan tamu berhasil disimpan!", "success")
    } catch (err: any) {
      console.error("Gagal menyimpan ucapan:", err)
      showAlert(`Gagal menyimpan ucapan: ${err.message || 'Error tidak diketahui'}`, "error")
    } finally {
      setSavingWishes(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      // 1. Ambil data segar terlengkap langsung dari database
      const { data: allGuests, error } = await supabase
        .from('guests')
        .select('name, is_vip, rsvp_status, attendance_count, invited_pax, description, has_arrived, arrival_time, souvenir_taken, message, wishes, photo_url')
        .order('name', { ascending: true })
        
      if (error) throw error
      if (!allGuests || allGuests.length === 0) {
        showAlert("Tidak ada data tamu untuk diekspor.", "warning", "Ekspor Gagal")
        return
      }
      
      // 2. Judul Kolom (Headers)
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
        "Pesan RSVP (Message)",
        "Ucapan Check-in (Wishes)",
        "Tautan Foto"
      ]
      
      // 3. Format Baris Data
      const csvRows = [headers.join(",")]
      
      allGuests.forEach((g) => {
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
          `"${(g.message || "").replace(/"/g, '""').replace(/\n/g, " ")}"`, // Bersihkan tanda kutip ganda & baris baru
          `"${(g.wishes || "").replace(/"/g, '""').replace(/\n/g, " ")}"`, // Bersihkan tanda kutip ganda & baris baru
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
      showAlert(`Gagal melakukan ekspor data: ${err.message}`, "error", "Ekspor Gagal")
    }
  }

  const claimSouvenir = async () => {
    if (!guest) return
    setLoading(true)
    try {
      const { error } = await supabase
        .from('guests')
        .update({ souvenir_taken: true })
        .eq('id', guest.id)
      
      if (error) throw error
      setGuest({ ...guest, souvenir_taken: true })
      fetchGuests() // Segarkan statistik dan dasbor analitik secara real-time!
      showAlert('Souvenir berhasil diberikan!', 'success')
    } catch (error) {
      console.error('Error updating souvenir status:', error)
      showAlert('Gagal update status souvenir.', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGuests()
    return () => {
      stopScanner()
    }
  }, [])

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [guest])

  useEffect(() => {
    // Jalur WebSocket untuk mendengarkan check-in gerbang lain
    const channel = supabase
      .channel('dashboard-realtime-sync')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'guests' },
        (payload: any) => {
          const oldGuest = payload.old
          const newGuest = payload.new
          
          // Gerbang lain menandai tamu hadir
          if ((!oldGuest || !oldGuest.has_arrived) && newGuest.has_arrived) {
            // 1. Tarik ulang data segar agar tabel daftar tamu sinkron instan
            fetchGuests()
            
            // 2. Tambahkan ke antrean notifikasi melayang
            const newToast = {
              id: newGuest.id,
              name: newGuest.name,
              is_vip: newGuest.is_vip,
              arrival_time: newGuest.arrival_time,
              description: newGuest.description
            }
            
            setToasts((prev) => {
              // Batasi maksimal 4 notifikasi pop-up bertumpuk agar tidak menutupi layar
              const truncated = prev.slice(0, 3)
              return [newToast, ...truncated]
            })
            
            // 3. Bersihkan notifikasi otomatis setelah 4 detik
            setTimeout(() => {
              setToasts((prev) => prev.filter(t => t.id !== newGuest.id))
            }, 4000)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])


  const filteredArrivedGuests = arrivedGuests.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredPendingGuests = pendingGuests.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const ITEMS_PER_PAGE = 8
  const guestsWithPhotos = arrivedGuests.filter(g => g.photo_url)
  const totalPages = Math.max(1, Math.ceil(guestsWithPhotos.length / ITEMS_PER_PAGE))
  const paginatedGuests = guestsWithPhotos.slice(
    (galleryPage - 1) * ITEMS_PER_PAGE,
    galleryPage * ITEMS_PER_PAGE
  )

  // TOTAL QUANTITY CALCULATIONS
  const totalGuestsCount = arrivedGuests.length + pendingGuests.length;

  // 1. Rasio Kedatangan Tamu (Undangan Check-in)
  const arrivalPercent = totalGuestsCount > 0 ? arrivedGuests.length / totalGuestsCount : 0;

  // 2. Rasio Souvenir Terbagi (dibanding total undangan)
  const souvenirPercent = totalGuestsCount > 0 
    ? arrivedGuests.filter(g => g.souvenir_taken).length / totalGuestsCount 
    : 0;

  // 3. Rasio Kehadiran VIP (VIP Hadir dibanding total VIP)
  const arrivedVIPsCount = arrivedGuests.filter(g => g.is_vip).length;
  const totalVIPsCount = arrivedVIPsCount + pendingGuests.filter(g => g.is_vip).length;
  const vipArrivalPercent = totalVIPsCount > 0 ? arrivedVIPsCount / totalVIPsCount : 0;

  const totalPaxArrived = arrivedGuests.reduce((acc, g) => acc + (g.attendance_count || 1), 0);
  const maxExpectedPax = arrivedGuests.reduce((acc, g) => acc + (g.invited_pax || 2), 0) + pendingGuests.reduce((acc, g) => acc + (g.invited_pax || 2), 0);
  const paxPercent = maxExpectedPax > 0 ? totalPaxArrived / maxExpectedPax : 0;

  // RSVP statistics computations
  const rsvpGuests = [...arrivedGuests, ...pendingGuests].filter(g => g.rsvp_status);
  const totalRsvpedCount = rsvpGuests.length;
  const rsvpPercent = totalGuestsCount > 0 ? (totalRsvpedCount / totalGuestsCount) * 100 : 0;
  const rsvpPaxCount = rsvpGuests.reduce((acc, g) => acc + (g.attendance_count || 1), 0);

  // Slice 15 kedatangan tamu terbaru secara kronologis untuk timeline
  const timelineEvents = arrivedGuests.slice(0, 15);

  const combinedSearchGuests = [
    ...arrivedGuests.map(g => ({ ...g, has_arrived: true })),
    ...pendingGuests.map(g => ({ ...g, has_arrived: false }))
  ].filter(g => g.name.toLowerCase().includes(manualSearchQuery.toLowerCase()))


  const filteredAllGuests = [
    ...arrivedGuests.map(g => ({ ...g, has_arrived: true })),
    ...pendingGuests.map(g => ({ ...g, has_arrived: false }))
  ]
    .filter(g => 
      g.name.toLowerCase().includes(crudSearch.toLowerCase()) || 
      (g.description || "").toLowerCase().includes(crudSearch.toLowerCase())
    )
    .filter(g => {
      if (crudVipFilter === 'vip') return g.is_vip
      if (crudVipFilter === 'non-vip') return !g.is_vip
      return true
    })
    .filter(g => {
      if (crudRsvpFilter === 'confirmed') return g.rsvp_status === true
      if (crudRsvpFilter === 'unconfirmed') return !g.rsvp_status
      return true
    })
    .sort((a, b) => a.name.localeCompare(b.name))

  const CRUD_ITEMS_PER_PAGE = 10
  const totalCrudPages = Math.ceil(filteredAllGuests.length / CRUD_ITEMS_PER_PAGE)
  const paginatedCrudGuests = filteredAllGuests.slice((crudPage - 1) * CRUD_ITEMS_PER_PAGE, crudPage * CRUD_ITEMS_PER_PAGE)

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 md:p-12 text-[#4A5D4E]">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-serif italic mb-1">CMS Penerima Tamu</h1>
            <p className="text-sm text-[#8C9A8E]">{user?.email}</p>
          </div>
          <button 
            onClick={signOut} 
            className="text-sm bg-white px-4 py-2 rounded-full border border-[#E5E1DA] hover:border-red-200 hover:text-red-500 transition-all shadow-sm flex items-center gap-1.5"
          >
            <LogOut size={14} />
            Logout
          </button>
        </header>

        <div className="flex bg-[#FDFBF7] p-1.5 rounded-2xl mb-8 border border-[#E5E1DA] max-w-sm shadow-sm">
          <button
            onClick={() => {
              setActiveTab('presence')
              setCrudSearch('')
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${activeTab === 'presence' ? 'bg-[#4A5D4E] text-white shadow-sm' : 'text-[#8C9A8E] hover:text-[#4A5D4E]'}`}
          >
            Dashboard Kehadiran
          </button>
          <button
            onClick={() => {
              setActiveTab('management')
              setCrudPage(1)
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-all ${activeTab === 'management' ? 'bg-[#4A5D4E] text-white shadow-sm' : 'text-[#8C9A8E] hover:text-[#4A5D4E]'}`}
          >
            Manajemen Undangan
          </button>
        </div>

        {activeTab === 'presence' ? (
          <>
            {/* Dashboard Analytics Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Card 1: Rasio Kehadiran */}
          <div className="bg-white p-4 rounded-2xl border border-[#E5E1DA] shadow-sm flex items-center justify-between group hover:shadow transition-all duration-300">
            <div className="space-y-1">
              <span className="text-[10px] text-[#8C9A8E] uppercase tracking-wider font-semibold flex items-center gap-1">
                <Users size={12} /> Kehadiran Tamu
              </span>
              <p className="text-xl font-bold text-[#4A5D4E] font-serif">{arrivedGuests.length} <span className="text-xs text-gray-400 font-sans font-normal">/ {totalGuestsCount}</span></p>
              <p className="text-[10px] text-[#8C9A8E]">Rasio: {(arrivalPercent * 100).toFixed(1)}%</p>
            </div>
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="28" cy="28" r="24" stroke="#F3F1ED" strokeWidth="4" fill="transparent" />
                <circle 
                  cx="28" 
                  cy="28" 
                  r="24" 
                  stroke="#4A5D4E" 
                  strokeWidth="4" 
                  fill="transparent" 
                  strokeDasharray="150.8"
                  strokeDashoffset={150.8 * (1 - arrivalPercent)}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-[#4A5D4E]">{(arrivalPercent * 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* Card 2: Pembagian Souvenir */}
          <div className="bg-white p-4 rounded-2xl border border-[#E5E1DA] shadow-sm flex items-center justify-between group hover:shadow transition-all duration-300">
            <div className="space-y-1">
              <span className="text-[10px] text-[#8C9A8E] uppercase tracking-wider font-semibold flex items-center gap-1">
                <Gift size={12} /> Souvenir Terbagi
              </span>
              <p className="text-xl font-bold text-[#4A5D4E] font-serif">
                {arrivedGuests.filter(g => g.souvenir_taken).length} <span className="text-xs text-gray-400 font-sans font-normal">/ {totalGuestsCount}</span>
              </p>
              <p className="text-[10px] text-[#8C9A8E]">Rasio: {(souvenirPercent * 100).toFixed(1)}%</p>
            </div>
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="28" cy="28" r="24" stroke="#F3F1ED" strokeWidth="4" fill="transparent" />
                <circle 
                  cx="28" 
                  cy="28" 
                  r="24" 
                  stroke="#C17E61" 
                  strokeWidth="4" 
                  fill="transparent" 
                  strokeDasharray="150.8"
                  strokeDashoffset={150.8 * (1 - souvenirPercent)}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-[#C17E61]">{(souvenirPercent * 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* Card 3: Kehadiran VIP */}
          <div className="bg-white p-4 rounded-2xl border border-[#E5E1DA] shadow-sm flex items-center justify-between group hover:shadow transition-all duration-300">
            <div className="space-y-1">
              <span className="text-[10px] text-[#8C9A8E] uppercase tracking-wider font-semibold flex items-center gap-1">
                <Award size={12} /> Kehadiran VIP
              </span>
              <p className="text-xl font-bold text-[#4A5D4E] font-serif">
                {arrivedVIPsCount} <span className="text-xs text-gray-400 font-sans font-normal">/ {totalVIPsCount}</span>
              </p>
              <p className="text-[10px] text-[#8C9A8E]">VIP Tiba: {(vipArrivalPercent * 100).toFixed(1)}%</p>
            </div>
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="28" cy="28" r="24" stroke="#F3F1ED" strokeWidth="4" fill="transparent" />
                <circle 
                  cx="28" 
                  cy="28" 
                  r="24" 
                  stroke="#D97706" 
                  strokeWidth="4" 
                  fill="transparent" 
                  strokeDasharray="150.8"
                  strokeDashoffset={150.8 * (1 - vipArrivalPercent)}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-amber-600">{(vipArrivalPercent * 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* Card 4: Total Pax Hadir */}
          <div className="bg-white p-4 rounded-2xl border border-[#E5E1DA] shadow-sm flex items-center justify-between group hover:shadow transition-all duration-300">
            <div className="space-y-1">
              <span className="text-[10px] text-[#8C9A8E] uppercase tracking-wider font-semibold flex items-center gap-1">
                <TrendingUp size={12} /> Total Pax (Tamu)
              </span>
              <p className="text-xl font-bold text-[#4A5D4E] font-serif">
                {totalPaxArrived} <span className="text-xs text-gray-400 font-sans font-normal">/ {maxExpectedPax}</span>
              </p>
              <p className="text-[10px] text-[#8C9A8E]">Rasio: {(paxPercent * 100).toFixed(1)}%</p>
            </div>
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="28" cy="28" r="24" stroke="#F3F1ED" strokeWidth="4" fill="transparent" />
                <circle 
                  cx="28" 
                  cy="28" 
                  r="24" 
                  stroke="#3B82F6" 
                  strokeWidth="4" 
                  fill="transparent" 
                  strokeDasharray="150.8"
                  strokeDashoffset={150.8 * (1 - paxPercent)}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-blue-600">{(paxPercent * 100).toFixed(0)}%</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Check-in Section */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-[#E5E1DA] flex flex-col">
            <div className="flex bg-[#FDFBF7] p-1 rounded-xl mb-6 border border-[#E5E1DA]">
              <button 
                onClick={() => {
                  setCheckInMode('scan')
                  stopScanner()
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${checkInMode === 'scan' ? 'bg-[#4A5D4E] text-white shadow-sm' : 'text-[#8C9A8E] hover:text-[#4A5D4E]'}`}
              >
                <ScanLine size={16} />
                Scan QR
              </button>
              <button 
                onClick={() => {
                  setCheckInMode('search')
                  stopScanner()
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${checkInMode === 'search' ? 'bg-[#4A5D4E] text-white shadow-sm' : 'text-[#8C9A8E] hover:text-[#4A5D4E]'}`}
              >
                <Search size={16} />
                Cari Nama
              </button>
            </div>

            {checkInMode === 'scan' ? (
              <>
                <div className="flex items-center justify-between mb-4 text-[#4A5D4E]">
                  <div className="flex items-center gap-2">
                    <ScanLine size={20} />
                    <h2 className="text-lg font-medium">Scan QR Code</h2>
                  </div>
                  {isScanning && (
                    <button 
                      onClick={stopScanner}
                      className="text-xs text-red-500 hover:text-red-600 font-medium"
                    >
                      Batal
                    </button>
                  )}
                </div>
                
                <div className="relative flex-1 min-h-[300px] flex items-center justify-center bg-[#FDFBF7] rounded-xl border border-[#F3F1ED] overflow-hidden">
                  <div id="reader" className={`w-full h-full ${!isScanning ? 'hidden' : ''}`}></div>
                  
                  {!isScanning && (
                    <div className="text-center p-6">
                      <div className="w-16 h-16 bg-white rounded-full shadow-sm border border-[#E5E1DA] flex items-center justify-center mx-auto mb-4 text-[#4A5D4E]">
                        {loading ? <Upload size={32} className="animate-bounce" /> : <Camera size={32} />}
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={startScanner}
                          disabled={loading}
                          className="bg-[#4A5D4E] text-white px-6 py-3 rounded-xl hover:bg-[#3d4d41] transition-all font-medium shadow-sm flex items-center gap-2 mx-auto w-full justify-center disabled:opacity-50"
                        >
                          <Camera size={20} />
                          Mulai Scanner
                        </button>
                        
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={loading}
                          className="bg-white text-[#4A5D4E] border border-[#E5E1DA] px-6 py-3 rounded-xl hover:bg-[#FDFBF7] transition-all font-medium shadow-sm flex items-center gap-2 mx-auto w-full justify-center disabled:opacity-50"
                        >
                          <Image size={20} />
                          Upload Gambar QR
                        </button>
                        
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          className="hidden" 
                          accept="image/*" 
                          onChange={handleFileUpload}
                        />
                      </div>
                      
                      <p className="text-xs text-[#8C9A8E] mt-4">Scan langsung via kamera atau upload foto QR</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex flex-col flex-1 h-full min-h-[400px]">
                <div className="flex items-center gap-2 mb-4 text-[#4A5D4E]">
                  <Search size={20} />
                  <h2 className="text-lg font-medium">Cari Nama Tamu</h2>
                </div>
                
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C9A8E]" size={16} />
                  <input 
                    type="text"
                    placeholder="Ketik nama tamu..."
                    value={manualSearchQuery}
                    onChange={(e) => setManualSearchQuery(e.target.value)}
                    className="w-full bg-[#FDFBF7] border border-[#E5E1DA] rounded-xl py-2 pl-10 pr-4 outline-none focus:ring-1 focus:ring-[#4A5D4E] transition-all text-sm"
                  />
                </div>

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
                              <span className="text-[10px] text-gray-400 mt-0.5 font-sans">
                                {guest.has_arrived 
                                  ? `Hadir: ${guest.attendance_count || 1} / ${guest.invited_pax || 2} Pax` 
                                  : `Ekspektasi: ${guest.invited_pax || 2} Pax`
                                }
                              </span>
                              {guest.description && (
                                <span className="text-[10px] text-gray-500 italic mt-0.5">
                                  {guest.description}
                                </span>
                              )}
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
                                className="text-[10px] bg-[#C17E61] text-white px-3 py-1.5 rounded-lg hover:bg-[#A96B51] transition-all font-medium disabled:opacity-50 shadow-sm cursor-pointer"
                              >
                                Edit / Detail
                              </button>
                            ) : (
                              <button
                                onClick={() => handleSelectGuest(guest.id)}
                                disabled={loading}
                                className="text-[10px] bg-[#4A5D4E] text-white px-3 py-1.5 rounded-lg hover:bg-[#3d4d41] transition-all font-medium disabled:opacity-50 shadow-sm cursor-pointer"
                              >
                                Pilih Tamu
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
                    <div className="text-center py-12 text-[#8C9A8E]">
                      <p className="text-xs">Mulai ketik untuk mencari tamu yang belum check-in</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Guest Info Section */}
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-[#E5E1DA]">
            <div className="flex items-center gap-2 mb-6 text-[#4A5D4E]">
              <User size={20} />
              <h2 className="text-lg font-medium">Informasi Tamu</h2>
            </div>

            {guest ? (
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="pb-4 border-b border-[#F3F1ED]">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-[10px] text-[#8C9A8E] uppercase tracking-[0.2em] font-sans">Nama Tamu</p>
                      {guest.is_vip && (
                        <span className="bg-amber-400 text-amber-950 text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                          VIP GUEST
                        </span>
                      )}
                    </div>
                    <p className="text-2xl font-serif">{guest.name}</p>
                    {guest.description && (
                      <p className="text-xs text-[#8C9A8E] mt-1 font-sans italic">Keterangan: {guest.description}</p>
                    )}
                  </div>

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

                  <div className="flex items-center justify-between py-2 border-b border-[#F3F1ED]">
                    <span className="text-sm text-[#8C9A8E]">Kedatangan</span>
                    {guest.has_arrived ? (
                      <span className="flex items-center gap-1.5 text-[#4A5D4E] text-sm font-medium bg-[#F0F4F1] px-3 py-1 rounded-full">
                        <CheckCircle size={14} /> Sudah Tiba
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[#8C9A8E] text-sm font-medium bg-gray-50 px-3 py-1 rounded-full">
                        <XCircle size={14} /> Belum Tiba
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Action 1: Check In (jika belum hadir) */}
                  {!guest.has_arrived && (
                    <button
                      onClick={() => handleManualCheckIn(guest.id)}
                      disabled={loading}
                      className="w-full bg-[#4A5D4E] text-white py-3.5 rounded-xl hover:bg-[#3d4d41] transition-all flex items-center justify-center gap-2 font-semibold shadow-sm active:scale-[0.98] text-sm cursor-pointer"
                    >
                      <CheckCircle size={18} />
                      Konfirmasi & Check In Tamu
                    </button>
                  )}

                  {/* Status & Action 2: Souvenir (hanya jika sudah hadir) */}
                  {guest.has_arrived && (
                    <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#E5E1DA]">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-medium">Status Souvenir</span>
                        {guest.souvenir_taken ? (
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-medium">Sudah Diambil</span>
                        ) : (
                          <span className="text-xs text-[#8C9A8E] bg-gray-100 px-2 py-0.5 rounded-full font-medium">Belum Diambil</span>
                        )}
                      </div>

                      {!guest.souvenir_taken ? (
                        <button
                          onClick={claimSouvenir}
                          disabled={loading}
                          className="w-full bg-[#C17E61] text-white py-3 rounded-xl hover:bg-[#A96B51] transition-all flex items-center justify-center gap-2 font-medium shadow-sm active:scale-[0.98] cursor-pointer"
                        >
                          <Gift size={18} />
                          Berikan Souvenir
                        </button>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-2 text-[#4A5D4E]">
                          <div className="w-10 h-10 bg-[#F0F4F1] rounded-full flex items-center justify-center mb-2">
                            <CheckCircle size={20} />
                          </div>
                          <p className="text-sm font-medium">Souvenir telah diserahkan</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Blok Kamera & Foto Tamu */}
                  {guest.has_arrived && (
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
                              className="w-full h-full object-cover cursor-zoom-in transition-transform duration-300 group-hover:scale-105" 
                              onClick={() => setLightboxGuest(guest)}
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 pointer-events-none">
                              <span className="bg-white/90 text-[#4A5D4E] text-xs px-2.5 py-1.5 rounded-lg font-medium shadow flex items-center gap-1">
                                <Eye size={12} /> Perbesar
                              </span>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); deletePhoto(); }}
                              disabled={uploadingPhoto}
                              className="absolute bottom-2 right-2 p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-all shadow-md active:scale-95 z-10"
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
                  )}

                  {/* Blok Ucapan & Doa Tamu */}
                  {guest.has_arrived && (
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
                  )}
                  
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={handleScanOtherGuest}
                      className="w-full text-[#4A5D4E] bg-[#F0F4F1] hover:bg-[#E2EAE4] py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-medium shadow-sm cursor-pointer"
                    >
                      <Camera size={18} />
                      Scan Tamu Lain
                    </button>
                    <button 
                      onClick={handleUploadOtherGuest}
                      className="w-full text-[#4A5D4E] bg-white border border-[#E5E1DA] hover:bg-[#FDFBF7] py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-medium shadow-sm cursor-pointer"
                    >
                      <Image size={18} />
                      Upload QR Tamu Lain
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-48 flex flex-col items-center justify-center text-[#E5E1DA] text-center">
                <ScanLine size={48} className="mb-4" />
                <p className="text-[#8C9A8E] max-w-[200px]">Silakan scan QR Code tamu untuk melihat detail</p>
              </div>
            )}
          </div>
        </div>

        {/* Guest Management Tabs/Tables */}
        <div className="space-y-8">
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

          <div className="grid lg:grid-cols-3 gap-6 items-start">
            {/* Arrived Guests Table */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E1DA]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-[#4A5D4E]">
                  <Users size={18} />
                  <h2 className="font-medium">Tamu Hadir</h2>
                </div>
                <span className="bg-[#F0F4F1] text-[#4A5D4E] px-3 py-1 rounded-full text-xs font-bold">
                  {filteredArrivedGuests.length}
                </span>
              </div>

              <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredArrivedGuests.length > 0 ? (
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-[#F3F1ED]">
                      {filteredArrivedGuests.map((guest, index) => (
                        <tr key={index} className="group">
                          <td className="py-4">
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
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12 text-[#8C9A8E]">
                    <p className="text-sm">Tidak ada tamu hadir</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pending Guests Table */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E1DA]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-[#4A5D4E]">
                  <Users size={18} className="opacity-50" />
                  <h2 className="font-medium">Belum Hadir</h2>
                </div>
                <span className="bg-[#FEF5F1] text-[#C17E61] px-3 py-1 rounded-full text-xs font-bold">
                  {filteredPendingGuests.length}
                </span>
              </div>

              <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredPendingGuests.length > 0 ? (
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-[#F3F1ED]">
                      {filteredPendingGuests.map((guest, index) => (
                        <tr key={index}>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-12 text-[#8C9A8E]">
                    <p className="text-sm">Semua tamu sudah hadir</p>
                  </div>
                )}
              </div>
            </div>

            {/* Live Activity Log Timeline Table (Kolom ke-3) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E1DA] flex flex-col min-h-[464px]">
              <div className="flex items-center justify-between mb-6 border-b border-[#F3F1ED] pb-3">
                <div className="flex items-center gap-2 text-[#4A5D4E]">
                  <Clock size={18} />
                  <h2 className="font-medium font-serif">Aktivitas Kedatangan</h2>
                </div>
                <span className="bg-[#FEF5F1] text-[#C17E61] px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider animate-pulse">
                  LIVE FEED
                </span>
              </div>

              <div className="flex-1 overflow-y-auto max-h-[380px] pr-1 custom-scrollbar relative pl-3 border-l border-dashed border-[#E5E1DA]/80 space-y-4">
                {timelineEvents.length > 0 ? (
                  <AnimatePresence initial={false}>
                    {timelineEvents.map((g) => (
                      <motion.div
                        key={g.id}
                        initial={{ opacity: 0, y: -15, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 100, damping: 12 }}
                        className="relative flex items-start gap-3 group"
                      >
                        {/* Timeline bullet indicator */}
                        <div className="absolute -left-[17px] top-3.5 w-2.5 h-2.5 rounded-full bg-[#4A5D4E] border border-white group-hover:bg-[#C17E61] transition-colors duration-300" />
                        
                        {/* Mini Avatar Bulat (32px) */}
                        <div className="flex-shrink-0">
                          {g.photo_url ? (
                            <img 
                              src={g.photo_url} 
                              alt={g.name} 
                              className="w-8 h-8 rounded-full object-cover border border-[#E5E1DA] shadow-sm hover:scale-105 transition-transform cursor-zoom-in" 
                              onClick={() => setLightboxGuest(g)}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#F0F4F1] flex items-center justify-center text-[10px] font-serif font-bold text-[#4A5D4E] border border-[#E5E1DA]">
                              {getInitials(g.name)}
                            </div>
                          )}
                        </div>

                        {/* Log Text & Details */}
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <p className="text-xs text-gray-700 leading-tight">
                            <span className="font-serif font-bold text-[#4A5D4E]">{g.name}</span>
                            {g.is_vip && (
                              <span className="bg-amber-100 text-amber-800 text-[8px] px-1 py-0.2 rounded font-bold border border-amber-200 ml-1.5 inline-block align-middle">
                                VIP
                              </span>
                            )}
                            <span className="text-gray-400 font-sans ml-1 text-[10px]">telah tiba di lokasi.</span>
                          </p>
                          <span className="text-[9px] text-[#8C9A8E] flex items-center gap-1 font-medium">
                            <Clock size={10} /> {g.arrival_time ? new Date(g.arrival_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'} WIB
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                ) : (
                  <div className="text-center py-12 text-[#8C9A8E] -ml-3">
                    <p className="text-xs">Belum ada aktivitas kedatangan tamu.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Galeri Kehadiran Tamu Berpaginasi */}
          <div className="mt-12 pt-10 border-t border-[#E5E1DA] space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#4A5D4E]">
                <Camera size={20} />
                <h2 className="text-xl font-medium font-serif">Galeri Kehadiran Tamu</h2>
              </div>
              <span className="bg-[#F0F4F1] text-[#4A5D4E] px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                {guestsWithPhotos.length} Foto Tamu
              </span>
            </div>

            {paginatedGuests.length > 0 ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                  {paginatedGuests.map((g) => (
                    <div 
                      key={g.id} 
                      className="bg-white rounded-xl overflow-hidden border border-[#E5E1DA] hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col group"
                    >
                      <div 
                        className="aspect-square w-full overflow-hidden bg-gray-50 relative cursor-zoom-in"
                        onClick={() => setLightboxGuest(g)}
                      >
                        <img 
                          src={g.photo_url} 
                          alt={g.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300">
                          <span className="bg-white/95 text-[#4A5D4E] text-[10px] px-3 py-1.5 rounded-lg font-medium shadow flex items-center gap-1">
                            <Eye size={12} /> Lihat Foto
                          </span>
                        </div>
                      </div>
                      <div className="p-3 flex flex-col flex-1 border-t border-[#F3F1ED]">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-serif text-sm font-semibold text-[#4A5D4E] truncate flex-1">{g.name}</span>
                          {g.is_vip && <span className="text-[8px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold border border-amber-200">VIP</span>}
                        </div>
                        <span className="text-[10px] text-[#8C9A8E] flex items-center gap-1">
                          <Clock size={10} /> Tiba pukul {g.arrival_time ? new Date(g.arrival_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Kontrol Paginasi Galeri */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-4 border-t border-[#F3F1ED]">
                    <button
                      onClick={() => setGalleryPage(p => Math.max(1, p - 1))}
                      disabled={galleryPage === 1}
                      className="flex items-center gap-1 text-xs text-[#4A5D4E] hover:text-[#3D4C40] disabled:text-gray-300 font-semibold transition-all disabled:pointer-events-none"
                    >
                      <ChevronLeft size={16} /> Sebelumnya
                    </button>
                    <span className="text-xs text-[#8C9A8E] font-medium">
                      Halaman {galleryPage} dari {totalPages}
                    </span>
                    <button
                      onClick={() => setGalleryPage(p => Math.min(totalPages, p + 1))}
                      disabled={galleryPage === totalPages}
                      className="flex items-center gap-1 text-xs text-[#4A5D4E] hover:text-[#3D4C40] disabled:text-gray-300 font-semibold transition-all disabled:pointer-events-none"
                    >
                      Selanjutnya <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-gray-50/40 rounded-2xl border border-dashed border-[#E5E1DA]">
                <Camera size={32} className="text-gray-300 mb-2" />
                <p className="text-xs font-medium text-[#8C9A8E]">Belum ada foto tamu yang terdokumentasi.</p>
              </div>
            )}
        </div>
      </div>
    </>
    ) : (
      /* Area Manajemen Undangan */
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-[#E5E1DA] space-y-6 animate-fadeIn">
        {/* Stat Cards for Management */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#E5E1DA] shadow-sm">
            <span className="text-[10px] text-[#8C9A8E] uppercase tracking-wider font-semibold flex items-center gap-1">
              <Users size={12} /> Total Tamu
            </span>
            <p className="text-2xl font-bold text-[#4A5D4E] font-serif mt-1">{totalGuestsCount}</p>
            <p className="text-[10px] text-[#8C9A8E] mt-0.5">Tamu terdaftar di sistem</p>
          </div>
          <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#E5E1DA] shadow-sm">
            <span className="text-[10px] text-[#8C9A8E] uppercase tracking-wider font-semibold flex items-center gap-1">
              <Award size={12} /> Tamu VIP
            </span>
            <p className="text-2xl font-bold text-amber-600 font-serif mt-1">{totalVIPsCount}</p>
            <p className="text-[10px] text-[#8C9A8E] mt-0.5">Prioritas pelayanan</p>
          </div>
          <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#E5E1DA] shadow-sm">
            <span className="text-[10px] text-[#8C9A8E] uppercase tracking-wider font-semibold flex items-center gap-1">
              <CheckCircle size={12} className="text-green-600" /> Tamu RSVP
            </span>
            <p className="text-2xl font-bold text-green-700 font-serif mt-1">
              {totalRsvpedCount} <span className="text-xs text-gray-400 font-sans font-normal">/ {totalGuestsCount} ({rsvpPercent.toFixed(0)}%)</span>
            </p>
            <p className="text-[10px] text-[#8C9A8E] mt-0.5">Hadir: {rsvpPaxCount} Pax dari RSVP</p>
          </div>
          <div className="bg-[#FDFBF7] p-4 rounded-xl border border-[#E5E1DA] shadow-sm">
            <span className="text-[10px] text-[#8C9A8E] uppercase tracking-wider font-semibold flex items-center gap-1">
              <TrendingUp size={12} /> Kapasitas Pax
            </span>
            <p className="text-2xl font-bold text-blue-600 font-serif mt-1">{maxExpectedPax}</p>
            <p className="text-[10px] text-[#8C9A8E] mt-0.5">Maksimal porsi katering</p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 border-b border-[#F3F1ED] pb-6">
          {/* Search bar & VIP/RSVP Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:max-w-3xl">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C9A8E]" size={18} />
              <input
                type="text"
                placeholder="Cari nama atau keterangan tamu..."
                value={crudSearch}
                onChange={(e) => {
                  setCrudSearch(e.target.value)
                  setCrudPage(1)
                }}
                className="w-full bg-[#FDFBF7] border border-[#E5E1DA] rounded-xl py-2.5 pl-12 pr-6 outline-none focus:ring-1 focus:ring-[#4A5D4E] transition-all shadow-sm text-sm"
              />
            </div>
            
            {/* VIP Status Filter Select */}
            <div className="w-full sm:w-40">
              <select
                value={crudVipFilter}
                onChange={(e) => {
                  setCrudVipFilter(e.target.value as 'all' | 'vip' | 'non-vip')
                  setCrudPage(1)
                }}
                className="w-full bg-[#FDFBF7] border border-[#E5E1DA] rounded-xl py-2.5 px-4 outline-none focus:ring-1 focus:ring-[#4A5D4E] transition-all shadow-sm text-sm text-[#4A5D4E]"
              >
                <option value="all">Semua VIP/Reg</option>
                <option value="vip">Hanya VIP ⭐</option>
                <option value="non-vip">Reguler</option>
              </select>
            </div>

            {/* RSVP Status Filter Select */}
            <div className="w-full sm:w-40">
              <select
                value={crudRsvpFilter}
                onChange={(e) => {
                  setCrudRsvpFilter(e.target.value as 'all' | 'confirmed' | 'unconfirmed')
                  setCrudPage(1)
                }}
                className="w-full bg-[#FDFBF7] border border-[#E5E1DA] rounded-xl py-2.5 px-4 outline-none focus:ring-1 focus:ring-[#4A5D4E] transition-all shadow-sm text-sm text-[#4A5D4E]"
              >
                <option value="all">Semua RSVP</option>
                <option value="confirmed">RSVP Hadir</option>
                <option value="unconfirmed">Belum RSVP</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={() => {
                setEditingGuest(null)
                setCrudName('')
                setCrudDescription('')
                setCrudInvitedPax(2)
                setCrudIsVip(false)
                setShowCrudModal(true)
              }}
              className="flex-1 md:flex-initial bg-[#4A5D4E] hover:bg-[#3D4C40] text-white px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 font-semibold shadow-sm text-xs cursor-pointer"
            >
              <Plus size={14} /> Tambah Tamu
            </button>
            <button
              onClick={handleDownloadCSVTemplate}
              className="flex-1 md:flex-initial bg-white border border-[#E5E1DA] hover:bg-[#FDFBF7] text-[#4A5D4E] px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 font-semibold shadow-sm text-xs cursor-pointer"
            >
              <Download size={14} /> Unduh Template CSV
            </button>
            <button
              onClick={() => fileImportRef.current?.click()}
              disabled={importingCSV}
              className="flex-1 md:flex-initial bg-[#C17E61] hover:bg-[#A96B51] disabled:bg-gray-300 text-white px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 font-semibold shadow-sm text-xs cursor-pointer"
            >
              <FileSpreadsheet size={14} /> {importingCSV ? 'Mengimpor...' : 'Impor Tamu (CSV)'}
            </button>
            <input
              type="file"
              ref={fileImportRef}
              className="hidden"
              accept=".csv"
              onChange={handleImportCSV}
            />
          </div>
        </div>

        {/* Table Area */}
        <div className="overflow-x-auto rounded-xl border border-[#E5E1DA]">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-[#FDFBF7] text-[#4A5D4E] font-serif border-b border-[#E5E1DA]">
                <th className="p-4 font-semibold">Nama Tamu</th>
                <th className="p-4 font-semibold">Grup/Ket.</th>
                <th className="p-4 font-semibold">VIP Status</th>
                <th className="p-4 font-semibold text-center">Kapasitas Pax</th>
                <th className="p-4 font-semibold text-center">Pax Hadir (RSVP)</th>
                <th className="p-4 font-semibold">Status RSVP</th>
                <th className="p-4 font-semibold">Kehadiran</th>
                <th className="p-4 font-semibold">QR Code & Link</th>
                <th className="p-4 font-semibold text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F1ED]">
              {paginatedCrudGuests.length > 0 ? (
                paginatedCrudGuests.map((g) => (
                  <tr key={g.id} className="hover:bg-[#FDFBF7]/50 transition-colors">
                    <td className="p-4 font-serif font-medium text-[#4A5D4E]">
                      {g.name}
                    </td>
                    <td className="p-4 text-[#8C9A8E] text-xs">
                      {g.description || '-'}
                    </td>
                    <td className="p-4">
                      {g.is_vip ? (
                        <span className="bg-amber-100 text-amber-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold border border-amber-200">
                          VIP
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-600 text-[10px] px-2.5 py-0.5 rounded-full font-medium">
                          Regular
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center font-semibold">
                      {g.invited_pax || 2} Pax
                    </td>
                    <td className="p-4 text-center">
                      {g.rsvp_status ? (
                        <span className="bg-green-50 text-green-700 text-xs font-semibold px-2 py-0.5 rounded border border-green-100">
                          {g.attendance_count || 1} Pax
                        </span>
                      ) : (
                        <span className="text-gray-400 font-sans">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      {g.rsvp_status ? (
                        <span className="bg-green-50 text-green-700 text-[10px] px-2.5 py-0.5 rounded-full font-semibold border border-green-100">
                          Hadir
                        </span>
                      ) : (
                        <span className="bg-gray-50 text-gray-500 text-[10px] px-2.5 py-0.5 rounded-full font-medium">
                          Belum RSVP
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {g.has_arrived ? (
                        <span className="inline-flex flex-col text-[10px] text-green-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded">
                          <span className="font-semibold">Sudah Hadir</span>
                          {g.arrival_time && (
                            <span className="text-[8px] text-gray-400 font-sans mt-0.5">
                              {new Date(g.arrival_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="bg-red-50 text-red-700 text-[10px] px-2.5 py-0.5 rounded font-medium border border-red-100">
                          Belum Hadir
                        </span>
                      )}
                    </td>
                    <td className="p-4 space-y-1">
                      <code className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded block w-fit font-mono">
                        {g.qr_code}
                      </code>
                      <button
                        onClick={() => handleCopyInvitationLink(g.qr_code, g.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all border cursor-pointer ${
                          copiedGuestId === g.id
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : 'bg-white border-[#E5E1DA] hover:border-[#4A5D4E] text-[#4A5D4E]'
                        }`}
                      >
                        {copiedGuestId === g.id ? (
                          <>
                            <Check size={10} />
                            <span>Tersalin</span>
                          </>
                        ) : (
                          <>
                            <Copy size={10} />
                            <span>Salin Link</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditingGuest(g)
                            setCrudName(g.name)
                            setCrudDescription(g.description || '')
                            setCrudInvitedPax(g.invited_pax || 2)
                            setCrudIsVip(g.is_vip || false)
                            setShowCrudModal(true)
                          }}
                          className="text-xs text-[#4A5D4E] hover:text-[#3D4C40] bg-[#F0F4F1] hover:bg-[#E2EAE4] px-2.5 py-1.5 rounded-lg transition-all font-semibold cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteGuest(g.id, g.name)}
                          className="text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1.5 rounded-lg transition-all font-semibold cursor-pointer"
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[#8C9A8E]">
                    Tidak ada data tamu ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalCrudPages > 1 && (
          <div className="flex items-center justify-center gap-4 pt-4 border-t border-[#F3F1ED]">
            <button
              onClick={() => setCrudPage((p) => Math.max(1, p - 1))}
              disabled={crudPage === 1}
              className="flex items-center gap-1 text-xs text-[#4A5D4E] hover:text-[#3D4C40] disabled:text-gray-300 font-semibold transition-all disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft size={16} /> Sebelumnya
            </button>
            <span className="text-xs text-[#8C9A8E] font-medium">
              Halaman {crudPage} dari {totalCrudPages}
            </span>
            <button
              onClick={() => setCrudPage((p) => Math.min(totalCrudPages, p + 1))}
              disabled={crudPage === totalCrudPages}
              className="flex items-center gap-1 text-xs text-[#4A5D4E] hover:text-[#3D4C40] disabled:text-gray-300 font-semibold transition-all disabled:pointer-events-none cursor-pointer"
            >
              Selanjutnya <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>
    )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #FDFBF7;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E5E1DA;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #8C9A8E;
        }
        #reader {
          background: black !important;
        }
        #reader video {
          object-fit: cover !important;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out forwards;
        }
      `}</style>

      {/* Modal Lightbox Zoom Foto Tamu */}
      {lightboxGuest && (
        <div 
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 backdrop-blur-md p-4 transition-all duration-300 animate-fadeIn"
          onClick={() => setLightboxGuest(null)}
        >
          <button 
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-all duration-200"
            onClick={() => setLightboxGuest(null)}
          >
            <X size={24} />
          </button>
          <div 
            className="relative max-w-md w-full bg-[#FDFBF7] rounded-2xl overflow-hidden border border-[#E5E1DA] shadow-2xl transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="aspect-square w-full bg-black flex items-center justify-center">
              <img 
                src={lightboxGuest.photo_url} 
                alt={lightboxGuest.name} 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="p-5 bg-white border-t border-[#F3F1ED]">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-serif text-[#4A5D4E] font-semibold truncate flex-1">{lightboxGuest.name}</h3>
                {lightboxGuest.is_vip && (
                  <span className="bg-amber-400 text-amber-950 text-[9px] px-2 py-0.5 rounded-full font-bold shadow-sm">
                    VIP
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#8C9A8E] flex items-center gap-1.5">
                <Clock size={13} /> Hadir pukul {lightboxGuest.arrival_time ? new Date(lightboxGuest.arrival_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'} WIB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modal CRUD Tamu */}
      {showCrudModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-all duration-300 animate-fadeIn"
          onClick={() => setShowCrudModal(false)}
        >
          <div 
            className="bg-white rounded-2xl border border-[#E5E1DA] shadow-2xl max-w-md w-full overflow-hidden transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-[#F3F1ED] bg-[#FDFBF7]">
              <h3 className="text-lg font-serif font-semibold text-[#4A5D4E]">
                {editingGuest ? 'Edit Data Tamu' : 'Tambah Tamu Baru'}
              </h3>
              <button 
                onClick={() => setShowCrudModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-full transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSaveGuest} className="p-5 space-y-4">
              {/* Nama Tamu */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#4A5D4E] block">Nama Tamu *</label>
                <input 
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={crudName}
                  onChange={(e) => setCrudName(e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-[#E5E1DA] rounded-xl px-4 py-2.5 outline-none focus:ring-1 focus:ring-[#4A5D4E] text-sm transition-all"
                />
              </div>

              {/* Keterangan / Grup */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#4A5D4E] block">Keterangan / Grup Undangan</label>
                <input 
                  type="text"
                  placeholder="Contoh: Tamu CPW, Teman Kuliah, dll."
                  value={crudDescription}
                  onChange={(e) => setCrudDescription(e.target.value)}
                  className="w-full bg-[#FDFBF7] border border-[#E5E1DA] rounded-xl px-4 py-2.5 outline-none focus:ring-1 focus:ring-[#4A5D4E] text-sm transition-all"
                />
              </div>

              {/* Kapasitas Pax & VIP Checkbox */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-[#4A5D4E] block">Kapasitas Pax (Undangan)</label>
                  <input 
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={crudInvitedPax}
                    onChange={(e) => setCrudInvitedPax(Number(e.target.value))}
                    className="w-full bg-[#FDFBF7] border border-[#E5E1DA] rounded-xl px-4 py-2.5 outline-none focus:ring-1 focus:ring-[#4A5D4E] text-sm transition-all"
                  />
                </div>
                
                <div className="flex items-center gap-2 pt-6 pl-2">
                  <input 
                    type="checkbox"
                    id="vip-checkbox"
                    checked={crudIsVip}
                    onChange={(e) => setCrudIsVip(e.target.checked)}
                    className="w-4 h-4 rounded text-[#4A5D4E] focus:ring-[#4A5D4E] border-[#E5E1DA] cursor-pointer"
                  />
                  <label htmlFor="vip-checkbox" className="text-xs font-semibold text-[#4A5D4E] cursor-pointer select-none">
                    Tamu VIP
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-[#F3F1ED]">
                <button
                  type="button"
                  onClick={() => setShowCrudModal(false)}
                  className="flex-1 bg-white hover:bg-gray-50 border border-[#E5E1DA] text-gray-600 py-2.5 rounded-xl transition-all font-semibold text-xs text-center cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#4A5D4E] hover:bg-[#3D4C40] text-white py-2.5 rounded-xl transition-all font-semibold text-xs text-center shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={12} className="animate-spin" /> Menyimpan...
                    </>
                  ) : (
                    'Simpan Tamu'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Real-time Check-In Notifications Feed */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className="bg-white/95 backdrop-blur-md border border-[#E5E1DA] p-4 rounded-xl shadow-lg flex items-start gap-3 pointer-events-auto w-full select-none"
            >
              <div className={`p-2 rounded-lg ${t.id.startsWith('copy-') ? 'bg-green-50 text-green-600 border border-green-200' : t.is_vip ? 'bg-amber-50 text-amber-600 border border-amber-200' : 'bg-[#F0F4F1] text-[#4A5D4E]'}`}>
                {t.id.startsWith('copy-') ? (
                  <CheckCircle size={16} />
                ) : (
                  <Sparkles size={16} className={t.is_vip ? 'animate-pulse' : ''} />
                )}
              </div>
              <div className="flex-1 space-y-0.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-serif font-bold text-gray-800">{t.name}</span>
                  {!t.id.startsWith('copy-') && t.is_vip && (
                    <span className="bg-amber-400 text-amber-950 text-[8px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                      VIP
                    </span>
                  )}
                </div>
                {t.id.startsWith('copy-') ? (
                  <p className="text-[10px] text-gray-600 font-sans font-medium">{t.description}</p>
                ) : (
                  <>
                    {t.description && (
                      <p className="text-[9px] text-[#C17E61] italic font-sans">{t.description}</p>
                    )}
                    <p className="text-[10px] text-gray-500">Baru saja check-in di pintu gerbang.</p>
                    <span className="text-[9px] text-gray-400 flex items-center gap-1 font-medium">
                      <Clock size={10} /> Tiba pukul {t.arrival_time ? new Date(t.arrival_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </span>
                  </>
                )}
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter(toast => toast.id !== t.id))}
                className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full transition-all"
              >
                <X size={12} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}
