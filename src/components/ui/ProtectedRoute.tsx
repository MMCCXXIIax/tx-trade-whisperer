// src/components/ProtectedRoute.tsx
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [status, setStatus] = useState<'checking'|'authed'|'guest'>('checking')

  useEffect(() => {
    let mounted = true
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return
      setStatus(session ? 'authed' : 'guest')
    }
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setStatus(session ? 'authed' : 'guest')
    })
    check()
    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [])

  if (status === 'checking') return null
  if (status === 'guest') return <Navigate to="/auth" replace />
  return children
}
