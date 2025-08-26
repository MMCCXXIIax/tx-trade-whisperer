import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabaseClient'

export default function AuthLoading() {
  const navigate = useNavigate()

  useEffect(() => {
    let mounted = true

    const routeUser = async () => {
      // Wait for Supabase to hydrate session
      let { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return

      if (!session?.user) {
        // Listen briefly for auth state change before giving up
        const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
          if (newSession?.user && mounted) {
            session = newSession
            sub.subscription.unsubscribe()
            checkProfile(newSession.user.id)
          }
        })

        // Give it 1 second to hydrate before redirecting to /auth
        setTimeout(() => {
          if (!session?.user && mounted) {
            sub.subscription.unsubscribe()
            navigate('/auth', { replace: true })
          }
        }, 1000)
        return
      }

      checkProfile(session.user.id)
    }

    const checkProfile = async (userId: string) => {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching profile:', error)
        navigate('/auth', { replace: true })
        return
      }

      if (!profile) {
        navigate('/welcome', { replace: true })
      } else {
        navigate('/tx-dashboard', { replace: true })
      }
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
