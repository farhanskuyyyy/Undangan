import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
        <div className="flex flex-col items-center gap-3 text-[#4A5D4E]">
          <div className="w-8 h-8 border-2 border-[#4A5D4E] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-serif">Memuat...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
