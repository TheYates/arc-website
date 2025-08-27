#!/usr/bin/env tsx

/**
 * Import data to Supabase database after migration
 * Run with: npx tsx scripts/import-to-supabase.ts
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Use the new Supabase connection (make sure to update .env first)
const prisma = new PrismaClient();

async function importData() {
  try {
    console.log('🔄 Starting data import to Supabase...');

    // Find the latest export file
    const exportDir = path.join(process.cwd(), 'data-export');
    const files = fs.readdirSync(exportDir).filter(f => f.startsWith('neon-export-') && f.endsWith('.json'));
    
    if (files.length === 0) {
      throw new Error('No export file found. Please run export script first.');
    }

    const latestFile = files.sort().reverse()[0];
    const exportFile = path.join(exportDir, latestFile);
    
    console.log(`📁 Reading export file: ${exportFile}`);
    const exportData = JSON.parse(fs.readFileSync(exportFile, 'utf8'));

    // Import order matters due to foreign key constraints
    const importOrder = [
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
    ];

    for (const table of importOrder) {
      const data = exportData[table];
      if (!data || data.length === 0) {
        console.log(`⏭️  Skipping ${table} (no data)`);
        continue;
      }

      try {
        console.log(`📊 Importing ${data.length} records to ${table}...`);
        
        // Use createMany for bulk insert
        await (prisma as any)[table].createMany({
          data: data,
          skipDuplicates: true // Skip if record already exists
        });
        
        console.log(`✅ Imported ${data.length} records to ${table}`);
      } catch (error) {
        console.error(`❌ Failed to import ${table}:`, error);
        // Continue with other tables
      }
    }

    console.log(`✅ Data import completed!`);

  } catch (error) {
    console.error('❌ Import failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

importData();
