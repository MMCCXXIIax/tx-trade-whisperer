import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '@/components/ui/ProtectedRoute'
import AuthPage from '@/pages/AuthPage'
import Welcome from '@/pages/Welcome'
import TXMainDashboard from '@/components/TXMainDashboard';
import NotFoundPage from '@/pages/NotFound'
import AuthLoading from '@/pages/AuthLoading' // public route
import { Toaster } from '@/components/ui/toaster'
import { logDeploymentInfo } from '@/lib/deploymentDetection'

export default function App() {
  // Log deployment info for debugging
  React.useEffect(() => {
    logDeploymentInfo();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Public login page */}
        <Route path="/auth" element={<ProtectedRoute allowGuests><AuthPage /></ProtectedRoute>} />
        
        {/* Public post-OAuth session hydration page */}
        <Route path="/auth-loading" element={<AuthLoading />} />

        {/* Onboarding */}
        <Route path="/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />

        {/* Main dashboard with full navigation */}
        <Route path="/tx-dashboard" element={<ProtectedRoute><TXMainDashboard /></ProtectedRoute>} />

        {/* Default - Direct to dashboard for beta */}
        <Route path="/" element={<Navigate to="/tx-dashboard" replace />} />

        {/* Catch-all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Toaster />
    </Router>
  )
}
