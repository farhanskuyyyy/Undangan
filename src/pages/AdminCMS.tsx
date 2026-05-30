import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { CheckCircle, XCircle, Gift, User, ScanLine, Clock, Users, Search, Camera, Image, Upload, LogOut, Trash2, Check, RefreshCw } from 'lucide-react'

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



  const fetchGuests = async () => {
    try {
      const { data: arrivedData, error: arrivedError } = await supabase
        .from('guests')
        .select('id, name, arrival_time, is_vip, photo_url')
        .eq('has_arrived', true)
        .order('arrival_time', { ascending: false })
      
      if (arrivedError) throw arrivedError
      setArrivedGuests(arrivedData || [])

      const { data: pendingData, error: pendingError } = await supabase
        .from('guests')
        .select('id, name, is_vip')
        .eq('has_arrived', false)
        .order('name', { ascending: true })
      
      if (pendingError) throw pendingError
      setPendingGuests(pendingData || [])
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
      alert('Gagal mengakses kamera. Pastikan izin kamera telah diberikan.')
    }
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
      alert('Tidak ada QR Code ditemukan dalam gambar. Pastikan gambar jelas dan berisi QR Code.')
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
      
      // Auto-mark arrival
      if (data && !data.has_arrived) {
        const { error: updateError } = await supabase
          .from('guests')
          .update({ has_arrived: true, arrival_time: new Date().toISOString() })
          .eq('id', data.id)
        
        if (updateError) console.error('Error marking arrival:', updateError)
        data.has_arrived = true
      }

      setGuest(data)
      fetchGuests()
    } catch (error) {
      console.error('Error fetching guest:', error)
      alert('Tamu tidak ditemukan atau QR Code salah.')
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
        .select()
        .single()
      
      if (error) throw error
      
      setGuest(data)
      fetchGuests()
      setManualSearchQuery('') // Clear search after successful check-in
      alert(`Berhasil check-in: ${data.name}`)
    } catch (error) {
      console.error('Error manual check-in:', error)
      alert('Gagal melakukan check-in manual.')
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
      alert('Souvenir berhasil diberikan!')
    } catch (error) {
      console.error('Error updating souvenir status:', error)
      alert('Gagal update status souvenir.')
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

  const filteredArrivedGuests = arrivedGuests.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredPendingGuests = pendingGuests.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredManualPendingGuests = pendingGuests.filter(g => 
    g.name.toLowerCase().includes(manualSearchQuery.toLowerCase())
  )


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
                  </div>

                  <div className="flex items-center justify-between py-2 border-b border-[#F3F1ED]">
                    <span className="text-sm text-[#8C9A8E]">Status RSVP</span>
                    {guest.rsvp_status ? (
                      <span className="flex items-center gap-1.5 text-[#4A5D4E] text-sm font-medium bg-[#F0F4F1] px-3 py-1 rounded-full">
                        <CheckCircle size={14} /> Hadir ({guest.attendance_count})
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-[#C17E61] text-sm font-medium bg-[#FEF5F1] px-3 py-1 rounded-full">
                        <XCircle size={14} /> Belum RSVP
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
                        className="w-full bg-[#C17E61] text-white py-3 rounded-xl hover:bg-[#A96B51] transition-all flex items-center justify-center gap-2 font-medium shadow-sm active:scale-[0.98]"
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
                  
                  <div className="flex flex-col gap-2">
                    <button 
                      onClick={startScanner}
                      className="w-full text-[#4A5D4E] bg-[#F0F4F1] hover:bg-[#E2EAE4] py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-medium shadow-sm"
                    >
                      <Camera size={18} />
                      Scan Tamu Lain
                    </button>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full text-[#4A5D4E] bg-white border border-[#E5E1DA] hover:bg-[#FDFBF7] py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-medium shadow-sm"
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
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C9A8E]" size={18} />
            <input 
              type="text"
              placeholder="Cari nama tamu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-[#E5E1DA] rounded-full py-3 pl-12 pr-6 outline-none focus:ring-1 focus:ring-[#4A5D4E] transition-all shadow-sm"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
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
                            <div className="flex items-center gap-1.5 text-[11px] text-[#8C9A8E] mt-0.5">
                              <Clock size={12} />
                              {guest.arrival_time ? new Date(guest.arrival_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
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
                          <td className="py-4 text-[#8C9A8E] font-serif flex items-center gap-2">
                            {guest.name}
                            {guest.is_vip && <span className="text-[10px] bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-bold border border-amber-100">VIP</span>}
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
          </div>
        </div>
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
      `}</style>
    </div>
  )
}
