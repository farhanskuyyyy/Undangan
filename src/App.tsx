import { lazy, Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Invitation } from './pages/Invitation'

// Code splitting: Heavy admin, login, and projector pages are lazy loaded
const LoginPage = lazy(() => import('./pages/LoginPage').then(m => ({ default: m.LoginPage })))
const AdminCMS = lazy(() => import('./pages/AdminCMS').then(m => ({ default: m.AdminCMS })))
const ProjectorSlideshow = lazy(() => import('./pages/ProjectorSlideshow').then(m => ({ default: m.ProjectorSlideshow })))

function AppLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
      <div className="animate-pulse text-lg font-serif italic text-[#831843]">Memuat...</div>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<AppLoadingFallback />}>
          <Routes>
            <Route path="/" element={<Invitation />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminCMS />
                </ProtectedRoute>
              }
            />
            <Route path="/projector" element={<ProjectorSlideshow />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  )
}

export default App
