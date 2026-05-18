import { useState, useEffect } from 'react'
import { Html5QrcodeScanner } from 'html5-qrcode'
import { supabase } from '../lib/supabase'
import { CheckCircle, XCircle, Gift, User, ScanLine } from 'lucide-react'

export const AdminCMS = () => {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [guest, setGuest] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const adminPass = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123'
    if (password === adminPass) {
      setIsAuthenticated(true)
    } else {
      alert('Password salah!')
    }
  }

  const onScanSuccess = async (decodedText: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('guests')
        .select('*')
        .eq('qr_code', decodedText)
        .single()
      
      if (error) throw error
      setGuest(data)
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
      const scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      )
      scanner.render(onScanSuccess, () => {})

      return () => {
        scanner.clear().catch(error => console.error("Failed to clear scanner", error))
      }
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-white p-8 rounded-lg shadow-sm border border-gray-100">
          <h1 className="text-2xl font-serif text-center mb-6">Admin Login</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 mb-4 focus:ring-1 focus:ring-gray-900 outline-none"
            placeholder="Masukkan Password"
          />
          <button className="w-full bg-gray-900 text-white py-2 rounded hover:bg-black transition-colors">
            Login
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-serif italic text-gray-900">CMS Penerima Tamu</h1>
          <button onClick={() => setIsAuthenticated(false)} className="text-sm text-gray-500 hover:text-red-500">Logout</button>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-4 text-gray-600">
              <ScanLine size={20} />
              <h2 className="text-lg font-medium">Scan QR Code</h2>
            </div>
            <div id="reader" className="overflow-hidden rounded-lg"></div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6 text-gray-600">
              <User size={20} />
              <h2 className="text-lg font-medium">Informasi Tamu</h2>
            </div>

            {guest ? (
              <div className="space-y-6">
                <div className="pb-4 border-b border-gray-100">
                  <p className="text-sm text-gray-400 uppercase tracking-widest mb-1">Nama Tamu</p>
                  <p className="text-2xl font-serif text-gray-900">{guest.name}</p>
                </div>

                <div className="flex items-center justify-between py-2">
                  <span className="text-gray-600">Status Kehadiran</span>
                  {guest.rsvp_status ? (
                    <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                      <CheckCircle size={16} /> Hadir ({guest.attendance_count} orang)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-red-500 text-sm font-medium">
                      <XCircle size={16} /> Belum RSVP
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between py-2 mb-4">
                  <span className="text-gray-600">Souvenir</span>
                  {guest.souvenir_taken ? (
                    <span className="flex items-center gap-1 text-blue-600 text-sm font-medium">
                      <Gift size={16} /> Sudah Diambil
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-400 text-sm font-medium">
                      <Gift size={16} /> Belum Diambil
                    </span>
                  )}
                </div>

                {!guest.souvenir_taken && (
                  <button
                    onClick={claimSouvenir}
                    disabled={loading}
                    className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <Gift size={20} />
                    Berikan Souvenir
                  </button>
                )}
                
                <button 
                  onClick={() => setGuest(null)}
                  className="w-full text-gray-400 text-sm hover:text-gray-600 py-2"
                >
                  Scan Ulang
                </button>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-gray-300 text-center">
                <ScanLine size={48} className="mb-4 opacity-20" />
                <p>Silakan scan QR Code tamu<br/>untuk melihat informasi</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
