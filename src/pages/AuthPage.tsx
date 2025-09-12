import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
<<<<<<< HEAD
import { supabase } from '@/integrations/supabase/client'
import { saveProfile } from '@/lib/saveProfile'

=======
import { createClient } from '@supabase/supabase-js'
import { saveProfile } from '@/lib/saveProfile'

const supabase = createClient(
  'https://zqrelfdmdrwwxrfoclzp.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxcmVsZmRtZHJ3d3hyZm9jbHpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MTU1MDAsImV4cCI6MjA3MDA5MTUwMH0.Uebb9Xk8AESgapG95JbX0LoxlO-XCFUlTn6nrXCe1c8'
)

>>>>>>> c646b09155e6d424b19520438c4cb96f629963d5
export default function AuthPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return

      if (session?.user) {
        await handleProfileSave(session.user)
        navigate('/tx-dashboard', { replace: true })
      }

      setLoading(false)
    }

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        await handleProfileSave(session.user)
        navigate('/tx-dashboard', { replace: true })
      }
    })

    init()
    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [navigate])

  const handleProfileSave = async (user: any) => {
    const payload = {
      id: user.id,
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
      email: user.email || '',
      mode: "demo" as const // or 'broker' depending on your onboarding logic
    }

    const result = await saveProfile(payload)
    if (!result.success) {
      console.error('❌ Profile save failed:', result.error)
    }
  }

  if (loading) return null

  return (
    <div className="bg-background text-foreground p-6 rounded-lg shadow-lg max-w-md mx-auto mt-12">
      <Auth
        supabaseClient={supabase}
        appearance={{
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: 'hsl(152, 100%, 50%)', // --tx-green
                brandAccent: 'hsl(210, 100%, 50%)', // --tx-blue
                brandButtonText: 'hsl(0, 0%, 7%)', // --tx-black
                inputBackground: 'hsl(0, 0%, 12%)', // --tx-gray
                inputText: 'white',
                inputBorder: 'hsl(0, 0%, 20%)',
              },
              fonts: {
                bodyFontFamily: 'Inter, sans-serif',
                buttonFontFamily: 'Inter, sans-serif',
                inputFontFamily: 'Inter, sans-serif',
              },
              radii: {
                borderRadiusButton: '6px',
                inputBorderRadius: '6px',
              },
            },
          }
        }}
        providers={['github', 'discord']}
        magicLink
        redirectTo={window.location.origin + '/auth-loading'} // <-- now goes to auth-loading
      />
    </div>
  )
}