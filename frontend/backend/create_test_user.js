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

async function createTestUser() {
    console.log('Creating a test admin user directly in the database...\n');
    
    // Create a test user with a known UUID
    const userId = '11111111-1111-1111-1111-111111111111'; // Using a placeholder UUID
    const email = 'admin@yvi-ews.com';
    const role = 'ADMIN';
    
    try {
        console.log('Attempting to create test admin user...');
        
        // Try to insert into users table
        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert([{
                id: userId,
                email: email,
                role: role
            }])
            .select()
            .single();
            
        if (userError) {
            // Check if it's a duplicate key error (user already exists)
            if (userError.code === '23505' || userError.message.includes('duplicate key')) {
                console.log('User already exists in users table, updating role...');
                const { data: updateData, error: updateError } = await supabase
                    .from('users')
                    .update({ role: role })
                    .eq('email', email)
                    .select()
                    .single();
                    
                if (updateError) {
                    console.error('Error updating user role:', updateError.message);
                } else {
                    console.log('✅ User role updated to ADMIN in users table');
                }
            } else {
                console.error('Error inserting into users table:', userError.message);
                process.exit(1);
            }
        } else {
            console.log('✅ User created in users table');
        }
        
        // Try to insert into employees table
        const { data: empData, error: empError } = await supabase
            .from('employees')
            .insert([{
                user_id: userId,
                first_name: 'System',
                last_name: 'Admin',
                role: role,
                status: 'ACTIVE',
                email: email
            }])
            .select()
            .single();
            
        if (empError) {
            // Check if it's a duplicate key error (employee already exists)
            if (empError.code === '23505' || empError.message.includes('duplicate key')) {
                console.log('Employee record already exists, updating role...');
                const { error: updateError } = await supabase
                    .from('employees')
                    .update({ role: role })
                    .eq('email', email);
                    
                if (updateError) {
                    console.error('Error updating employee role:', updateError.message);
                } else {
                    console.log('✅ Employee role updated to ADMIN');
                }
            } else {
                console.error('Error inserting into employees table:', empError.message);
                // Rollback: remove the user record
                await supabase.from('users').delete().eq('id', userId);
                process.exit(1);
            }
        } else {
            console.log('✅ Employee created in employees table');
        }
        
        console.log('\nTest admin user setup completed!');
        console.log('You can now try logging in with:');
        console.log('- Email: admin@yvi-ews.com');
        console.log('- Password: (any valid password - will need to set up in Supabase Auth)');
        
    } catch (error) {
        console.error('Error during test user setup:', error.message);
        process.exit(1);
    }
}

createTestUser();