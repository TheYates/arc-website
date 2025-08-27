import { createClient } from '@supabase/supabase-js'

// Load environment variables in Node.js environment
if (typeof window === 'undefined') {
  require('dotenv').config()
}

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Environment variables:')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '[SET]' : '[NOT SET]')
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'arc-website'
    }
  }
})

// Helper function to check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Database types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      // Add your table types here as needed
      users: {
        Row: {
          id: string
          email: string
          first_name: string
          last_name: string
          role: string
          created_at: string
          updated_at: string
          // Add other fields as needed
        }
        Insert: {
          id?: string
          email: string
          first_name: string
          last_name: string
          role: string
          created_at?: string
          updated_at?: string
          // Add other fields as needed
        }
        Update: {
          id?: string
          email?: string
          first_name?: string
          last_name?: string
          role?: string
          updated_at?: string
          // Add other fields as needed
        }
      }
      // Add other tables as needed
    }
  }
}

export default supabase
