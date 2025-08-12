const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function testCareNotesAPI() {
  console.log("🧪 Testing Care Notes API...\n");

  try {
    // Test 1: Create a test patient and user if they don't exist
    console.log("1. Setting up test data...");

    // Create test user (caregiver)
    const testCaregiver = await prisma.user.upsert({
      where: { email: "test-caregiver@example.com" },
      update: {},
      create: {
        email: "test-caregiver@example.com",
        username: "test-caregiver",
        firstName: "Test",
        lastName: "Caregiver",
        role: "CAREGIVER",
        passwordHash: "test-hash",
        isEmailVerified: true,
      },
    });

    // Create test user (reviewer)
    const testReviewer = await prisma.user.upsert({
      where: { email: "test-reviewer@example.com" },
      update: {},
      create: {
        email: "test-reviewer@example.com",
        username: "test-reviewer",
        firstName: "Test",
        lastName: "Reviewer",
        role: "REVIEWER",
        passwordHash: "test-hash",
        isEmailVerified: true,
      },
    });

    // Create test patient user first
    const testPatientUser = await prisma.user.upsert({
      where: { email: "test-patient@example.com" },
      update: {},
      create: {
        email: "test-patient@example.com",
        username: "test-patient",
        firstName: "Test",
        lastName: "Patient",
        phone: "555-0123",
        role: "PATIENT",
        passwordHash: "test-hash",
        isEmailVerified: true,
      },
    });

    // Create test patient
    const testPatient = await prisma.patient.upsert({
      where: { userId: testPatientUser.id },
      update: {},
      create: {
        userId: testPatientUser.id,
        dateOfBirth: new Date("1990-01-01"),
        gender: "OTHER",
        status: "STABLE",
        careLevel: "MEDIUM",
      },
    });

    console.log("✅ Test data created");
    console.log(`   Caregiver ID: ${testCaregiver.id}`);
    console.log(`   Reviewer ID: ${testReviewer.id}`);
    console.log(`   Patient ID: ${testPatient.id}\n`);

    // Test 2: Create caregiver note
    console.log("2. Creating caregiver note...");
    const caregiverNote = await prisma.careNote.create({
      data: {
        patientId: testPatient.id,
        authorId: testCaregiver.id,
        noteType: "GENERAL",
        title: "Daily Care Observation",
        content:
          "Patient is responding well to treatment. Appetite has improved and mobility is better.",
        priority: "MEDIUM",
        status: "SUBMITTED",
        isPrivate: false,
        followUpRequired: false,
      },
    });
    console.log("✅ Caregiver note created:", caregiverNote.id);

    // Test 3: Create reviewer note
    console.log("3. Creating reviewer note...");
    const reviewerNote = await prisma.careNote.create({
      data: {
        patientId: testPatient.id,
        authorId: testReviewer.id,
        noteType: "GENERAL",
        title: "Medical Assessment",
        content:
          "Patient shows significant improvement. Recommend continuing current treatment plan.",
        priority: "HIGH",
        status: "SUBMITTED",
        isPrivate: false,
        followUpRequired: true,
        followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      },
    });
    console.log("✅ Reviewer note created:", reviewerNote.id);

    // Test 4: Fetch caregiver notes
    console.log("4. Fetching caregiver notes...");
    const caregiverNotes = await prisma.careNote.findMany({
      where: {
        patientId: testPatient.id,
        author: {
          role: { in: ["CAREGIVER", "SUPER_ADMIN"] },
        },
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    console.log(`✅ Found ${caregiverNotes.length} caregiver notes`);

    // Test 5: Fetch reviewer notes
    console.log("5. Fetching reviewer notes...");
    const reviewerNotes = await prisma.careNote.findMany({
      where: {
        patientId: testPatient.id,
        author: {
          role: "REVIEWER",
        },
      },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    console.log(`✅ Found ${reviewerNotes.length} reviewer notes`);

    // Test 6: Update a note
    console.log("6. Updating caregiver note...");
    const updatedNote = await prisma.careNote.update({
      where: { id: caregiverNote.id },
      data: {
        content:
          "Patient is responding well to treatment. Appetite has improved and mobility is better. Updated: Patient walked 50 meters today.",
        updatedAt: new Date(),
      },
    });
    console.log("✅ Note updated successfully");

    // Test 7: Test data transformation (similar to what the API does)
    console.log("7. Testing data transformation...");
    const allNotes = await prisma.careNote.findMany({
      where: { patientId: testPatient.id },
      include: {
        author: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const transformedNotes = allNotes.map((note) => ({
      id: note.id,
      patientId: note.patientId,
      authorId: note.authorId,
      authorName:
        note.author?.firstName && note.author?.lastName
          ? `${note.author.firstName} ${note.author.lastName}`
          : "Unknown Author",
      authorRole: note.author?.role === "REVIEWER" ? "reviewer" : "caregiver",
      noteType: note.noteType.toLowerCase(),
      title: note.title,
      content: note.content,
      priority: note.priority.toLowerCase(),
      status: note.status.toLowerCase(),
      tags: note.tags || [],
      isPrivate: note.isPrivate,
      followUpRequired: note.followUpRequired,
      followUpDate: note.followUpDate?.toISOString().split("T")[0],
      createdAt: note.createdAt.toISOString(),
      updatedAt: note.updatedAt.toISOString(),
    }));

    console.log("✅ Data transformation successful");
    console.log(`   Transformed ${transformedNotes.length} notes`);

    // Display summary
    console.log("\n📊 Test Summary:");
    console.log(`   Total notes created: ${allNotes.length}`);
    console.log(`   Caregiver notes: ${caregiverNotes.length}`);
    console.log(`   Reviewer notes: ${reviewerNotes.length}`);
    console.log("   All tests passed! ✅\n");

    // Cleanup (optional - comment out if you want to keep test data)
    console.log("🧹 Cleaning up test data...");
    await prisma.careNote.deleteMany({
      where: { patientId: testPatient.id },
    });
    console.log("✅ Test notes cleaned up");
  } catch (error) {
    console.error("❌ Test failed:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
if (require.main === module) {
  testCareNotesAPI()
    .then(() => {
      console.log("🎉 All care notes tests completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Test suite failed:", error);
      process.exit(1);
    });
}

module.exports = { testCareNotesAPI };
