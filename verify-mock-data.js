// Quick verification script to test the API endpoints
console.log('Testing patient data synchronization APIs...');

// Test mock data functions
const { getMockPatient, updateMockPatient, isMockPatient } = require('./lib/utils/mock-data.ts');

console.log('1. Testing mock data utility functions...');

// Test getMockPatient
try {
  const mockPatient = getMockPatient();
  console.log('✓ getMockPatient() works');
  console.log('  - Patient ID:', mockPatient.healthPassportId);
  console.log('  - Patient Name:', mockPatient.personalInfo.firstName, mockPatient.personalInfo.lastName);
  console.log('  - Email:', mockPatient.personalInfo.email);
} catch (error) {
  console.error('✗ getMockPatient() failed:', error.message);
}

// Test isMockPatient
try {
  const isHp12345Mock = isMockPatient('HP12345');
  const isOtherMock = isMockPatient('HP99999');
  console.log('✓ isMockPatient() works');
  console.log('  - HP12345 is mock:', isHp12345Mock);
  console.log('  - HP99999 is mock:', isOtherMock);
} catch (error) {
  console.error('✗ isMockPatient() failed:', error.message);
}

// Test updateMockPatient
try {
  const originalEmail = getMockPatient().personalInfo.email;
  
  const updatedPatient = updateMockPatient({
    personalInfo: {
      email: 'updated.test@email.com',
      phone: '+1-555-TEST-123'
    }
  });
  
  console.log('✓ updateMockPatient() works');
  console.log('  - Original email:', originalEmail);
  console.log('  - Updated email:', updatedPatient.personalInfo.email);
  console.log('  - Updated phone:', updatedPatient.personalInfo.phone);
  
  // Verify the change persisted
  const verifyPatient = getMockPatient();
  if (verifyPatient.personalInfo.email === 'updated.test@email.com') {
    console.log('✓ Mock data persistence works');
  } else {
    console.log('✗ Mock data persistence failed');
  }
} catch (error) {
  console.error('✗ updateMockPatient() failed:', error.message);
}

console.log('\n2. Mock data structure verification...');

try {
  const patient = getMockPatient();
  
  // Check required fields
  const requiredFields = [
    'healthPassportId',
    'personalInfo',
    'medicalHistory',
    'medications',
    'vitals',
    'visits',
    'documents'
  ];
  
  const missingFields = requiredFields.filter(field => !patient[field]);
  
  if (missingFields.length === 0) {
    console.log('✓ All required fields present');
  } else {
    console.log('✗ Missing fields:', missingFields);
  }
  
  // Check nested structures
  const requiredPersonalInfo = ['firstName', 'lastName', 'email', 'phone'];
  const missingPersonalInfo = requiredPersonalInfo.filter(field => !patient.personalInfo[field]);
  
  if (missingPersonalInfo.length === 0) {
    console.log('✓ All required personal info fields present');
  } else {
    console.log('✗ Missing personal info fields:', missingPersonalInfo);
  }
  
  const requiredMedicalHistory = ['conditions', 'allergies', 'medications', 'immunizations', 'procedures', 'labResults', 'vitalSigns'];
  const missingMedicalHistory = requiredMedicalHistory.filter(field => !Array.isArray(patient.medicalHistory[field]));
  
  if (missingMedicalHistory.length === 0) {
    console.log('✓ All required medical history arrays present');
  } else {
    console.log('✗ Missing medical history arrays:', missingMedicalHistory);
  }
  
} catch (error) {
  console.error('✗ Structure verification failed:', error.message);
}

console.log('\n3. Data consistency verification...');

try {
  const patient = getMockPatient();
  
  // Test adding new condition
  const newCondition = {
    name: 'Test Condition',
    diagnosedDate: new Date().toISOString().split('T')[0],
    severity: 'Mild',
    status: 'Active',
    doctor: 'Dr. Test',
    notes: 'Added for testing'
  };
  
  const updatedPatient = updateMockPatient({
    medicalHistory: {
      ...patient.medicalHistory,
      conditions: [...patient.medicalHistory.conditions, newCondition]
    }
  });
  
  if (updatedPatient.medicalHistory.conditions.length > patient.medicalHistory.conditions.length) {
    console.log('✓ Medical history update works');
    console.log('  - Conditions before:', patient.medicalHistory.conditions.length);
    console.log('  - Conditions after:', updatedPatient.medicalHistory.conditions.length);
  } else {
    console.log('✗ Medical history update failed');
  }
  
} catch (error) {
  console.error('✗ Data consistency verification failed:', error.message);
}

console.log('\nVerification complete!');
