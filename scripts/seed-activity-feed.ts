import { prisma } from "../lib/database/postgresql";

async function seedActivityFeed() {
  try {
    console.log("🌱 Seeding activity feed data...");

    // Get some existing patients and users
    const patients = await prisma.patient.findMany({
      take: 3,
      include: {
        user: true
      }
    });

    const caregivers = await prisma.user.findMany({
      where: { role: "CAREGIVER" },
      take: 2
    });

    const reviewers = await prisma.user.findMany({
      where: { role: "REVIEWER" },
      take: 2
    });

    if (patients.length === 0 || caregivers.length === 0 || reviewers.length === 0) {
      console.log("❌ Not enough users/patients found. Please seed users and patients first.");
      return;
    }

    const activities = [];

    // Create sample activities for each patient
    for (const patient of patients) {
      const patientName = `${patient.user.firstName} ${patient.user.lastName}`;
      
      // Care note activities
      activities.push({
        type: "CARE_NOTE_CREATED",
        priority: "MEDIUM",
        title: "New Care Note Added",
        description: `A daily assessment care note has been added for ${patientName}`,
        patientId: patient.id,
        createdById: caregivers[0].id,
        metadata: { noteType: "daily_assessment" },
        createdAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000) // Random time in last 24h
      });

      // Medical review activities
      activities.push({
        type: "MEDICAL_REVIEW_CREATED",
        priority: "HIGH",
        title: "Medical Review Completed",
        description: `A routine medical review has been completed for ${patientName}`,
        patientId: patient.id,
        createdById: reviewers[0].id,
        metadata: { reviewType: "routine" },
        createdAt: new Date(Date.now() - Math.random() * 48 * 60 * 60 * 1000) // Random time in last 48h
      });

      // Medication prescribed
      activities.push({
        type: "MEDICATION_PRESCRIBED",
        priority: "HIGH",
        title: "New Medication Prescribed",
        description: `Lisinopril has been prescribed for ${patientName}`,
        patientId: patient.id,
        createdById: reviewers[0].id,
        metadata: { medicationName: "Lisinopril" },
        createdAt: new Date(Date.now() - Math.random() * 72 * 60 * 60 * 1000) // Random time in last 72h
      });

      // Medication administered
      activities.push({
        type: "MEDICATION_ADMINISTERED",
        priority: "MEDIUM",
        title: "Medication Administered",
        description: `Lisinopril (10mg) has been administered to ${patientName}`,
        patientId: patient.id,
        createdById: caregivers[0].id,
        metadata: { medicationName: "Lisinopril", dosage: "10mg" },
        createdAt: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000) // Random time in last 12h
      });

      // Vital signs recorded
      activities.push({
        type: "VITAL_SIGNS_RECORDED",
        priority: "MEDIUM",
        title: "Vital Signs Recorded",
        description: `New vital signs recorded for ${patientName}: Blood Pressure, Heart Rate, Temperature`,
        patientId: patient.id,
        createdById: caregivers[1] ? caregivers[1].id : caregivers[0].id,
        metadata: { vitalTypes: ["Blood Pressure", "Heart Rate", "Temperature"] },
        createdAt: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000) // Random time in last 6h
      });

      // Patient assignment (if we have multiple caregivers)
      if (caregivers.length > 1) {
        activities.push({
          type: "PATIENT_ASSIGNED",
          priority: "HIGH",
          title: "Patient Assignment",
          description: `${patientName} has been assigned to caregiver ${caregivers[1].firstName} ${caregivers[1].lastName}`,
          patientId: patient.id,
          createdById: caregivers[0].id, // Assigned by first caregiver (admin action)
          metadata: { 
            assigneeRole: "caregiver", 
            assigneeName: `${caregivers[1].firstName} ${caregivers[1].lastName}` 
          },
          createdAt: new Date(Date.now() - Math.random() * 168 * 60 * 60 * 1000) // Random time in last week
        });
      }
    }

    // Add some urgent alerts
    if (patients.length > 0) {
      activities.push({
        type: "URGENT_ALERT",
        priority: "URGENT",
        title: "Urgent Alert",
        description: `Urgent attention required for ${patients[0].user.firstName} ${patients[0].user.lastName}: Abnormal vital signs detected`,
        patientId: patients[0].id,
        createdById: caregivers[0].id,
        metadata: { alertReason: "Abnormal vital signs detected" },
        createdAt: new Date(Date.now() - Math.random() * 2 * 60 * 60 * 1000) // Random time in last 2h
      });
    }

    // Create all activities
    console.log(`📝 Creating ${activities.length} activity feed items...`);
    
    for (const activity of activities) {
      await prisma.activityFeed.create({
        data: activity
      });
    }

    console.log("✅ Activity feed seeding completed!");
    console.log(`📊 Created ${activities.length} activity items for ${patients.length} patients`);

  } catch (error) {
    console.error("❌ Error seeding activity feed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
if (require.main === module) {
  seedActivityFeed();
}

export { seedActivityFeed };
