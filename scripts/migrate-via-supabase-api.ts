#!/usr/bin/env tsx

/**
 * Migrate data from Neon to Supabase using Supabase API
 * This bypasses the Prisma connection issue
 * Run with: npx tsx scripts/migrate-via-supabase-api.ts
 */

import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { supabase } from '../lib/supabase'

// Load environment variables
dotenv.config()

async function migrateData() {
  console.log('🚀 Starting migration from Neon to Supabase via API...\n')

  // Find the latest export file
  const exportDir = path.join(process.cwd(), 'data-export')
  
  if (!fs.existsSync(exportDir)) {
    console.error('❌ Export directory not found. Please run export script first.')
    return
  }

  const files = fs.readdirSync(exportDir).filter(f => f.startsWith('neon-export-') && f.endsWith('.json'))
  
  if (files.length === 0) {
    console.error('❌ No export file found. Please run: npm run migrate:export')
    return
  }

  const latestFile = files.sort().reverse()[0]
  const exportFile = path.join(exportDir, latestFile)
  
  console.log(`📁 Reading export file: ${exportFile}`)
  const exportData = JSON.parse(fs.readFileSync(exportFile, 'utf8'))

  // Check if we have any data to migrate
  const totalRecords = Object.values(exportData).reduce((sum: number, arr: any) => sum + (Array.isArray(arr) ? arr.length : 0), 0)
  
  if (totalRecords === 0) {
    console.log('ℹ️  No data found in export file. This might mean:')
    console.log('   1. Your Neon database was empty')
    console.log('   2. The export script couldn\'t connect to Neon')
    console.log('   3. The export script needs to be run again')
    
    console.log('\n🔄 Would you like to try exporting from Neon again?')
    console.log('   Run: npm run migrate:export')
    return
  }

  console.log(`📊 Found ${totalRecords} total records to migrate`)

  // Migration order (respects foreign key constraints)
  const migrationOrder = [
    'users',
    'patients', 
    'services',
    'serviceItems',
    'applications',
    'medications',
    'prescriptions',
    'medicationAdministrations',
    'careNotes',
    'vitalSigns',
    'caregiverAssignments',
    'reviewerAssignments',
    'serviceRequests',
    'caregiverSchedules',
    'medicalReviews',
    'jobPositions',
    'careerApplications',
    'invoices',
    'adminSettings'
  ]

  let totalMigrated = 0
  let errors = 0

  for (const tableName of migrationOrder) {
    const data = exportData[tableName]
    
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log(`⏭️  Skipping ${tableName} (no data)`)
      continue
    }

    console.log(`\n📊 Migrating ${data.length} records to ${tableName}...`)

    try {
      // Use Supabase API to insert data
      const { data: insertedData, error } = await supabase
        .from(tableName)
        .insert(data)
        .select()

      if (error) {
        console.error(`❌ Failed to migrate ${tableName}:`, error.message)
        errors++
        
        // Try inserting one by one if batch insert fails
        console.log(`🔄 Trying individual inserts for ${tableName}...`)
        let individualSuccess = 0
        
        for (const record of data) {
          try {
            const { error: individualError } = await supabase
              .from(tableName)
              .insert(record)
            
            if (individualError) {
              console.log(`   ⚠️  Failed to insert record: ${individualError.message}`)
            } else {
              individualSuccess++
            }
          } catch (err) {
            console.log(`   ⚠️  Error inserting record:`, err)
          }
        }
        
        if (individualSuccess > 0) {
          console.log(`   ✅ Successfully inserted ${individualSuccess}/${data.length} records individually`)
          totalMigrated += individualSuccess
        }
      } else {
        console.log(`✅ Successfully migrated ${data.length} records to ${tableName}`)
        totalMigrated += data.length
      }
    } catch (error) {
      console.error(`❌ Unexpected error migrating ${tableName}:`, error)
      errors++
    }
  }

  console.log('\n🎉 Migration Summary:')
  console.log(`✅ Total records migrated: ${totalMigrated}`)
  console.log(`❌ Tables with errors: ${errors}`)
  
  if (totalMigrated > 0) {
    console.log('\n🚀 Next steps:')
    console.log('1. Verify your data in Supabase dashboard')
    console.log('2. Test your application: npm run dev')
    console.log('3. Run connection test: npm run test:supabase')
  }

  if (errors > 0) {
    console.log('\n💡 If you had errors:')
    console.log('1. Check the error messages above')
    console.log('2. Some errors might be due to duplicate data (which is OK)')
    console.log('3. You can manually fix any issues in Supabase dashboard')
  }
}

migrateData().catch(console.error)
