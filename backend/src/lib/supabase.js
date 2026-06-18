const { createClient } = require('@supabase/supabase-js');
const ws = require('ws');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseUrl.startsWith('http')) {
    console.error('[CRITICAL] SUPABASE_URL is missing or invalid in environment variables! Supabase client creation will fail.');
}
if (!supabaseAnonKey) {
    console.error('[CRITICAL] SUPABASE_ANON_KEY is missing in environment variables! Supabase client creation will fail.');
}
if (!supabaseServiceRole) {
    console.error('[CRITICAL] SUPABASE_SERVICE_ROLE_KEY is missing. Refusing to start privileged backend client without a service role key.');
    throw new Error('SUPABASE_SERVICE_ROLE_KEY missing');
}

console.log('[BOOT] Initializing Supabase client...');
let supabase;
let supabaseAdmin;

// Node.js < 22 has no native WebSocket; required by @supabase/realtime-js on Render
const supabaseClientOptions = {
    realtime: { transport: ws },
};

try {
    supabase = createClient(supabaseUrl, supabaseAnonKey, supabaseClientOptions);
    supabaseAdmin = createClient(supabaseUrl, supabaseServiceRole, supabaseClientOptions);
    console.log('[BOOT] Supabase client initialized successfully.');
} catch (err) {
    console.error('[CRITICAL] Failed to create Supabase client:', err.message);
    throw err; // Let it bubble up to the early server exception handler
}

module.exports = {
    supabase,
    supabaseAdmin
};
