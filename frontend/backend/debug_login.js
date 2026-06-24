const { supabase } = require('@lib/supabase');

async function debugLogin() {
    console.log('Debugging login issue...\n');
    
    // First, try to authenticate with Supabase
    console.log('1. Testing Supabase authentication...');
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin3@yvi-ews.com',
        password: 'AdminPassword123!',
    });

    if (error) {
        console.log('❌ Supabase authentication failed:', error.message);
        return;
    }

    console.log('✅ Supabase authentication successful!');
    console.log('User ID:', data.user.id);
    
    // Now try to find the employee record
    console.log('\n2. Testing employee lookup...');
    const { data: employee, error: empError } = await supabase
        .from('employees')
        .select('*')
        .eq('user_id', data.user.id)
        .single();

    if (empError) {
        console.log('❌ Employee lookup failed:', empError.message);
        console.log('Error details:', empError);
        
        // Let's try a broader search to see what's in the employees table
        console.log('\n3. Checking all employee records...');
        const { data: allEmployees, error: allEmpError } = await supabase
            .from('employees')
            .select('*');
            
        if (allEmpError) {
            console.log('❌ Could not fetch all employees:', allEmpError.message);
        } else {
            console.log('All employees in the system:');
            allEmployees.forEach(emp => {
                console.log(`- ID: ${emp.id}, User ID: ${emp.user_id}, Name: ${emp.first_name} ${emp.last_name}, Role: ${emp.role}`);
            });
        }
        
        // Let's also check the users table
        console.log('\n4. Checking users table for this user ID...');
        const { data: userRecord, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
        if (userError) {
            console.log('❌ Could not find user in users table:', userError.message);
        } else {
            console.log('User found in users table:', userRecord);
        }
    } else {
        console.log('✅ Employee lookup successful!');
        console.log('Employee data:', employee);
    }
}

debugLogin();