import { supabase } from './supabase'
import { prisma } from './database/postgresql'

/**
 * Utility functions for Supabase integration
 */

// Test Supabase connection
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
    
    if (error) {
      console.error('Supabase connection test failed:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Supabase connection successful')
    return { success: true, data }
  } catch (error) {
    console.error('Supabase connection test failed:', error)
    return { success: false, error: 'Connection failed' }
  }
}

// Test Prisma connection to Supabase
export async function testPrismaSupabaseConnection() {
  try {
    await prisma.$connect()
    const userCount = await prisma.user.count()
    console.log(`✅ Prisma connected to Supabase. Found ${userCount} users.`)
    return { success: true, userCount }
  } catch (error) {
    console.error('❌ Prisma connection to Supabase failed:', error)
    console.log('💡 This is likely a connection string issue. The Supabase API is working fine.')
    console.log('💡 You can still use Supabase through the API client for most operations.')
    return { success: false, error }
  } finally {
    try {
      await prisma.$disconnect()
    } catch (e) {
      // Ignore disconnect errors if connection failed
    }
  }
}

// Get Supabase project info
export async function getSupabaseProjectInfo() {
  try {
    const { data, error } = await supabase.rpc('version')
    
    if (error) {
      console.error('Failed to get Supabase project info:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true, version: data }
  } catch (error) {
    console.error('Failed to get Supabase project info:', error)
    return { success: false, error: 'Failed to get project info' }
  }
}

// Enable Row Level Security (RLS) for a table
export async function enableRLS(tableName: string) {
  try {
    const { error } = await supabase.rpc('enable_rls', { table_name: tableName })
    
    if (error) {
      console.error(`Failed to enable RLS for ${tableName}:`, error)
      return { success: false, error: error.message }
    }
    
    console.log(`✅ RLS enabled for ${tableName}`)
    return { success: true }
  } catch (error) {
    console.error(`Failed to enable RLS for ${tableName}:`, error)
    return { success: false, error: 'Failed to enable RLS' }
  }
}

// Create RLS policies (example for users table)
export async function createUserRLSPolicies() {
  try {
    // Policy: Users can only see their own data
    const { error: selectError } = await supabase.rpc('create_policy', {
      policy_name: 'Users can view own data',
      table_name: 'users',
      operation: 'SELECT',
      expression: 'auth.uid() = id::uuid'
    })

    if (selectError) {
      console.error('Failed to create SELECT policy:', selectError)
      return { success: false, error: selectError.message }
    }

    // Policy: Users can update their own data
    const { error: updateError } = await supabase.rpc('create_policy', {
      policy_name: 'Users can update own data',
      table_name: 'users',
      operation: 'UPDATE',
      expression: 'auth.uid() = id::uuid'
    })

    if (updateError) {
      console.error('Failed to create UPDATE policy:', updateError)
      return { success: false, error: updateError.message }
    }

    console.log('✅ RLS policies created for users table')
    return { success: true }
  } catch (error) {
    console.error('Failed to create RLS policies:', error)
    return { success: false, error: 'Failed to create RLS policies' }
  }
}

// Backup database to Supabase Storage (optional)
export async function backupToStorage(data: any, filename: string) {
  try {
    const { data: uploadData, error } = await supabase.storage
      .from('backups')
      .upload(filename, JSON.stringify(data, null, 2), {
        contentType: 'application/json'
      })

    if (error) {
      console.error('Failed to backup to storage:', error)
      return { success: false, error: error.message }
    }

    console.log(`✅ Backup saved to storage: ${filename}`)
    return { success: true, path: uploadData.path }
  } catch (error) {
    console.error('Failed to backup to storage:', error)
    return { success: false, error: 'Backup failed' }
  }
}

// Get database statistics
export async function getDatabaseStats() {
  try {
    const stats = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation
      FROM pg_stats 
      WHERE schemaname = 'public'
      LIMIT 10;
    `

    return { success: true, stats }
  } catch (error) {
    console.error('Failed to get database stats:', error)
    return { success: false, error }
  }
}
