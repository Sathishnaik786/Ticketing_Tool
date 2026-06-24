// Test script to create admin user via the API endpoint
// This requires an existing admin user to be able to create new users

async function testAdminCreation() {
    // This would require an existing admin user to make the API call
    console.log('To create an admin user:');
    console.log('1. You need to have an existing admin user');
    console.log('2. Or use the Supabase dashboard to create a user first');
    console.log('3. Then map that user to an employee record with ADMIN role');
    
    console.log('\nFor now, try these steps:');
    console.log('- Go to your Supabase dashboard');
    console.log('- Create a user with email: admin@yvi-ews.com and a password');
    console.log('- Then run this SQL in the SQL editor:');
    console.log('  INSERT INTO users (id, email, role) VALUES \n  ((SELECT id FROM auth.users WHERE email = \'admin@yvi-ews.com\'), \'admin@yvi-ews.com\', \'ADMIN\');'); 
    console.log('  INSERT INTO employees (user_id, first_name, last_name, email, role, status) VALUES \n  ((SELECT id FROM auth.users WHERE email = \'admin@yvi-ews.com\'), \'Admin\', \'User\', \'admin@yvi-ews.com\', \'ADMIN\', \'ACTIVE\');');
}

testAdminCreation();
