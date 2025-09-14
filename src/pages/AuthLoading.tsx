import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'

export default function AuthLoading() {
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true

    const routeUser = async () => {
      // Wait for session
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return

      if (!session?.user) {
        navigate('/auth', { replace: true })
        return
      }

      // User is authenticated - go directly to TX dashboard
      // No profile check needed anymore
      navigate('/tx-dashboard', { replace: true })
    }

    routeUser()
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