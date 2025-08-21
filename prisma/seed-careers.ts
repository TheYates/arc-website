import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedCareers() {
  console.log("🌱 Seeding careers data...");

  // Create job categories
  const healthcareCategory = await prisma.jobCategory.upsert({
    where: { name: "Healthcare" },
    update: {},
    create: {
      name: "Healthcare",
      description: "Healthcare and medical related positions",
    },
  });

  const childcareCategory = await prisma.jobCategory.upsert({
    where: { name: "Childcare" },
    update: {},
    create: {
      name: "Childcare",
      description: "Childcare and nanny related positions",
    },
  });

  const adminCategory = await prisma.jobCategory.upsert({
    where: { name: "Administrative" },
    update: {},
    create: {
      name: "Administrative",
      description: "Administrative and office related positions",
    },
  });

  // Get or create admin user
  let adminUser = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (!adminUser) {
    adminUser = await prisma.user.create({
      data: {
        email: "admin@arccare.com",
        username: "admin",
        passwordHash: "temp-hash", // This will be updated when admin logs in
        firstName: "Admin",
        lastName: "User",
        role: "ADMIN",
        isActive: true,
      },
    });
  }

  // Create job positions
  const nursePosition = await prisma.jobPosition.upsert({
    where: { id: "nurse-position-1" },
    update: {},
    create: {
      id: "nurse-position-1",
      title: "Registered Nurse",
      categoryId: healthcareCategory.id,
      description:
        "We are seeking a compassionate and skilled Registered Nurse to join our healthcare team. The ideal candidate will provide high-quality patient care and work collaboratively with our medical staff.",
      requirements: [
        "Valid RN license",
        "2+ years of clinical experience",
        "Strong communication skills",
        "Ability to work in fast-paced environment",
        "CPR certification required",
      ],
      responsibilities: [
        "Provide direct patient care",
        "Administer medications",
        "Monitor patient vital signs",
        "Collaborate with healthcare team",
        "Maintain accurate patient records",
      ],
      location: "Accra, Ghana",
      employmentType: "FULL_TIME",
      status: "ACTIVE",
      isRemote: false,
      experienceLevel: "MID_LEVEL",
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      createdById: adminUser.id,
    },
  });

  const nannyPosition = await prisma.jobPosition.upsert({
    where: { id: "nanny-position-1" },
    update: {},
    create: {
      id: "nanny-position-1",
      title: "Professional Nanny",
      categoryId: childcareCategory.id,
      description:
        "Join our team as a Professional Nanny and make a positive impact on children's lives. We're looking for someone passionate about child development and safety.",
      requirements: [
        "Diploma in Early Childhood Education",
        "Experience working with children",
        "First Aid certification",
        "Background check clearance",
        "Excellent references",
      ],
      responsibilities: [
        "Supervise and care for children",
        "Plan educational activities",
        "Ensure child safety at all times",
        "Communicate with parents",
        "Maintain clean environment",
      ],
      location: "Kumasi, Ghana",
      employmentType: "PART_TIME",
      status: "ACTIVE",
      isRemote: false,
      experienceLevel: "ENTRY_LEVEL",
      applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
      createdById: adminUser.id,
    },
  });

  const caregiverPosition = await prisma.jobPosition.upsert({
    where: { id: "caregiver-position-1" },
    update: {},
    create: {
      id: "caregiver-position-1",
      title: "Live-in Caregiver",
      categoryId: healthcareCategory.id,
      description:
        "Provide comprehensive 24/7 home care services to families in need. Work closely with families to ensure comfort and quality care.",
      requirements: [
        "Nursing certification or equivalent",
        "2+ years caregiving experience",
        "Excellent communication skills",
        "Compassionate nature",
        "Physical fitness for demanding work",
      ],
      responsibilities: [
        "Provide personal care assistance",
        "Medication management",
        "Meal preparation",
        "Light housekeeping",
        "Companionship and emotional support",
      ],
      location: "Greater Accra Region",
      employmentType: "FULL_TIME",
      status: "ACTIVE",
      isRemote: false,
      experienceLevel: "MID_LEVEL",
      applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days from now
      createdById: adminUser.id,
    },
  });

  const adminAssistantPosition = await prisma.jobPosition.upsert({
    where: { id: "admin-assistant-1" },
    update: {},
    create: {
      id: "admin-assistant-1",
      title: "Administrative Assistant",
      categoryId: adminCategory.id,
      description:
        "Support our administrative operations with excellent organizational skills and attention to detail.",
      requirements: [
        "High school diploma or equivalent",
        "Proficiency in Microsoft Office",
        "Strong organizational skills",
        "Excellent written and verbal communication",
        "Previous administrative experience preferred",
      ],
      responsibilities: [
        "Manage office communications",
        "Schedule appointments",
        "Maintain filing systems",
        "Assist with data entry",
        "Support various departments as needed",
      ],
      location: "Accra, Ghana",
      employmentType: "FULL_TIME",
      status: "ACTIVE",
      isRemote: true,
      experienceLevel: "ENTRY_LEVEL",
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdById: adminUser.id,
    },
  });

  console.log("✅ Careers data seeded successfully!");
  console.log(`Created ${await prisma.jobCategory.count()} job categories`);
  console.log(`Created ${await prisma.jobPosition.count()} job positions`);
}

export { seedCareers };

if (require.main === module) {
  seedCareers()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
