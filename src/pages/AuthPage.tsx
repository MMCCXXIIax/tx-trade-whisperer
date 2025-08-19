// src/pages/AuthPage.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabaseClient'

export default function AuthPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return
      if (session) navigate('/dashboard', { replace: true })
      setLoading(false)
    }

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate('/dashboard', { replace: true })
    })

    init()
    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [navigate])

  if (loading) return null

  return (
    <div style={{ maxWidth: 420, margin: '2rem auto' }}>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={['google', 'github']}
        magicLink
        redirectTo={window.location.origin + '/dashboard'}
      />
    </div>
  )
}
