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

async function checkAdminUser() {
    const email = 'admin3@yvi-ews.com';
    const password = 'AdminPassword123!';

    console.log(`Checking admin user: ${email}`);
    console.log('---');

    try {
        // First, try to authenticate with Supabase directly
        console.log('1. Testing direct Supabase authentication...');
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (signInError) {
            console.log('❌ Supabase authentication failed:', signInError.message);
            console.log('   This means the user does not exist in Supabase Auth or password is wrong');
        } else {
            console.log('✅ Supabase authentication successful!');
            console.log('   User ID from auth:', signInData.user.id);
            console.log('   Access token available');
        }

        // Check if user exists in our users table
        console.log('\n2. Checking users table...');
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (userError) {
            console.log('❌ No user found in users table:', userError.message);
        } else {
            console.log('✅ Found user in users table:');
            console.log('   ID:', userData.id);
            console.log('   Email:', userData.email);
            console.log('   Role:', userData.role);
        }

        // Check if employee exists in employees table
        console.log('\n3. Checking employees table...');
        const userIdToCheck = signInData?.user?.id || userData?.id;
        if (userIdToCheck) {
            const { data: empData, error: empError } = await supabase
                .from('employees')
                .select('*')
                .eq('user_id', userIdToCheck)
                .single();

            if (empError) {
                console.log('❌ No employee found in employees table for user_id:', userIdToCheck);
                console.log('   Error:', empError.message);
                
                // Let's check if there's an employee with the user's email instead
                console.log('\n   Checking if employee exists by searching for the email in the system...');
                const { data: allEmployees, error: allEmpError } = await supabase
                    .from('employees')
                    .select('*');
                    
                if (!allEmpError && allEmployees) {
                    const matchingEmp = allEmployees.find(emp => 
                        emp.first_name === 'Admin' && emp.last_name === 'User'
                    );
                    if (matchingEmp) {
                        console.log('   Found matching employee record:');
                        console.log('   Employee ID:', matchingEmp.id);
                        console.log('   User ID:', matchingEmp.user_id);
                        console.log('   Name:', matchingEmp.first_name, matchingEmp.last_name);
                        console.log('   Role:', matchingEmp.role);
                    }
                }
            } else {
                console.log('✅ Found employee in employees table:');
                console.log('   ID:', empData.id);
                console.log('   User ID:', empData.user_id);
                console.log('   Name:', empData.first_name, empData.last_name);
                console.log('   Role:', empData.role);
            }
        } else {
            console.log('   Cannot check employees table - no user ID available from auth or users table');
        }

        console.log('\n--- Summary ---');
        if (signInError) {
            console.log('🔴 USER CREATION ISSUE DETECTED!');
            console.log('   The user exists in your database tables but NOT in Supabase Auth.');
            console.log('   This is why login is failing with 403 Forbidden.');
            console.log('   You need to create the user in Supabase Auth first.');
        } else {
            console.log('✅ User exists in Supabase Auth');
        }

    } catch (error) {
        console.error('Error during admin user check:', error.message);
    }
}

checkAdminUser().then(() => {
    console.log('\nAdmin user check completed.');
    process.exit(0);
});