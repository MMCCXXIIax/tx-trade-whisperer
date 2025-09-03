import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'

type Status = 'checking' | 'guest' | 'needsProfile' | 'ready'

export default function ProtectedRoute({
  children,
  allowGuests = false
}: {
  children: JSX.Element
  allowGuests?: boolean
}) {
  const [status, setStatus] = useState<Status>('checking')
  const location = useLocation()

  // 🚫 Skip guard for auth-loading
  if (location.pathname === '/auth-loading') {
    return children
  }

  useEffect(() => {
    let mounted = true

    const checkAuthAndProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return

      if (!session?.user) {
        setStatus('guest')
        return
      }

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle()

      if (error) {
        console.error('Error fetching profile:', error)
        setStatus('guest')
        return
      }

      if (!profile) {
        setStatus('needsProfile')
      } else {
        setStatus('ready')
      }
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session?.user) {
        setStatus('guest')
      } else {
        checkAuthAndProfile()
      }
    })

    checkAuthAndProfile()

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

  if (status === 'needsProfile' && location.pathname !== '/welcome') {
    return <Navigate to="/welcome" replace />
  }

  if (status === 'ready') {
    if (location.pathname === '/auth' || location.pathname === '/welcome') {
      return <Navigate to="/tx-dashboard" replace />
    }
  }

  return children
}
