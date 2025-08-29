// Test script to verify medications API fix
// Run this in browser console on localhost:3000

async function testMedicationsAPI() {
  console.log("🧪 Testing Medications API...");

  const testData = {
    patientId: "test-patient-123",
    prescribedBy: "test-reviewer-456",
    medicationName: "Test Medication",
    dosage: "10mg",
    frequency: "twice_daily",
    route: "oral",
    instructions: "Take with food",
    priority: "medium",
    category: "other",
  };

  try {
    const response = await fetch("/api/medications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();

    if (response.ok) {
      console.log("✅ API Test Success:", result);
    } else {
      console.log("❌ API Test Failed:", result);
    }

    return result;
  } catch (error) {
    console.error("🚨 API Test Error:", error);
  }
}

// Call this function in browser console:
// testMedicationsAPI()
