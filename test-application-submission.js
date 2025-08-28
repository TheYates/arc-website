// Simple test to verify application submission endpoint
const testApplicationSubmission = async () => {
  const testData = {
    firstName: "John",
    lastName: "Doe", 
    email: "john.doe@example.com",
    phone: "+1234567890",
    serviceId: "test-service-id",
    serviceName: "Test Service",
    address: "123 Test Street",
    startDate: "2024-01-01",
    duration: "6 months",
    careNeeds: "Basic care assistance",
    preferredContact: "email",
    selectedOptionalFeatures: []
  };

  try {
    const response = await fetch('http://localhost:3000/api/patient/application', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Application submission successful!');
      console.log('Response:', result);
    } else {
      console.log('❌ Application submission failed:');
      console.log('Error:', result);
    }
  } catch (error) {
    console.error('❌ Network error:', error.message);
  }
};

// Run the test if this file is executed directly
if (typeof window === 'undefined') {
  // This is running in Node.js
  const fetch = require('node-fetch');
  testApplicationSubmission();
} else {
  // This is running in browser
  console.log('Test function available: testApplicationSubmission()');
  window.testApplicationSubmission = testApplicationSubmission;
}