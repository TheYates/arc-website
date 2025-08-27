import { supabase } from './supabase'

/**
 * Database operations using Supabase API
 * Use this when Prisma direct connection is not available
 */

// User operations
export const supabaseDb = {
  users: {
    // Get all users
    async findMany() {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    },

    // Get user by ID
    async findUnique(id: string) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    },

    // Get user by email
    async findByEmail(email: string) {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()
      
      if (error) throw error
      return data
    },

    // Create user
    async create(userData: {
      email: string
      password_hash: string
      first_name: string
      last_name: string
      role: string
      phone?: string
      address?: string
    }) {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    // Update user
    async update(id: string, userData: Partial<{
      email: string
      first_name: string
      last_name: string
      phone: string
      address: string
      is_active: boolean
      profile_complete: boolean
      last_login: string
    }>) {
      const { data, error } = await supabase
        .from('users')
        .update({ ...userData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()
      
      if (error) throw error
      return data
    },

    // Delete user
    async delete(id: string) {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      return true
    },

    // Count users
    async count() {
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
      
      if (error) throw error
      return count || 0
    }
  },

  // Test connection
  async testConnection() {
    try {
      const userCount = await this.users.count()
      console.log(`✅ Supabase DB API working. Found ${userCount} users.`)
      return { success: true, userCount }
    } catch (error) {
      console.error('❌ Supabase DB API failed:', error)
      return { success: false, error }
    }
  }
}

// Helper function to check if table exists
export async function checkTableExists(tableName: string) {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      return { exists: false, error: error.message }
    }
    
    return { exists: true, count: data }
  } catch (error) {
    return { exists: false, error: 'Unknown error' }
  }
}

export default supabaseDb
