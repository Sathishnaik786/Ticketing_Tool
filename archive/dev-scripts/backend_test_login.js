const axios = require('axios');

// Test the login functionality
const BASE_URL = 'http://localhost:3002/api';

async function testLogin() {
    console.log('Testing login functionality...\n');
    
    try {
        // Test 1: Try to login with admin credentials
        console.log('Test 1: Logging in with admin credentials...');
        try {
            const response = await axios.post(`${BASE_URL}/auth/login`, {
                email: 'admin3@yvi-ews.com',
                password: 'AdminPassword123!'
            });
            
            if (response.data.token) {
                console.log('✅ Login successful!');
                console.log('User data:', {
                    id: response.data.user.id,
                    email: response.data.user.email,
                    role: response.data.user.role,
                    employeeId: response.data.user.employeeId,
                    firstName: response.data.user.firstName,
                    lastName: response.data.user.lastName
                });
                
                // Test 2: Try to access protected endpoint with token
                console.log('\nTest 2: Accessing protected /me endpoint...');
                const meResponse = await axios.get(`${BASE_URL}/auth/me`, {
                    headers: {
                        'Authorization': `Bearer ${response.data.token}`
                    }
                });
                
                if (meResponse.data.success) {
                    console.log('✅ /me endpoint access successful');
                    console.log('User info from /me:', meResponse.data.data.user);
                } else {
                    console.log('❌ /me endpoint access failed');
                }
                
                // Test 3: Try to create a user (should work for admin)
                console.log('\nTest 3: Creating a user (admin only)...');
                const createUserResponse = await axios.post(`${BASE_URL}/auth/admin/users`, {
                    email: 'testuser@yvi-ews.com',
                    role: 'EMPLOYEE',
                    firstName: 'Test',
                    lastName: 'User'
                }, {
                    headers: {
                        'Authorization': `Bearer ${response.data.data.accessToken}`
                    }
                });
                
                if (createUserResponse.data.success) {
                    console.log('✅ User creation successful');
                    console.log('Created user:', createUserResponse.data.data);
                } else {
                    console.log('❌ User creation failed:', createUserResponse.data.message);
                }
                
            } else {
                console.log('❌ Login failed:', response.data.message);
            }
        } catch (loginError) {
            if (loginError.response) {
                console.log('❌ Login failed with status:', loginError.response.status);
                console.log('Error message:', loginError.response.data?.message || loginError.response.data);
            } else {
                console.log('❌ Login failed with network error:', loginError.message);
            }
        }
        
        // Test 4: Try to login with invalid credentials
        console.log('\nTest 4: Logging in with invalid credentials...');
        try {
            const invalidResponse = await axios.post(`${BASE_URL}/auth/login`, {
                email: 'invalid@user.com',
                password: 'wrongpassword'
            });
            
            console.log('❌ Expected login to fail but it succeeded');
        } catch (invalidError) {
            if (invalidError.response && invalidError.response.status === 401) {
                console.log('✅ Correctly rejected invalid credentials');
            } else {
                console.log('❌ Unexpected response for invalid credentials:', invalidError.response?.status);
            }
        }
        
    } catch (error) {
        console.error('Error during login tests:', error.message);
        if (error.code === 'ECONNREFUSED') {
            console.error('Backend server might not be running. Please start it with:');
            console.error('cd backend && npm start');
        }
    }
    
    console.log('\nLogin testing completed.');
}

// Run the tests
testLogin();
