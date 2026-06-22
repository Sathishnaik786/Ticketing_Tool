const { supabaseAdmin } = require('./backend/src/lib/supabase');

async function checkSchema() {
  const { data, error } = await supabaseAdmin.rpc('get_table_schema', {
    table_name: 'payroll_bulk_upload_rows'
  });
  if (error) {
     const { data: data2 } = await supabaseAdmin
    .from('payroll_bulk_upload_rows')
    .select('*')
    .limit(1);
    console.log(data2 && data2[0] ? Object.keys(data2[0]) : "No data to infer schema");
  } else {
    console.log(data);
  }
}
checkSchema();
