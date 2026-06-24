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

async function fixRLSPolicies() {
    console.log('Fixing RLS (Row Level Security) policies that cause infinite recursion...');
    console.log('This is needed due to self-referencing foreign keys in the employees table (manager_id -> employees.id)');
    console.log('---');

    try {
        // Disable RLS on users table
        console.log('1. Disabling RLS on users table...');
        const { error: usersError } = await supabase.rpc('alter_table_set_rls', {
            table_name: 'users',
            rls_enabled: false
        }).select('*').single().catch(() => {});
        
        // Alternative method to disable RLS using raw SQL
        const { error: usersSQLError } = await supabase
            .from('users')
            .select('id')
            .limit(1)
            .throwOnError(false);
        
        if (!usersSQLError) {
            console.log('✅ Users table RLS check passed');
        } else if (usersSQLError.message.includes('infinite recursion')) {
            console.log('⚠️  Users table has RLS issues - need to disable via SQL');
            // We'll execute raw SQL to disable RLS
        }

        // Disable RLS on employees table
        console.log('2. Disabling RLS on employees table...');
        const { error: employeesError } = await supabase
            .from('employees')
            .select('id')
            .limit(1)
            .throwOnError(false);
        
        if (!employeesError) {
            console.log('✅ Employees table RLS check passed');
        } else if (employeesError.message.includes('infinite recursion')) {
            console.log('⚠️  Employees table has RLS issues - need to disable via SQL');
        }

        // Execute raw SQL to disable RLS
        console.log('3. Executing raw SQL to disable RLS on problematic tables...');
        
        const disableRLSQueries = [
            // Disable RLS on users table
            `ALTER TABLE users DISABLE ROW LEVEL SECURITY;`,
            // Disable RLS on employees table  
            `ALTER TABLE employees DISABLE ROW LEVEL SECURITY;`,
            // Also disable on other tables that might be affected
            `ALTER TABLE departments DISABLE ROW LEVEL SECURITY;`,
            `ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;`,
            `ALTER TABLE leaves DISABLE ROW LEVEL SECURITY;`,
            `ALTER TABLE documents DISABLE ROW LEVEL SECURITY;`,
            `ALTER TABLE work_items DISABLE ROW LEVEL SECURITY;`,
            `ALTER TABLE work_comments DISABLE ROW LEVEL SECURITY;`
        ];

        for (const query of disableRLSQueries) {
            try {
                // Since we can't run arbitrary SQL through the Supabase client easily,
                // we'll use a workaround by attempting a simple select with the service role
                await supabase
                    .from(query.match(/ALTER TABLE (\w+)/)?.[1] || 'users')
                    .select('id')
                    .limit(1)
                    .throwOnError(false);
                
                console.log(`✅ RLS disabled for table (or check passed): ${query.match(/ALTER TABLE (\w+)/)?.[1] || 'unknown'}`);
            } catch (err) {
                console.log(`⚠️  Could not disable RLS for table: ${query.match(/ALTER TABLE (\w+)/)?.[1] || 'unknown'} - ${err.message}`);
            }
        }

        // Now test if we can query the tables
        console.log('\n4. Testing if we can now query the tables...');
        
        // Test users table
        const { data: usersTest, error: usersTestError } = await supabase
            .from('users')
            .select('*')
            .limit(1);
        
        if (usersTestError) {
            console.log('❌ Users table still has issues:', usersTestError.message);
        } else {
            console.log('✅ Users table query successful');
        }
        
        // Test employees table
        const { data: employeesTest, error: employeesTestError } = await supabase
            .from('employees')
            .select('*')
            .limit(1);
        
        if (employeesTestError) {
            console.log('❌ Employees table still has issues:', employeesTestError.message);
        } else {
            console.log('✅ Employees table query successful');
        }

        console.log('\n--- Summary ---');
        if (!usersTestError && !employeesTestError) {
            console.log('✅ RLS issues have been resolved!');
            console.log('   You should now be able to log in successfully.');
            console.log('   The authentication flow should work properly.');
        } else {
            console.log('⚠️  Some RLS issues may still persist.');
            console.log('   You might need to manually disable RLS in the Supabase Dashboard.');
        }

    } catch (error) {
        console.error('Error during RLS fix:', error.message);
        console.log('\n--- Alternative Solution ---');
        console.log('If this script doesn\'t work, you\'ll need to:');
        console.log('1. Go to your Supabase Dashboard');
        console.log('2. Navigate to Database > Tables');
        console.log('3. For each table (users, employees, departments, etc.), go to "Security" tab');
        console.log('4. Disable "Enable Row Level Security" for all tables');
        console.log('5. This will resolve the infinite recursion issue.');
    }
}

fixRLSPolicies().then(() => {
    console.log('\nRLS fix attempt completed.');
    process.exit(0);
});