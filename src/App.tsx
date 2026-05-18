import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Invitation } from './pages/Invitation'
import { AdminCMS } from './pages/AdminCMS'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Invitation />} />
        <Route path="/admin" element={<AdminCMS />} />
      </Routes>
    </Router>
  )
}

export default App
