import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/integrations/supabase/client'

export default function AuthPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!mounted) return

      if (session?.user) {
        // User is already authenticated - go directly to TX dashboard
        navigate('/tx-dashboard', { replace: true })
      }

      setLoading(false)
    }

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // User signed in - go directly to TX dashboard
        // No profile creation needed
        navigate('/tx-dashboard', { replace: true })
      }
    })

    init()
    return () => {
      mounted = false
      sub.subscription.unsubscribe()
    }
  }, [navigate])

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
        redirectTo={window.location.origin + '/auth-loading'}
      />
    </div>
  )
}