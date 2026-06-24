const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();
const supabase = createClient(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
supabase.from('payroll_records').select('id, document_status, generation_error').order('created_at', { ascending: false }).limit(5).then(res => console.log(JSON.stringify(res, null, 2)));
