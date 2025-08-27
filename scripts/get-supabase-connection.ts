#!/usr/bin/env tsx

/**
 * Get correct Supabase connection details
 * Run with: npx tsx scripts/get-supabase-connection.ts
 */

import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

console.log('🔍 Getting Supabase Connection Details...\n')

const projectRef = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/(.+)\.supabase\.co/)?.[1]

if (!projectRef) {
  console.error('❌ Could not extract project reference from SUPABASE_URL')
  process.exit(1)
}

console.log('📋 Your Supabase Project Details:')
console.log('Project Reference:', projectRef)
console.log('Project URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

console.log('\n🔗 Possible Connection Strings to Try:')
console.log('\n1. Direct Connection (most common):')
console.log(`DATABASE_URL='postgresql://postgres:[YOUR-PASSWORD]@db.${projectRef}.supabase.co:5432/postgres?sslmode=require'`)

console.log('\n2. Connection Pooler (Transaction Mode):')
console.log(`DATABASE_URL='postgresql://postgres.${projectRef}:[YOUR-PASSWORD]@aws-0-eu-west-2.pooler.supabase.com:5432/postgres?sslmode=require'`)

console.log('\n3. Connection Pooler (Session Mode):')
console.log(`DATABASE_URL='postgresql://postgres.${projectRef}:[YOUR-PASSWORD]@aws-0-eu-west-2.pooler.supabase.com:6543/postgres?sslmode=require'`)

console.log('\n📝 Instructions:')
console.log('1. Go to your Supabase Dashboard: https://supabase.com/dashboard')
console.log(`2. Select your project: ${projectRef}`)
console.log('3. Go to Settings > Database')
console.log('4. Find "Connection string" section')
console.log('5. Copy the URI format connection string')
console.log('6. Replace [YOUR-PASSWORD] with your actual database password')
console.log('7. Update your .env file with the correct DATABASE_URL')

console.log('\n🔍 Current DATABASE_URL in your .env:')
console.log(process.env.DATABASE_URL)

console.log('\n💡 Common Issues:')
console.log('- Make sure your database password is correct')
console.log('- Try different connection string formats above')
console.log('- Ensure your Supabase project is fully initialized (can take a few minutes)')
console.log('- Check if your region matches (you appear to be in eu-west-2)')

console.log('\n🧪 Test Connection:')
console.log('After updating .env, run: npm run test:supabase')
