import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'

type Status = 'checking' | 'guest' | 'needsProfile' | 'ready'

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [status, setStatus] = useState<Status>('checking')
  const location = useLocation()

  useEffect(() => {
    let mounted = true

    const checkAuthAndProfile = async () => {
      // 1. Check session
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return

      if (!session?.user) {
        setStatus('guest')
        return
      }

      // 2. Check if profile exists in public.profiles
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle()

      if (error) {
        console.error('Error fetching profile:', error)
        setStatus('guest') // fallback to login
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

  if (status === 'checking') return null

  // Not logged in → go to /auth
  if (status === 'guest') return <Navigate to="/auth" replace />

  // Logged in but no profile → go to /welcome
  if (status === 'needsProfile' && location.pathname !== '/welcome') {
    return <Navigate to="/welcome" replace />
  }

  // Logged in and has profile → if they try to hit /welcome, send to dashboard
  if (status === 'ready' && location.pathname === '/welcome') {
    return <Navigate to="/dashboard" replace />
  }

  return children
}
