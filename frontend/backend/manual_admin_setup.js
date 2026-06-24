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

async function setupAdminUser() {
    console.log('Setting up admin user manually...\n');

    // First, we need to create a user in Supabase Auth
    // This can only be done from the Supabase dashboard or using the auth admin API
    // For this manual setup, we'll assume you've created a user in the Supabase dashboard
    // with email: admin@yvi-ews.com and password: AdminPassword123!
    
    // Then we'll manually insert the corresponding records
    const adminEmail = 'admin@yvi-ews.com';
    const adminRole = 'ADMIN';
    
    try {
        // First, we need to get the user ID from auth.users
        // Since we can't create users from the API without proper auth setup,
        // we'll guide the user to create it in the dashboard first
        
        console.log('Please follow these steps to create an admin user:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Navigate to Authentication > Users');
        console.log('3. Click "New User"');
        console.log('4. Enter these details:');
        console.log('   - Email: admin@yvi-ews.com');
        console.log('   - Password: AdminPassword123!');
        console.log('   - Confirm password: AdminPassword123!');
        console.log('   - Do NOT require email confirmation');
        console.log('5. After creating the user, copy the User ID (UUID)');
        console.log('6. Run this script again with the user ID as an environment variable');
        console.log('');
        console.log('Alternatively, if you already have a user ID, set it as SUPABASE_ADMIN_USER_ID in your .env file');
        
        // Check if admin user ID is provided in environment
        const adminUserId = process.env.SUPABASE_ADMIN_USER_ID;
        
        if (!adminUserId) {
            console.log('\nNo admin user ID provided. Please follow the steps above.');
            process.exit(1);
        }
        
        console.log(`\nUsing admin user ID: ${adminUserId}`);
        
        // Check if user already exists in public.users table
        const { data: existingUser, error: userCheckError } = await supabase
            .from('users')
            .select('id')
            .eq('id', adminUserId)
            .single();
            
        if (existingUser) {
            console.log('User already exists in public.users table');
        } else {
            // Insert into public.users table
            const { data: userRecord, error: userError } = await supabase
                .from('users')
                .insert([{
                    id: adminUserId,
                    email: adminEmail,
                    role: adminRole
                }])
                .select()
                .single();
                
            if (userError) {
                console.error('Error inserting into users table:', userError.message);
                process.exit(1);
            }
            
            console.log('✅ User record created in public.users table');
        }
        
        // Check if employee record already exists
        const { data: existingEmployee, error: empCheckError } = await supabase
            .from('employees')
            .select('id')
            .eq('user_id', adminUserId)
            .single();
            
        if (existingEmployee) {
            console.log('Employee record already exists');
            // Update the role to ADMIN
            const { error: updateError } = await supabase
                .from('employees')
                .update({ role: adminRole })
                .eq('user_id', adminUserId);
                
            if (updateError) {
                console.error('Error updating employee role:', updateError.message);
            } else {
                console.log('✅ Employee role updated to ADMIN');
            }
        } else {
            // Insert into employees table
            const { data: employeeRecord, error: empError } = await supabase
                .from('employees')
                .insert([{
                    user_id: adminUserId,
                    first_name: 'System',
                    last_name: 'Admin',
                    role: adminRole,
                    status: 'ACTIVE',
                    email: adminEmail
                }])
                .select()
                .single();
                
            if (empError) {
                console.error('Error inserting into employees table:', empError.message);
                // Rollback: remove the user record
                await supabase.from('users').delete().eq('id', adminUserId);
                process.exit(1);
            }
            
            console.log('✅ Employee record created in employees table');
        }
        
        console.log('\n✅ Admin user setup completed successfully!');
        console.log('Admin credentials:');
        console.log('- Email: admin@yvi-ews.com');
        console.log('- Password: AdminPassword123!');
        console.log('- Role: ADMIN');
        
    } catch (error) {
        console.error('Error during admin setup:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

setupAdminUser().then(() => {
    console.log('\nAdmin setup process completed.');
    process.exit(0);
});