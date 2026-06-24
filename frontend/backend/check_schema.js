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

async function checkSchema() {
    try {
        console.log('Checking employees table structure...');
        
        // Get the employees table structure
        const { data, error } = await supabase
            .from('employees')
            .select('*')
            .limit(1); // Just get one row to understand the structure

        if (error) {
            console.error('Error querying employees table:', error.message);
            console.error('Details:', error);
        } else {
            console.log('Employees table sample data structure:');
            console.log(Object.keys(data[0] || {}));
        }
        
        console.log('\nChecking users table structure...');
        
        // Get the users table structure
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .limit(1); // Just get one row to understand the structure

        if (userError) {
            console.error('Error querying users table:', userError.message);
            console.error('Details:', userError);
        } else {
            console.log('Users table sample data structure:');
            console.log(Object.keys(userData[0] || {}));
        }
        
    } catch (error) {
        console.error('Error checking schema:', error.message);
    }
}

checkSchema().then(() => {
    console.log('Schema check completed.');
    process.exit(0);
});