import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'

type Status = 'checking' | 'guest' | 'ready'

export default function ProtectedRoute({
  children,
  allowGuests = false
}: {
  children: JSX.Element
  allowGuests?: boolean
}) {
  const [status, setStatus] = useState<Status>('checking')
  const location = useLocation()

  // Skip guard for auth-loading
  if (location.pathname === '/auth-loading') {
    return children
  }

  useEffect(() => {
    let mounted = true

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return

      if (!session?.user) {
        setStatus('guest')
        return
      }

      // User is authenticated - no profile check needed
      // Direct access to TX dashboard after Supabase authentication
      setStatus('ready')
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session?.user) {
        setStatus('guest')
      } else {
        setStatus('ready')
      }
    })

    checkAuth()

    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  // Let guest-allowed routes render immediately
  if (status === 'checking') {
    if (allowGuests) return children
    return null
  }

  if (status === 'guest') {
    return allowGuests ? children : <Navigate to="/auth" replace />
  }

  if (status === 'ready') {
    // Redirect away from auth pages when authenticated
    if (location.pathname === '/auth' || location.pathname === '/welcome') {
      return <Navigate to="/tx-dashboard" replace />
    }
  }

  return children
}