const { supabaseAdmin } = require('./backend/src/lib/supabase');

async function checkEmployeesSchema() {
  const { data, error } = await supabaseAdmin
    .from('information_schema.columns')
    .select('column_name, data_type')
    .eq('table_name', 'employees');
    
  if (error) {
    console.error('Error fetching schema:', error);
    return;
  }
  
  console.log('Employees Columns:');
  data.forEach(col => {
    console.log(`- ${col.column_name} (${col.data_type})`);
  });
}

checkEmployeesSchema();
