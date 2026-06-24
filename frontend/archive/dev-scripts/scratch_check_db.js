const { supabaseAdmin } = require('./backend/src/lib/supabase');

async function checkTables() {
  const { data, error } = await supabaseAdmin.rpc('get_tables'); 
  // If RPC is not available, we can try querying information_schema
  const { data: tables, error: tableError } = await supabaseAdmin
    .from('pg_catalog.pg_tables')
    .select('tablename')
    .eq('schemaname', 'public');
    
  console.log('Tables:', tables?.map(t => t.tablename));
  
  // Also check employees columns
  const { data: columns, error: colError } = await supabaseAdmin
    .from('information_schema.columns')
    .select('column_name')
    .eq('table_name', 'employees');
    
  console.log('Employees Columns:', columns?.map(c => c.column_name));
}

checkTables();
