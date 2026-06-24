require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Use the service role key to have full access
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase environment variables in .env file');
    console.error('Please ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createEmployeeForUser() {
    const email = process.argv[2];
    
    if (!email) {
        console.log('Usage: node create_employee_for_user.js <email>');
        console.log('Please provide the email of the user to create an employee record for');
        return;
    }
    
    try {
        console.log(`Looking for user with email: ${email}`);
        
        // First, try to find the user in the public.users table
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('id, email')
            .eq('email', email)
            .single();
            
        if (userError) {
            console.error('Error finding user in public.users table:', userError.message);
            console.log('The user might not exist in the database. They may need to be created through the admin panel.');
            return;
        }
        
        if (!user) {
            console.log(`User with email ${email} not found in the database.`);
            console.log('This user might have signed up directly with Supabase Auth but not through the admin panel.');
            return;
        }
        
        console.log(`Found user in database: ${user.email} with ID: ${user.id}`);
        
        // Check if employee record already exists
        const { data: existingEmployee, error: existingError } = await supabase
            .from('employees')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();
            
        if (existingEmployee) {
            console.log(`Employee record already exists for user ${email}`);
            console.log('Employee data:', existingEmployee);
            return;
        }
        
        // Create a basic employee record for the user
        const { data: employee, error: empError } = await supabase
            .from('employees')
            .insert([{
                user_id: user.id,
                first_name: email.split('@')[0], // Use email prefix as first name
                last_name: 'User',
                email: email,
                role: 'EMPLOYEE', // Default role
                status: 'ACTIVE'
            }])
            .select()
            .single();
            
        if (empError) {
            console.error('Error creating employee record:', empError.message);
            console.log('This could be due to RLS policies. Make sure RLS is properly configured.');
            return;
        }
        
        console.log('Successfully created employee record:', employee);
        console.log('User can now log in to the application');
        
    } catch (error) {
        console.error('Error in createEmployeeForUser:', error.message);
    }
}

if (require.main === module) {
    createEmployeeForUser();
}

module.exports = { createEmployeeForUser };