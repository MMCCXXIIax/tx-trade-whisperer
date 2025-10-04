import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from '@/integrations/supabase/client'
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
    // For now, we'll skip the backend profile save since it's causing issues
    // and focus on the Supabase profile which is working
    try {
      // Try to save/update the Supabase profile instead
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });
      
      if (error) {
        console.error('❌ Supabase profile save failed:', error);
      }
      
      // Optionally try the backend save, but don't fail if it doesn't work
      try {
        const payload = {
          id: user.id,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          email: user.email || '',
          mode: "demo" as const
        }
        
        const result = await saveProfile(payload)
        if (!result.success) {
          console.warn('⚠️ Backend profile save failed (non-critical):', result.error)
        }
      } catch (backendError) {
        console.warn('⚠️ Backend profile save failed (non-critical):', backendError)
      }
    } catch (error) {
      console.error('❌ Profile handling failed:', error)
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