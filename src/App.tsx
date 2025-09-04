import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '@/components/ui/ProtectedRoute'
import AuthPage from '@/pages/AuthPage'
import Welcome from '@/pages/Welcome'
import TXDashboard from '@/components/TXDashboard';
import NotFoundPage from '@/pages/NotFound'
import AuthLoading from '@/pages/AuthLoading' // public route
import { Toaster } from '@/components/ui/toaster'

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public login page */}
        <Route path="/auth" element={<ProtectedRoute allowGuests><AuthPage /></ProtectedRoute>} />
        
        {/* Public post-OAuth session hydration page */}
        <Route path="/auth-loading" element={<AuthLoading />} />

        {/* Onboarding */}
        <Route path="/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />

        {/* Main dashboard */}
        <Route path="/tx-dashboard" element={<ProtectedRoute><TXDashboard /></ProtectedRoute>} />

        {/* Default */}
        <Route path="/" element={<Navigate to="/auth" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </Router>
  )
}
