import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '@/components/ui/ProtectedRoute'
import AuthPage from '@/pages/AuthPage'
import WelcomePage from '@/pages/Welcome'
import TXDashboard from '@/components/TXDashboard'
import NotFoundPage from '@/pages/NotFound'
import AuthLoading from '@/pages/AuthLoading' // <-- new page

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public route but blocked for logged-in users */}
        <Route path="/auth" element={<ProtectedRoute allowGuests><AuthPage /></ProtectedRoute>} />

        {/* Public route for post-OAuth session hydration */}
        <Route path="/auth-loading" element={<AuthLoading />} />

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
          path="/tx-dashboard"
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
