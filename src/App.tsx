import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '@/components/ui/ProtectedRoute'
import AuthPage from '@/pages/AuthPage'
import WelcomePage from '@/pages/Welcome'
import TXDashboard from '@/components/TXDashboard'
import NotFoundPage from '@/pages/NotFound'

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected onboarding route */}
        <Route
          path="/welcome"
          element={
            <ProtectedRoute>
              <WelcomePage />
            </ProtectedRoute>
          }
        />

        {/* Protected main app route */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <TXDashboard />
            </ProtectedRoute>
          }
        />

        {/* Default route → Auth */}
        <Route path="/" element={<Navigate to="/auth" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  )
}
