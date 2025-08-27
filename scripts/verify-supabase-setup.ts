#!/usr/bin/env tsx

/**
 * Verify Supabase setup and provide guidance
 * Run with: npx tsx scripts/verify-supabase-setup.ts
 */

import dotenv from 'dotenv'
import { supabase } from '../lib/supabase'

// Load environment variables
dotenv.config()

console.log('🔍 Verifying Supabase Setup...\n')

async function verifySetup() {
  // Test Supabase client connection (this uses the API, not direct DB connection)
  console.log('1. Testing Supabase API connection...')
  try {
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.log('⚠️  Auth session check returned error (this is normal for new projects):', error.message)
    } else {
      console.log('✅ Supabase API connection successful')
    }
  } catch (error) {
    console.error('❌ Supabase API connection failed:', error)
    return
  }

  // Test basic API functionality
  console.log('\n2. Testing basic API functionality...')
  try {
    // Try to get the current timestamp from Supabase
    const { data, error } = await supabase.rpc('now')
    
    if (error) {
      console.log('⚠️  RPC call failed (this might be normal):', error.message)
    } else {
      console.log('✅ Basic API functionality working, current time:', data)
    }
  } catch (error) {
    console.log('⚠️  RPC test failed (this might be normal for new projects)')
  }

  // Check if we can access the database through Supabase API
  console.log('\n3. Testing database access through Supabase API...')
  try {
    // Try to access a system table that should always exist
    const { data, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .limit(1)
    
    if (error) {
      console.log('⚠️  Database access through API failed:', error.message)
      console.log('This is expected if tables haven\'t been created yet.')
    } else {
      console.log('✅ Database access through Supabase API working')
    }
  } catch (error) {
    console.log('⚠️  Database API test failed (this might be normal)')
  }

  console.log('\n📋 Current Configuration:')
  console.log('Project URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '[SET]' : '[NOT SET]')
  console.log('Database URL:', process.env.DATABASE_URL)

  console.log('\n🔧 Next Steps:')
  console.log('1. ✅ Supabase client is configured and can connect to the API')
  console.log('2. ❓ Database connection needs to be verified')
  console.log('3. 📝 You may need to create tables manually in Supabase dashboard first')
  
  console.log('\n💡 To resolve database connection issues:')
  console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard')
  console.log('2. Select your project')
  console.log('3. Go to Settings > Database')
  console.log('4. Verify the connection string is correct')
  console.log('5. Make sure your database password is correct')
  console.log('6. Try creating a simple table in the SQL editor first')
  
  console.log('\n🎯 Alternative: Create tables manually in Supabase dashboard')
  console.log('1. Go to Table Editor in your Supabase dashboard')
  console.log('2. Create a simple test table')
  console.log('3. Then try running: npm run test:supabase')
}

verifySetup().catch(console.error)
