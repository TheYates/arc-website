import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedServiceSystem() {
  console.log("🌱 Seeding service request and scheduling system...");

  try {
    // Seed admin settings
    const adminSettings = [
      {
        key: "service_requests_require_approval",
        value: "false",
        description: "Whether service requests require approval before caregivers can see them",
        category: "service_requests",
      },
      {
        key: "caregivers_can_schedule_proactively",
        value: "true",
        description: "Whether caregivers can create schedules without patient requests",
        category: "scheduling",
      },
      {
        key: "caregiver_schedules_require_approval",
        value: "false",
        description: "Whether caregiver schedules require approval from reviewers/admins",
        category: "scheduling",
      },
      {
        key: "reviewers_can_modify_schedules",
        value: "false",
        description: "Whether reviewers can modify caregiver schedules",
        category: "scheduling",
      },
      {
        key: "notify_patients_of_caregiver_schedules",
        value: "true",
        description: "Whether to notify patients when caregivers schedule visits",
        category: "notifications",
      },
      {
        key: "auto_complete_service_requests_after_hours",
        value: "24",
        description: "Automatically mark service requests as completed after X hours (0 to disable)",
        category: "service_requests",
      },
      {
        key: "max_service_requests_per_day",
        value: "5",
        description: "Maximum number of service requests a patient can make per day (0 for unlimited)",
        category: "service_requests",
      },
      {
        key: "schedule_reminder_hours_before",
        value: "2",
        description: "Send schedule reminders X hours before the scheduled time",
        category: "notifications",
      },
    ];

    for (const setting of adminSettings) {
      await prisma.adminSettings.upsert({
        where: { key: setting.key },
        update: {},
        create: setting,
      });
    }

    console.log("✅ Admin settings seeded");

    // Seed common service types
    const serviceTypes = [
      {
        name: "Wound Dressing",
        description: "Professional wound care and dressing changes",
        category: "medical_care",
      },
      {
        name: "Medication Administration",
        description: "Assistance with taking prescribed medications",
        category: "medication",
      },
      {
        name: "Vital Signs Check",
        description: "Monitoring blood pressure, temperature, pulse, and other vital signs",
        category: "monitoring",
      },
      {
        name: "Physical Therapy",
        description: "Therapeutic exercises and mobility assistance",
        category: "therapy",
      },
      {
        name: "Blood Sugar Monitoring",
        description: "Checking and recording blood glucose levels",
        category: "monitoring",
      },
      {
        name: "Injection Administration",
        description: "Administering prescribed injections (insulin, vaccines, etc.)",
        category: "medication",
      },
      {
        name: "Catheter Care",
        description: "Maintenance and care of urinary catheters",
        category: "medical_care",
      },
      {
        name: "Mobility Assistance",
        description: "Help with walking, transferring, and movement",
        category: "assistance",
      },
      {
        name: "Personal Hygiene",
        description: "Assistance with bathing, grooming, and personal care",
        category: "assistance",
      },
      {
        name: "Meal Preparation",
        description: "Preparing meals according to dietary requirements",
        category: "assistance",
      },
      {
        name: "Medication Reminder",
        description: "Reminding patient to take medications on schedule",
        category: "medication",
      },
      {
        name: "Respiratory Therapy",
        description: "Breathing exercises and respiratory care",
        category: "therapy",
      },
      {
        name: "Skin Care",
        description: "Moisturizing, pressure sore prevention, and skin assessment",
        category: "medical_care",
      },
      {
        name: "Emergency Response",
        description: "Immediate assistance for medical emergencies",
        category: "emergency",
      },
      {
        name: "Companionship",
        description: "Social interaction and emotional support",
        category: "support",
      },
      {
        name: "Transportation",
        description: "Assistance with medical appointments and errands",
        category: "assistance",
      },
      {
        name: "Equipment Maintenance",
        description: "Checking and maintaining medical equipment",
        category: "equipment",
      },
      {
        name: "Fall Prevention Assessment",
        description: "Evaluating and reducing fall risks in the home",
        category: "safety",
      },
      {
        name: "Nutrition Counseling",
        description: "Guidance on healthy eating and dietary compliance",
        category: "education",
      },
      {
        name: "Exercise Supervision",
        description: "Supervised physical activity and exercise routines",
        category: "therapy",
      },
    ];

    for (const serviceType of serviceTypes) {
      await prisma.serviceType.upsert({
        where: { name: serviceType.name },
        update: {},
        create: serviceType,
      });
    }

    console.log("✅ Service types seeded");

    console.log("🎉 Service system seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding service system:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedServiceSystem()
    .then(() => {
      console.log("Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}

export { seedServiceSystem };
