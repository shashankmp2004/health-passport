// Test script for file upload functionality
const fs = require('fs');
const path = require('path');

async function testFileUpload() {
  try {
    // First, let's login as a patient to get a session
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'john.doe@example.com',
        password: 'password123',
        role: 'patient'
      }),
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed, response:', await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Login successful:', loginData);

    // Create a test file buffer (simulate a small text file)
    const testFileContent = 'This is a test medical document\nPatient: John Doe\nDate: 2025-07-04';
    const testFileBuffer = Buffer.from(testFileContent, 'utf-8');

    // Create FormData for file upload
    const formData = new FormData();
    
    // Create a File object from the buffer
    const testFile = new File([testFileBuffer], 'test-medical-record.txt', {
      type: 'text/plain'
    });

    formData.append('file', testFile);
    formData.append('documentType', 'medical-record');
    formData.append('category', 'general');
    formData.append('description', 'Test medical document upload');
    formData.append('tags', 'test,medical,record');
    formData.append('isPublic', 'false');

    // Test file upload (this might fail due to session/auth issues in Node.js)
    console.log('🔄 Testing file upload...');
    
    // Since we're running in Node.js, the session won't work the same way
    // Let's just test that our endpoint responds properly
    const uploadResponse = await fetch('http://localhost:3001/api/upload', {
      method: 'POST',
      body: formData,
    });

    const uploadResult = await uploadResponse.text();
    console.log('📤 Upload response status:', uploadResponse.status);
    console.log('📤 Upload response:', uploadResult);

  } catch (error) {
    console.error('❌ Test error:', error);
  }
}

// Run the test
testFileUpload();
