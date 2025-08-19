// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/integrations/supabase/types'

// Create a single supabase client for the entire app
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
  {
    auth: {
      storage: localStorage,         // persist sessions in browser
      persistSession: true,          // keep users signed in
      autoRefreshToken: true         // refresh session automatically
    }
  }
)
