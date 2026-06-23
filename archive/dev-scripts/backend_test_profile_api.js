const { supabase } = require('@lib/supabase');

async function testProfileAPI() {
    console.log('Testing Profile API endpoints...');
    
    // First, let's test with a valid user token
    // You'll need to provide a valid JWT token for testing
    const token = process.env.TEST_USER_TOKEN; // Set this in your environment
    
    if (!token) {
        console.log('Please set TEST_USER_TOKEN environment variable with a valid JWT token');
        console.log('You can get this from the login response when you log in with a test user');
        return;
    }
    
    // Set the token in the Supabase client
    supabase.auth.setAuth(token);
    
    try {
        console.log('\n1. Testing GET /profile endpoint...');
        const { data: profile, error: getError } = await supabase
            .from('employees')
            .select('*, department:departments!employees_department_id_fkey(*)')
            .eq('user_id', 'auth.uid()') // This would be handled by RLS in the actual API
            .single();
        
        if (getError) {
            console.log('Error fetching profile:', getError.message);
        } else {
            console.log('Profile data:', profile);
        }
        
        console.log('\n2. Testing PUT /profile endpoint...');
        // Update some profile fields (only allowed fields)
        const updateData = {
            first_name: 'Updated',
            last_name: 'Profile',
            phone: '555-1234',
            updated_at: new Date().toISOString()
        };
        
        const { data: updatedProfile, error: updateError } = await supabase
            .from('employees')
            .update(updateData)
            .eq('user_id', 'auth.uid()') // This would be handled by RLS in the actual API
            .select()
            .single();
            
        if (updateError) {
            console.log('Error updating profile:', updateError.message);
        } else {
            console.log('Updated profile:', updatedProfile);
        }
        
        console.log('\n✅ Profile API test completed');
        
    } catch (error) {
        console.error('Error during profile API test:', error.message);
    }
}

// Test the backend API endpoints using fetch
async function testBackendEndpoints() {
    console.log('\nTesting Backend API endpoints...');
    
    const token = process.env.TEST_USER_TOKEN;
    if (!token) {
        console.log('Please set TEST_USER_TOKEN environment variable');
        return;
    }
    
    try {
        // Test GET /api/employees/profile
        console.log('\n1. Testing GET /api/employees/profile...');
        const getResponse = await fetch('http://localhost:3002/api/employees/profile', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        const getProfileData = await getResponse.json();
        console.log('GET /profile response:', getProfileData);
        
        // Test PUT /api/employees/profile
        console.log('\n2. Testing PUT /api/employees/profile...');
        const putResponse = await fetch('http://localhost:3002/api/employees/profile', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName: 'Test',
                lastName: 'User',
                phone: '555-9999'
            })
        });
        
        const putProfileData = await putResponse.json();
        console.log('PUT /profile response:', putProfileData);
        
    } catch (error) {
        console.error('Error testing backend endpoints:', error.message);
    }
}

if (require.main === module) {
    testProfileAPI().then(() => {
        testBackendEndpoints();
    });
}

module.exports = {
    testProfileAPI,
    testBackendEndpoints
};
