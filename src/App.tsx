import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '@/components/ui/ProtectedRoute'
import AuthPage from '@/pages/AuthPage'
import Welcome from '@/pages/Welcome'
import TXMainDashboard from '@/components/TXMainDashboard';
import SettingsPage from '@/components/SettingsPage';
import NotFoundPage from '@/pages/NotFound'
import AuthLoading from '@/pages/AuthLoading'
import { Toaster } from '@/components/ui/toaster'
import { AuthProvider } from '@/components/auth/AuthProvider'

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public login page */}
          <Route path="/auth" element={<ProtectedRoute allowGuests><AuthPage /></ProtectedRoute>} />
          
          {/* Public post-OAuth session hydration page */}
          <Route path="/auth-loading" element={<AuthLoading />} />

          {/* Onboarding */}
          <Route path="/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />

          {/* Main dashboard */}
          <Route path="/tx-dashboard" element={<ProtectedRoute><TXMainDashboard /></ProtectedRoute>} />

          {/* Settings */}
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

          {/* Default */}
          <Route path="/" element={<Navigate to="/tx-dashboard" replace />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  )
}
