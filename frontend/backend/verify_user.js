const { createClient } = require('@supabase/supabase-js');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase environment variables in .env file');
    console.error('Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});

async function verifyUser() {
    // Check the user you mentioned earlier: sathish@gmail.com with ID 5e304d70-0453-423f-9d9d-d6aae41f032c
    const email = 'sathish@gmail.com';
    const userId = '5e304d70-0453-423f-9d9d-d6aae41f032c';

    try {
        console.log(`Checking user: ${email} with ID: ${userId}`);
        
        // Check if user exists in Supabase Auth by ID
        try {
            const { data, error } = await supabase
                .from('auth.users')
                .select('*')
                .eq('id', userId)
                .single();
                
            if (error || !data) {
                console.log('✗ User does NOT exist in Supabase Auth');
                console.log('  This is the problem! The user exists in your app tables but not in Supabase Auth.');
            } else {
                console.log(`✓ User exists in Supabase Auth with email: ${data.email}`);
            }
        } catch (authError) {
            console.log(`✗ Error checking Supabase Auth: ${authError.message}`);
        }
        
        // Check if user exists in our users table
        const { data: userByEmail, error: userByEmailError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        
        if (userByEmailError || !userByEmail) {
            console.log('✗ No user found in users table by email');
        } else {
            console.log(`✓ Found user in users table by email with ID: ${userByEmail.id} and role: ${userByEmail.role}`);
        }
        
        // Check if user exists in employees table
        const { data: empByUserId, error: empByUserIdError } = await supabase
            .from('employees')
            .select('*')
            .eq('user_id', userId)  // Use the specific ID
            .limit(1)  // Just get one record
            .single();
        
        if (empByUserIdError || !empByUserId) {
            console.log('✗ No employee found in employees table by user_id');
        } else {
            console.log(`✓ Found employee in employees table by user_id with name: ${empByUserId.first_name} ${empByUserId.last_name}, role: ${empByUserId.role}`);
        }
        
        // Check if there are employee records for the user by email in users table
        if (userByEmail) {
            const { data: empByUsersId, error: empByUsersIdError } = await supabase
                .from('employees')
                .select('*')
                .eq('user_id', userByEmail.id)  // Use the ID from users table
                .single();
            
            if (empByUsersIdError || !empByUsersId) {
                console.log('✗ No employee found in employees table by user_id from users table');
            } else {
                console.log(`✓ Found employee in employees table by user_id from users table with name: ${empByUsersId.first_name} ${empByUsersId.last_name}, role: ${empByUsersId.role}`);
            }
        }
        
        console.log('\n--- Summary ---');
        console.log('For successful login, you need:');
        console.log('1. ✓ User in Supabase Auth (email: sathish@gmail.com)');
        console.log('2. ✓ User in your users table (role: ADMIN)');
        console.log('3. ✓ Employee in your employees table (role: ADMIN)');
        console.log('');
        console.log('Current status:');w
        console.log('- Supabase Auth: Check above');
        console.log('- Users table: Check above');
        console.log('- Employees table: Check above');
        
    } catch (error) {
        console.error('Error verifying user:', error.message);
    }
}

verifyUser().then(() => {
    console.log('\nUser verification completed.');
    process.exit(0);
});