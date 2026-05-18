import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { supabase } from '../lib/supabase'
import { CheckCircle, XCircle, Gift, User, ScanLine, Clock, Users, Search, Camera } from 'lucide-react'

export const AdminCMS = () => {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [guest, setGuest] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [arrivedGuests, setArrivedGuests] = useState<any[]>([])
  const [pendingGuests, setPendingGuests] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'
    if (password === adminPass) {
      setIsAuthenticated(true)
    } else {
      alert('Password salah!')
    }
  }

  const fetchGuests = async () => {
    try {
      const { data: arrivedData, error: arrivedError } = await supabase
        .from('guests')
        .select('name, arrival_time')
        .eq('has_arrived', true)
        .order('arrival_time', { ascending: false })
      
      if (arrivedError) throw arrivedError
      setArrivedGuests(arrivedData || [])

      const { data: pendingData, error: pendingError } = await supabase
        .from('guests')
        .select('name')
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
    if (isAuthenticated) {
      fetchGuests()
    }
    return () => {
      stopScanner()
    }
  }, [isAuthenticated])

  const filteredArrivedGuests = arrivedGuests.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredPendingGuests = pendingGuests.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-6 font-serif">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-[#E5E1DA]">
          <h1 className="text-2xl text-center mb-6 text-[#4A5D4E]">Admin Login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-[#E5E1DA] rounded-xl px-4 py-3 mb-4 focus:ring-1 focus:ring-[#4A5D4E] outline-none transition-all"
            placeholder="Masukkan Password"
          />
          <button className="w-full bg-[#4A5D4E] text-white py-3 rounded-xl hover:bg-[#3d4d41] transition-colors font-medium">
            Login
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 md:p-12 text-[#4A5D4E]">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-serif italic mb-1">CMS Penerima Tamu</h1>
            <p className="text-sm text-[#8C9A8E]">Kelola kehadiran dan souvenir tamu</p>
          </div>
          <button 
            onClick={() => setIsAuthenticated(false)} 
            className="text-sm bg-white px-4 py-2 rounded-full border border-[#E5E1DA] hover:border-red-200 hover:text-red-500 transition-all shadow-sm"
          >
            Logout
          </button>
        </header>

        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* Scanner Section */}
          <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-[#E5E1DA] flex flex-col">
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
                    <Camera size={32} />
                  </div>
                  <button
                    onClick={startScanner}
                    className="bg-[#4A5D4E] text-white px-6 py-3 rounded-xl hover:bg-[#3d4d41] transition-all font-medium shadow-sm flex items-center gap-2 mx-auto"
                  >
                    <Camera size={20} />
                    Mulai Scanner
                  </button>
                  <p className="text-xs text-[#8C9A8E] mt-4">Klik tombol untuk mengaktifkan kamera</p>
                </div>
              )}
            </div>
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
                    <p className="text-[10px] text-[#8C9A8E] uppercase tracking-[0.2em] mb-1 font-sans">Nama Tamu</p>
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
                  
                  <button 
                    onClick={startScanner}
                    className="w-full text-[#4A5D4E] bg-[#F0F4F1] hover:bg-[#E2EAE4] py-3 rounded-xl transition-all flex items-center justify-center gap-2 font-medium shadow-sm"
                  >
                    <Camera size={18} />
                    Scan Tamu Lain
                  </button>
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
                            <p className="text-[#4A5D4E] font-serif">{guest.name}</p>
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
                          <td className="py-4 text-[#8C9A8E] font-serif">{guest.name}</td>
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
