// src/pages/AuthPage.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/lib/supabaseClient'
import { saveProfile } from '@/lib/saveProfile'

export default function AuthPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return

      if (session?.user) {
        await handleProfileSaveAndRedirect(session.user)
      }

      setLoading(false)
    }

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await handleProfileSaveAndRedirect(session.user)
      }
    })

    init()
    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [navigate])

  const handleProfileSaveAndRedirect = async (user: any) => {
    const payload = {
      id: user.id,
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
      email: user.email || '',
      mode: 'demo' // or 'broker' depending on your onboarding logic
    }

    const result = await saveProfile(payload)

    if (result.success) {
      navigate('/dashboard', { replace: true })
    } else {
      console.error('❌ Profile save failed:', result.error)
      // Optional: show toast or error UI here
    }
  }

  if (loading) return null

  return (
    <div style={{ maxWidth: 420, margin: '2rem auto' }}>
      <Auth
        supabaseClient={supabase}
        appearance={{ theme: ThemeSupa }}
        providers={['google', 'github', 'discord']}
        magicLink
        redirectTo={window.location.origin + '/dashboard'}
      />
    </div>
  )
}
