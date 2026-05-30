import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './lib/AuthContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Invitation } from './pages/Invitation'
import { AdminCMS } from './pages/AdminCMS'
import { LoginPage } from './pages/LoginPage'
import { ProjectorSlideshow } from './pages/ProjectorSlideshow'

function App() {
  return (
    <AuthProvider>
      <Router>
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
      </Router>
    </AuthProvider>
  )
}

export default App
