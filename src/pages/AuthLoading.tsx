import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'

export default function AuthLoading() {
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true

    const finishAuth = async () => {
      // Wait for Supabase to hydrate session
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return

      if (!session?.user) {
        navigate('/auth', { replace: true })
        return
      }

      // Check profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle()

      if (!profile) {
        navigate('/welcome', { replace: true })
      } else {
        navigate('/tx-dashboard', { replace: true })
      }
    }

    finishAuth()
    return () => { mounted = false }
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-lg font-semibold">
        Authenticating…
      </div>
    </div>
  )
}
