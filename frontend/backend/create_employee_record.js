require('dotenv').config();
require('module-alias/register');
const { supabase, supabaseAdmin } = require('@lib/supabase');

async function createEmployeeRecord() {
    const email = process.argv[2];
    
    if (!email) {
        console.log('Usage: node create_employee_record.js <email>');
        console.log('Please provide the email of the user to create an employee record for');
        return;
    }
    
    try {
        // First, get the user from Supabase Auth using the service role
        const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (authError) {
            console.error('Error fetching users from Supabase Auth:', authError.message);
            return;
        }
        
        const user = users.find(u => u.email === email);
        
        if (!user) {
            console.log(`User with email ${email} not found in Supabase Auth`);
            return;
        }
        
        console.log(`Found user: ${user.email} with ID: ${user.id}`);
        
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
        
        // First, check if user exists in the public users table
        const { data: existingUser, error: userError } = await supabase
            .from('users')
            .select('id')
            .eq('id', user.id)
            .maybeSingle();
            
        if (!existingUser) {
            // User doesn't exist in public users table, create it first
            const { data: newUser, error: newError } = await supabase
                .from('users')
                .insert([{
                    id: user.id,
                    email: email,
                    role: 'EMPLOYEE' // Default role
                }])
                .select()
                .single();
                
            if (newError) {
                console.error('Error creating user in public table:', newError.message);
                return;
            }
            
            console.log('Created user in public table:', newUser);
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
            return;
        }
        
        console.log('Successfully created employee record:', employee);
        console.log('User can now log in to the application');
        
    } catch (error) {
        console.error('Error in createEmployeeRecord:', error.message);
    }
}

if (require.main === module) {
    createEmployeeRecord();
}

module.exports = { createEmployeeRecord };