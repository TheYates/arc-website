#!/usr/bin/env tsx

/**
 * Debug Supabase connection details
 * Run with: npx tsx scripts/debug-connection.ts
 */

import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

console.log('🔍 Debugging Supabase Connection Details...\n')

console.log('Environment Variables:')
console.log('DATABASE_URL:', process.env.DATABASE_URL)
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '[SET]' : '[NOT SET]')
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '[SET]' : '[NOT SET]')

console.log('\n📋 Connection String Analysis:')
if (process.env.DATABASE_URL) {
  try {
    const url = new URL(process.env.DATABASE_URL)
    console.log('Protocol:', url.protocol)
    console.log('Host:', url.hostname)
    console.log('Port:', url.port)
    console.log('Database:', url.pathname.slice(1))
    console.log('Username:', url.username)
    console.log('Password:', url.password ? '[SET]' : '[NOT SET]')
    console.log('Search params:', url.search)
  } catch (error) {
    console.error('❌ Invalid DATABASE_URL format:', error)
  }
} else {
  console.error('❌ DATABASE_URL not set')
}

console.log('\n🌐 Testing basic connectivity...')

// Test if we can resolve the hostname
import { lookup } from 'dns'
import { promisify } from 'util'

const dnsLookup = promisify(lookup)

async function testDNS() {
  // Extract hostname from DATABASE_URL
  let hostname = 'db.lgknlyjxnqvqsmoqbkwj.supabase.co' // default

  if (process.env.DATABASE_URL) {
    try {
      const url = new URL(process.env.DATABASE_URL)
      hostname = url.hostname
    } catch (error) {
      console.error('Could not parse DATABASE_URL for hostname')
    }
  }

  try {
    const result = await dnsLookup(hostname)
    console.log(`✅ DNS resolution successful for ${hostname}:`, result)
  } catch (error) {
    console.error(`❌ DNS resolution failed for ${hostname}:`, error)
  }
}

testDNS()

console.log('\n💡 Troubleshooting Tips:')
console.log('1. Verify your Supabase project is active in the dashboard')
console.log('2. Check if your database password is correct')
console.log('3. Ensure your IP is not blocked (Supabase allows all IPs by default)')
console.log('4. Try using the connection pooler URL instead')
console.log('5. Check Supabase status page: https://status.supabase.com/')

console.log('\n📖 To get the correct connection string:')
console.log('1. Go to your Supabase dashboard')
console.log('2. Navigate to Settings > Database')
console.log('3. Copy the "Connection string" (URI format)')
console.log('4. Replace [YOUR-PASSWORD] with your actual database password')
