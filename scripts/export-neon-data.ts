#!/usr/bin/env tsx

/**
 * Export data from Neon database before migration to Supabase
 * Run with: npx tsx scripts/export-neon-data.ts
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

// Use the current Neon connection
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://neondb_owner:npg_h2XVSDazft7q@ep-morning-cherry-ab53t7wg-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    }
  }
});

async function exportData() {
  try {
    console.log('🔄 Starting data export from Neon...');

    // Create exports directory
    const exportDir = path.join(process.cwd(), 'data-export');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    // Export all tables
    const tables = [
      'users',
      'patients', 
      'applications',
      'services',
      'serviceItems',
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

    const exportData: any = {};

    for (const table of tables) {
      try {
        console.log(`📊 Exporting ${table}...`);
        
        // Dynamically access the table
        const data = await (prisma as any)[table].findMany();
        exportData[table] = data;
        
        console.log(`✅ Exported ${data.length} records from ${table}`);
      } catch (error) {
        console.log(`⚠️  Skipping ${table} (table might not exist or be empty)`);
        exportData[table] = [];
      }
    }

    // Save to JSON file
    const exportFile = path.join(exportDir, `neon-export-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(exportFile, JSON.stringify(exportData, null, 2));

    console.log(`✅ Data export completed!`);
    console.log(`📁 Export saved to: ${exportFile}`);
    console.log(`📊 Total tables exported: ${Object.keys(exportData).length}`);

    // Summary
    console.log('\n📋 Export Summary:');
    Object.entries(exportData).forEach(([table, data]: [string, any]) => {
      console.log(`   ${table}: ${data.length} records`);
    });

  } catch (error) {
    console.error('❌ Export failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
