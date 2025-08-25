import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function enablePatientNotifications() {
  console.log('🔔 Enabling patient notifications for caregiver schedules...');
  
  try {
    // Enable patient notifications for caregiver schedules
    await prisma.adminSettings.upsert({
      where: { key: 'notify_patients_of_caregiver_schedules' },
      update: { value: 'true' },
      create: {
        key: 'notify_patients_of_caregiver_schedules',
        value: 'true',
        description: 'Send in-app notifications to patients when caregivers create schedules',
        category: 'notifications',
        isEditable: true,
      },
    });

    // Also enable caregiver proactive scheduling if not already set
    await prisma.adminSettings.upsert({
      where: { key: 'caregivers_can_schedule_proactively' },
      update: { value: 'true' },
      create: {
        key: 'caregivers_can_schedule_proactively',
        value: 'true',
        description: 'Allow caregivers to create schedules proactively',
        category: 'scheduling',
        isEditable: true,
      },
    });

    // Set schedule approval requirement (optional)
    await prisma.adminSettings.upsert({
      where: { key: 'caregiver_schedules_require_approval' },
      update: {},
      create: {
        key: 'caregiver_schedules_require_approval',
        value: 'false',
        description: 'Require admin approval for caregiver-created schedules',
        category: 'scheduling',
        isEditable: true,
      },
    });

    console.log('✅ Patient notifications enabled successfully!');
    console.log('📋 Admin settings configured:');
    console.log('   - notify_patients_of_caregiver_schedules: true');
    console.log('   - caregivers_can_schedule_proactively: true');
    console.log('   - caregiver_schedules_require_approval: false');
    console.log('');
    console.log('🔧 You can manage these settings in the admin panel at /admin/settings');
    
  } catch (error) {
    console.error('❌ Error enabling patient notifications:', error);
  } finally {
    await prisma.$disconnect();
  }
}

enablePatientNotifications();
