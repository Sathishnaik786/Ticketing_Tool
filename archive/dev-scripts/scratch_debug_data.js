const { supabaseAdmin } = require('./backend/src/lib/supabase');

async function debugEmployees() {
  const { data, error } = await supabaseAdmin
    .from('employees')
    .select('id, first_name, last_name, employee_id, employee_code')
    .limit(5);
    
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log('Sample Employee Data:');
  console.log(JSON.stringify(data, null, 2));
}

debugEmployees();
