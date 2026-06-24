const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    console.error('[CRITICAL] SUPABASE_URL is missing or invalid in environment variables! Supabase client creation will fail.');
}
if (!supabaseAnonKey) {
    console.error('[CRITICAL] SUPABASE_ANON_KEY is missing in environment variables! Supabase client creation will fail.');
}

console.log('[BOOT] Initializing Supabase client...');
let supabase;
let supabaseAdmin;

try {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole);
    console.log('[BOOT] Supabase client initialized successfully.');
} catch (err) {
    console.error('[CRITICAL] Failed to create Supabase client:', err.message);
    throw err; // Let it bubble up to the early server exception handler
}

module.exports = {
    supabase,
    supabaseAdmin
};