require('dotenv').config();
require('module-alias/register');
const { supabase, supabaseAdmin } = require('@lib/supabase');

// Demo user emails that are recognized by the system
const demoUsers = [
  { email: 'admin@company.com', role: 'ADMIN', firstName: 'Admin' },
  { email: 'hr@company.com', role: 'HR', firstName: 'HR' },
  { email: 'manager@company.com', role: 'MANAGER', firstName: 'Manager' },
  { email: 'employee@company.com', role: 'EMPLOYEE', firstName: 'Employee' }
];

async function createMissingEmployeeRecords() {
  console.log('Fetching existing users from Supabase and creating missing employee records...');
  
  try {
    // Get all users from Supabase Auth
    const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching users from Supabase Auth:', authError.message);
      return;
    }
    
    console.log(`Found ${users.length} users in Supabase Auth`);
    
    for (const supabaseUser of users) {
      try {
        console.log(`\nProcessing user: ${supabaseUser.email} (ID: ${supabaseUser.id})`);
        
        // Check if employee record already exists for this user
        const { data: existingEmployee, error: existingError } = await supabase
          .from('employees')
          .select('*')
          .eq('user_id', supabaseUser.id)
          .maybeSingle();
          
        if (existingError && existingError.code !== 'PGRST116') {
          console.error(`Error checking employee record for ${supabaseUser.email}:`, existingError.message);
          continue;
        }
        
        if (existingEmployee) {
          console.log(`Employee record already exists for user ${supabaseUser.email}`);
          continue;
        }
        
        // Determine role based on email pattern or default to EMPLOYEE
        let role = 'EMPLOYEE';
        if (supabaseUser.email.includes('admin')) {
          role = 'ADMIN';
        } else if (supabaseUser.email.includes('hr')) {
          role = 'HR';
        } else if (supabaseUser.email.includes('manager')) {
          role = 'MANAGER';
        }
        
        // Create an employee record for the user
        const { data: employee, error: empError } = await supabase
          .from('employees')
          .insert([{
            user_id: supabaseUser.id,
            first_name: supabaseUser.email.split('@')[0],
            last_name: 'User',
            email: supabaseUser.email,
            role: role,
            status: 'ACTIVE',
            position: role,
            department_name: 'General'
          }])
          .select()
          .single();
          
        if (empError) {
          console.error(`Error creating employee record for ${supabaseUser.email}:`, empError.message);
          continue;
        }
        
        console.log(`Successfully created employee record for ${supabaseUser.email}:`, employee);
        
      } catch (error) {
        console.error(`Error processing user ${supabaseUser.email}:`, error.message);
      }
    }
    
    console.log('\nProcess completed. All users from Supabase now have associated employee records if they were missing.');
  } catch (error) {
    console.error('Error in createMissingEmployeeRecords:', error.message);
  }
}

if (require.main === module) {
  createMissingEmployeeRecords().catch(console.error);
}

module.exports = { createMissingEmployeeRecords };