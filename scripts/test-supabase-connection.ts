#!/usr/bin/env tsx

/**
 * Test Supabase connection and configuration
 * Run with: npx tsx scripts/test-supabase-connection.ts
 */

import { testSupabaseConnection, testPrismaSupabaseConnection, getSupabaseProjectInfo } from '../lib/supabase-utils'
import { isSupabaseConfigured } from '../lib/supabase'
import { supabaseDb, checkTableExists } from '../lib/supabase-db'

async function testConnection() {
  console.log('🔍 Testing Supabase Connection...\n')

  // Check environment variables
  console.log('1. Checking environment variables...')
  if (!isSupabaseConfigured()) {
    console.error('❌ Supabase environment variables are missing!')
    console.log('Please set the following in your .env file:')
    console.log('- NEXT_PUBLIC_SUPABASE_URL')
    console.log('- NEXT_PUBLIC_SUPABASE_ANON_KEY')
    console.log('- DATABASE_URL (pointing to Supabase)')
    return
  }
  console.log('✅ Environment variables configured\n')

  // Test Supabase client connection
  console.log('2. Testing Supabase client connection...')
  const supabaseTest = await testSupabaseConnection()
  if (!supabaseTest.success) {
    console.error('❌ Supabase client connection failed:', supabaseTest.error)
    return
  }
  console.log('✅ Supabase client connection successful\n')

  // Test Prisma connection to Supabase
  console.log('3. Testing Prisma connection to Supabase...')
  const prismaTest = await testPrismaSupabaseConnection()
  if (!prismaTest.success) {
    console.log('⚠️  Prisma direct connection failed, but this is OK!')
    console.log('   We can use Supabase API for database operations instead.\n')
  } else {
    console.log(`✅ Prisma connected successfully. Found ${prismaTest.userCount} users\n`)
  }

  // Test Supabase DB API as alternative
  console.log('4. Testing Supabase DB API (alternative to Prisma)...')
  const supabaseDbTest = await supabaseDb.testConnection()
  if (!supabaseDbTest.success) {
    console.error('❌ Supabase DB API failed:', supabaseDbTest.error)
    return
  }
  console.log(`✅ Supabase DB API working. Found ${supabaseDbTest.userCount} users\n`)

  // Check what tables exist
  console.log('5. Checking available tables...')
  const tables = ['users', 'patients', 'services', 'applications']
  for (const table of tables) {
    const tableCheck = await checkTableExists(table)
    if (tableCheck.exists) {
      console.log(`✅ Table '${table}' exists`)
    } else {
      console.log(`⚠️  Table '${table}' not found: ${tableCheck.error}`)
    }
  }

  // Get project info
  console.log('\n6. Getting Supabase project information...')
  const projectInfo = await getSupabaseProjectInfo()
  if (projectInfo.success) {
    console.log('✅ Project info retrieved:', projectInfo.version)
  } else {
    console.log('⚠️  Could not retrieve project info:', projectInfo.error)
  }

  console.log('\n🎉 Supabase is properly connected and working!')
  console.log('\n📊 Connection Status:')
  console.log('✅ Supabase API: Working')
  console.log('✅ Database Operations: Working (via Supabase API)')
  console.log(prismaTest.success ? '✅ Prisma: Working' : '⚠️  Prisma: Direct connection failed (but API works)')

  console.log('\n🚀 Next steps:')
  console.log('1. Run your application: npm run dev')
  console.log('2. Use Supabase dashboard for database management')
  console.log('3. Your app can use both Supabase API and Prisma (when connection is fixed)')
  console.log('4. Consider enabling Row Level Security (RLS) for production')

  if (!prismaTest.success) {
    console.log('\n💡 To fix Prisma connection:')
    console.log('1. Go to Supabase Dashboard > Settings > Database')
    console.log('2. Copy the exact "Connection string" (URI format)')
    console.log('3. Update your .env DATABASE_URL with the correct string')
    console.log('4. Make sure your database password is correct')
  }
}

// Run the test
testConnection().catch(console.error)
