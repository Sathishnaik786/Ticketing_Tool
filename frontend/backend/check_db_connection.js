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

async function checkDatabase() {
    console.log('Checking database connection and tables...\n');

    try {
        // Test basic connection by querying the users table
        const { data, error } = await supabase
            .from('users')
            .select('id, email, role')
            .limit(1);

        if (error) {
            console.error('Error querying users table:', error.message);
            console.log('\nThis suggests that either:');
            console.log('1. The users table does not exist in your Supabase database');
            console.log('2. Your service role key does not have proper permissions');
            console.log('3. The database schema has not been applied to your Supabase project');
        } else {
            console.log('✅ Successfully connected to users table');
            console.log('Sample user data (if any):', data);
        }

        // Test employees table
        const { data: empData, error: empError } = await supabase
            .from('employees')
            .select('id, first_name, last_name, role')
            .limit(1);

        if (empError) {
            console.error('Error querying employees table:', empError.message);
        } else {
            console.log('✅ Successfully connected to employees table');
            console.log('Sample employee data (if any):', empData);
        }

        // Test if auth system is working
        try {
            const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
            
            if (authError) {
                console.error('Error accessing auth system:', authError.message);
            } else {
                console.log(`✅ Successfully accessed auth system, found ${users.length} users`);
            }
        } catch (authErr) {
            console.error('Error with auth system access:', authErr.message);
        }

    } catch (error) {
        console.error('General database connection error:', error.message);
    }
}

checkDatabase().then(() => {
    console.log('\nDatabase check completed.');
    process.exit(0);
});