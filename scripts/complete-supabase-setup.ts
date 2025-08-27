#!/usr/bin/env tsx

/**
 * Complete Supabase setup following official documentation
 * Run with: npx tsx scripts/complete-supabase-setup.ts
 */

import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

console.log('🚀 Complete Supabase Setup Guide\n')

console.log('📋 Step-by-Step Instructions:\n')

console.log('1️⃣ **Create Custom Prisma User in Supabase**')
console.log('   Go to your Supabase SQL Editor:')
console.log('   https://supabase.com/dashboard/project/lgknlyjxnqvqsmoqbkwj/sql')
console.log('')
console.log('   Copy and run this SQL:')
console.log('   ```sql')
console.log('   -- Create custom user')
console.log('   CREATE USER "prisma" WITH PASSWORD \'pgPooLwHM8D9EptP\' BYPASSRLS CREATEDB;')
console.log('')
console.log('   -- Extend prisma\'s privileges to postgres')
console.log('   GRANT "prisma" TO "postgres";')
console.log('')
console.log('   -- Grant necessary permissions')
console.log('   GRANT USAGE ON SCHEMA public TO prisma;')
console.log('   GRANT CREATE ON SCHEMA public TO prisma;')
console.log('   GRANT ALL ON ALL TABLES IN SCHEMA public TO prisma;')
console.log('   GRANT ALL ON ALL ROUTINES IN SCHEMA public TO prisma;')
console.log('   GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO prisma;')
console.log('')
console.log('   -- Set default privileges')
console.log('   ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO prisma;')
console.log('   ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO prisma;')
console.log('   ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO prisma;')
console.log('   ```')
console.log('')

console.log('2️⃣ **Verify Connection String**')
console.log('   Your .env file should have:')
console.log('   DATABASE_URL=\'postgresql://prisma.lgknlyjxnqvqsmoqbkwj:pgPooLwHM8D9EptP@aws-1-eu-west-3.pooler.supabase.com:5432/postgres?sslmode=require\'')
console.log('')

console.log('3️⃣ **Test Prisma Connection**')
console.log('   After creating the user, run:')
console.log('   npm run test:supabase')
console.log('')

console.log('4️⃣ **Apply Your Schema**')
console.log('   Once connection works, run:')
console.log('   npx prisma db push')
console.log('')

console.log('5️⃣ **Complete Migration**')
console.log('   If you have data to migrate from Neon:')
console.log('   npm run migrate:api')
console.log('')

console.log('📝 **Current Configuration:**')
console.log('Project Reference:', 'lgknlyjxnqvqsmoqbkwj')
console.log('Region:', 'eu-west-3')
console.log('Connection Type:', 'Session Pooler (recommended for Prisma)')
console.log('Custom User:', 'prisma')
console.log('')

console.log('🔍 **Troubleshooting:**')
console.log('- Make sure to run the SQL in Supabase SQL Editor first')
console.log('- The custom user approach is recommended by Supabase for Prisma')
console.log('- Session pooler (port 5432) is better for Prisma than transaction pooler (port 6543)')
console.log('- If you get authentication errors, double-check the password in the SQL')
console.log('')

console.log('📚 **Reference:**')
console.log('Supabase Prisma Guide: https://supabase.com/docs/guides/database/prisma')
console.log('')

console.log('✅ **Ready to proceed!**')
console.log('Start with step 1 above, then test the connection.')
