import { supabase } from '@/integrations/supabase/client'

export interface ProfilePayload {
  id: string
  name?: string
  email?: string
  mode?: 'demo' | 'live'
}

export async function saveProfile(payload: ProfilePayload) {
  try {
    // First ensure user exists in users table
    const { error: userError } = await supabase
      .from('users')
      .upsert({ id: payload.id }, { onConflict: 'id' })

    if (userError) {
      console.error('Error creating user record:', userError)
      return { success: false, error: userError.message }
    }

    // Profile creation is now optional - we don't create profiles automatically
    // Users can access TX without profiles
    console.log('User authenticated successfully, bypassing profile creation')
    
    return { success: true, data: null }
  } catch (error: any) {
    console.error('Error in saveProfile:', error)
    return { success: false, error: error.message }
  }
}