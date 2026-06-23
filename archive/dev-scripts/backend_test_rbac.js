const axios = require('axios');

// Test the RBAC implementation
const BASE_URL = 'http://localhost:3002/api';

async function testRBAC() {
  console.log('Testing RBAC Implementation...\n');
  
  try {
    // Test 1: Try to access a protected route without authentication
    console.log('Test 1: Accessing protected route without auth...');
    try {
      const response = await axios.get(`${BASE_URL}/auth/me`);
      console.log('❌ Unexpected: Should have failed without auth');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Correct: Unauthorized access denied');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    // Test 2: Try to create a user without admin privileges
    console.log('\nTest 2: Creating user without admin privileges...');
    try {
      const response = await axios.post(`${BASE_URL}/auth/admin/users`, {
        email: 'test@example.com',
        role: 'EMPLOYEE'
      });
      console.log('❌ Unexpected: Should have failed without admin role');
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.log('✅ Correct: Admin-only endpoint requires authentication');
      } else if (error.response && error.response.status === 403) {
        console.log('✅ Correct: Admin-only endpoint requires admin role');
      } else {
        console.log('❌ Unexpected error:', error.message);
      }
    }

    console.log('\nRBAC tests completed.');
    
  } catch (error) {
    console.error('Error during testing:', error.message);
  }
}

// Run the tests
testRBAC();
