// Test script to verify patient data synchronization
const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

// Mock session cookie for testing (you'll need to get this from browser)
const sessionCookie = 'your-session-cookie-here';

async function testGetMockPatient() {
  console.log('Testing GET mock patient data...');
  
  try {
    const response = await fetch(`${BASE_URL}/api/patients/HP12345`, {
      method: 'GET',
      headers: {
        'Cookie': sessionCookie,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('GET Response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error in GET test:', error);
  }
}

async function testUpdateMockPatient() {
  console.log('\nTesting PUT mock patient data...');
  
  const updateData = {
    personalInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@updated.com',
      phone: '+1-555-123-4567',
      dateOfBirth: '1985-06-15',
      gender: 'Male',
      address: '123 Updated St, New York, NY 10001',
      emergencyContact: {
        name: 'Jane Doe',
        phone: '+1-555-987-6543',
        relationship: 'Spouse'
      },
      bloodType: 'O+'
    },
    medicalHistory: {
      conditions: [
        {
          name: 'Hypertension',
          diagnosedDate: '2020-03-15',
          severity: 'Moderate',
          status: 'Active',
          doctor: 'Dr. Smith',
          notes: 'Well controlled with medication'
        },
        {
          name: 'Test Condition Added',
          diagnosedDate: '2024-12-01',
          severity: 'Mild',
          status: 'Active',
          doctor: 'Dr. Test',
          notes: 'Added via test'
        }
      ],
      allergies: [
        {
          name: 'Penicillin',
          severity: 'Severe',
          reaction: 'Anaphylaxis',
          dateIdentified: '2010-05-20'
        }
      ],
      medications: [
        {
          name: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          prescribedBy: 'Dr. Smith',
          startDate: '2020-03-15',
          status: 'Active'
        }
      ],
      immunizations: [],
      procedures: [],
      labResults: [],
      vitalSigns: []
    }
  };
  
  try {
    const response = await fetch(`${BASE_URL}/api/patients/HP12345`, {
      method: 'PUT',
      headers: {
        'Cookie': sessionCookie,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });
    
    const data = await response.json();
    console.log('PUT Response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error in PUT test:', error);
  }
}

async function testPatientPortalAPIs() {
  console.log('\nTesting patient portal APIs...');
  
  const apis = [
    '/api/patients/dashboard',
    '/api/patients/medical-history',
    '/api/patients/medications',
    '/api/patients/vitals',
    '/api/patients/visits',
    '/api/patients/documents',
    '/api/patients/health-overview',
    '/api/patients/profile'
  ];
  
  for (const api of apis) {
    try {
      console.log(`Testing ${api}...`);
      const response = await fetch(`${BASE_URL}${api}`, {
        method: 'GET',
        headers: {
          'Cookie': sessionCookie,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log(`${api} Response:`, {
        success: data.success,
        dataKeys: Object.keys(data.data || {})
      });
    } catch (error) {
      console.error(`Error testing ${api}:`, error);
    }
  }
}

async function runTests() {
  console.log('=== Patient Data Synchronization Test ===\n');
  
  // Test 1: Get current data
  const initialData = await testGetMockPatient();
  
  // Test 2: Update data
  const updatedData = await testUpdateMockPatient();
  
  // Test 3: Verify all patient portal APIs return updated data
  await testPatientPortalAPIs();
  
  console.log('\n=== Test Complete ===');
}

// Run tests if this script is executed directly
if (require.main === module) {
  console.log('Note: You need to set a valid session cookie to run these tests.');
  console.log('Get the session cookie from your browser developer tools after logging in.');
  // runTests();
}

module.exports = { testGetMockPatient, testUpdateMockPatient, testPatientPortalAPIs };
