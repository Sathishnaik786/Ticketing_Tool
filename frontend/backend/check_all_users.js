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

async function checkAllUsers() {
    try {
        console.log('=== Checking all users in the system ===\n');
        
        // Get all users from the users table
        const { data: allUsers, error: usersError } = await supabase
            .from('users')
            .select('*');
        
        if (usersError) {
            console.log('Error fetching users:', usersError.message);
        } else {
            console.log(`Found ${allUsers.length} users in the users table:`);
            allUsers.forEach(user => {
                console.log(`- ID: ${user.id}, Email: ${user.email}, Role: ${user.role}`);
            });
        }
        
        console.log('\n=== Checking all employees in the system ===\n');
        
        // Get all employees
        const { data: allEmployees, error: empError } = await supabase
            .from('employees')
            .select('*');
        
        if (empError) {
            console.log('Error fetching employees:', empError.message);
        } else {
            console.log(`Found ${allEmployees.length} employees in the employees table:`);
            allEmployees.forEach(emp => {
                console.log(`- ID: ${emp.id}, User ID: ${emp.user_id}, Name: ${emp.first_name} ${emp.last_name}, Role: ${emp.role}`);
            });
        }
        
        console.log('\n=== Checking users that exist in both tables ===\n');
        
        if (allUsers && allEmployees) {
            for (const user of allUsers) {
                const employee = allEmployees.find(emp => emp.user_id === user.id);
                
                if (employee) {
                    console.log(`✓ User found with complete mapping:`);
                    console.log(`  - User: ${user.email} (ID: ${user.id}, Role: ${user.role})`);
                    console.log(`  - Employee: ${employee.first_name} ${employee.last_name} (Role: ${employee.role}, Status: ${employee.status})`);
                    
                    // Check if this user exists in Supabase Auth
                    try {
                        const { data: authUser, error: authError } = await supabase
                            .from('auth.users')
                            .select('id, email, created_at')
                            .eq('id', user.id)
                            .single();
                        
                        if (authError || !authUser) {
                            console.log(`  - ❌ Missing in Supabase Auth`);
                        } else {
                            console.log(`  - ✓ Exists in Supabase Auth`);
                        }
                    } catch (authCheckError) {
                        console.log(`  - ❌ Error checking Supabase Auth: ${authCheckError.message}`);
                    }
                    
                    console.log('');
                } else {
                    console.log(`⚠️  User exists in users table but no employee mapping:`);
                    console.log(`  - User: ${user.email} (ID: ${user.id}, Role: ${user.role})`);
                    console.log('');
                }
            }
        }
        
        console.log('=== Summary ===');
        console.log('For successful login, a user needs to exist in:');
        console.log('1. Supabase Auth (for authentication)');
        console.log('2. Your users table (for role)');
        console.log('3. Your employees table (for employee data)');
        
    } catch (error) {
        console.error('Error checking users:', error.message);
    }
}

checkAllUsers().then(() => {
    console.log('\nCheck completed.');
    process.exit(0);
});