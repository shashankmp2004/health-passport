#!/usr/bin/env node

// Simple Node.js script to test API endpoints
const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';

// Helper function to make HTTP requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testApiEndpoints() {
  console.log('Testing API endpoints...\n');
  
  // Test 1: Check if server is responding
  try {
    console.log('1. Testing server health...');
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/',
      method: 'GET',
      headers: {
        'User-Agent': 'Node.js Test Script'
      }
    });
    
    if (response.status === 200) {
      console.log('✓ Server is responding');
    } else {
      console.log('✗ Server response:', response.status);
    }
  } catch (error) {
    console.log('✗ Server not reachable:', error.message);
    return;
  }
  
  // Test 2: Check auth endpoint
  try {
    console.log('\n2. Testing auth session endpoint...');
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/session',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✓ Auth endpoint status:', response.status);
    console.log('  Session data:', response.data);
  } catch (error) {
    console.log('✗ Auth endpoint error:', error.message);
  }
  
  // Test 3: Try to access patient search without auth (should fail)
  try {
    console.log('\n3. Testing patient search without auth...');
    const response = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: '/api/patients/search?healthPassportId=HP12345',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 401) {
      console.log('✓ Patient search correctly requires authentication');
    } else {
      console.log('✗ Unexpected response:', response.status, response.data);
    }
  } catch (error) {
    console.log('✗ Patient search error:', error.message);
  }
  
  console.log('\nAPI testing complete!');
  console.log('\nTo fully test patient synchronization:');
  console.log('1. Open browser and login to hospital portal with: admin@cityhospital.com / adminpass123');
  console.log('2. Search for patient HP12345 and edit their information');
  console.log('3. Open another browser tab and login to patient portal with: HP12345 / test123');
  console.log('4. Verify changes appear in patient portal sections');
}

testApiEndpoints().catch(console.error);
