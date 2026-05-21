import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Lock, Mail, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'

export const LoginPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      navigate('/admin', { replace: true })
    } catch (err: any) {
      if (err.message?.includes('Invalid login credentials')) {
        setError('Email atau password salah.')
      } else if (err.message?.includes('Email not confirmed')) {
        setError('Email belum dikonfirmasi. Cek inbox email Anda.')
      } else {
        setError(err.message || 'Terjadi kesalahan. Coba lagi.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] px-6 font-serif">
      {/* Decorative background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#4A5D4E]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-[#C17E61]/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-[#4A5D4E] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#4A5D4E]/20">
            <Lock size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-serif italic text-[#4A5D4E] mb-1">Admin Login</h1>
          <p className="text-sm text-[#8C9A8E] font-sans">Masuk ke CMS Penerima Tamu</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E5E1DA] p-8">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Error Alert */}
            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-3 text-sm font-sans">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs text-[#8C9A8E] uppercase tracking-widest mb-2 font-sans">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C9A8E]" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full border border-[#E5E1DA] rounded-xl px-4 py-3 pl-10 focus:ring-1 focus:ring-[#4A5D4E] outline-none transition-all text-sm font-sans bg-[#FDFBF7] placeholder:text-[#C4BEB5]"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs text-[#8C9A8E] uppercase tracking-widest mb-2 font-sans">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C9A8E]" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full border border-[#E5E1DA] rounded-xl px-4 py-3 pl-10 pr-11 focus:ring-1 focus:ring-[#4A5D4E] outline-none transition-all text-sm font-sans bg-[#FDFBF7] placeholder:text-[#C4BEB5]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C9A8E] hover:text-[#4A5D4E] transition-colors"
                  aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full bg-[#4A5D4E] text-white py-3 rounded-xl hover:bg-[#3d4d41] transition-all font-sans font-medium shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Masuk...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Masuk</span>
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-[#8C9A8E] font-sans mt-6">
          Hanya admin yang memiliki akses ke halaman ini.
        </p>
      </div>
    </div>
  )
}
