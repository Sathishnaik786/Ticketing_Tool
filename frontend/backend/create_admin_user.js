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

async function createAdminUser() {
    const email = 'admin3@yvi-ews.com'; // Changed to a new email
    const password = 'AdminPassword123!'; // You can change this
    const firstName = 'Admin';
    const lastName = 'User';
    const role = 'ADMIN';

    try {
        console.log('Creating admin user...');

        // First, check if user already exists in Supabase Auth
        let authUser = null;
        try {
            const { data: userData } = await supabase.auth.admin.getUserByEmail(email);
            if (userData && userData.user) {
                authUser = userData.user;
                console.log('User already exists in Supabase Auth:', email);
            }
        } catch (e) {
            console.log('User does not exist in Supabase Auth, will create new user');
        }

        if (!authUser) {
            // Create user in Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true // Auto-confirm email
            });

            if (authError) {
                console.error('Error creating auth user:', authError.message);
                return;
            }

            authUser = authData.user;
            console.log('Auth user created successfully:', authUser.email);
        } else {
            console.log('Using existing auth user:', authUser.email);
        }

        // Check if user record exists in public.users table
        const { data: existingUser, error: userCheckError } = await supabase
            .from('users')
            .select('id')
            .eq('id', authUser.id)
            .single();
            
        if (!existingUser) {
            // Create user record in public.users table
            const { data: userRecord, error: userError } = await supabase
                .from('users')
                .insert([{
                    id: authUser.id,
                    email: authUser.email,
                    role: role
                }])
                .select()
                .single();
                
            if (userError) {
                console.error('Error creating user record:', userError);
                // Clean up: delete the auth user if user creation failed
                await supabase.auth.admin.deleteUser(authUser.id);
                return;
            }
            console.log('User record created successfully in public.users table');
        } else {
            console.log('User record already exists in public.users table');
        }
        
        // Check if employee record exists
        const { data: existingEmpData, error: existingEmpError } = await supabase
            .from('employees')
            .select('id')
            .eq('user_id', authUser.id)
            .single();

        if (!existingEmpData) {
            // Create employee record
            const { data: employeeData, error: empError } = await supabase
                .from('employees')
                .insert([{
                    user_id: authUser.id,
                    first_name: firstName,
                    last_name: lastName,
                    role: role,
                    status: 'ACTIVE'
                }])
                .select()
                .single();

            if (empError) {
                console.error('Error creating employee record:', empError);
                // Clean up: delete the user record if employee creation failed
                await supabase.from('users').delete().eq('id', authUser.id);
                await supabase.auth.admin.deleteUser(authUser.id);
                return;
            }
            console.log('Employee record created successfully');
        } else {
            console.log('Employee record already exists');
            // Update the role to ADMIN
            const { error: updateError } = await supabase
                .from('employees')
                .update({ role: role })
                .eq('user_id', authUser.id);
                
            if (updateError) {
                console.error('Error updating employee role:', updateError);
            } else {
                console.log('Employee role updated to ADMIN');
            }
        }

        console.log('Admin user setup completed successfully!');
        console.log('Email:', email);
        console.log('Password:', password); // You'll want to change this after first login
        console.log('Role:', role);
        
        console.log('\nPlease update your password after first login for security!');
    } catch (error) {
        console.error('Error creating admin user:', error.message);
    }
}

createAdminUser().then(() => {
    console.log('Admin user creation process completed.');
    process.exit(0);
});