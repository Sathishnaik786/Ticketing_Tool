const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function applyFix() {
    const databaseUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;

    if (!databaseUrl) {
        console.error('❌ Error: DATABASE_URL not found in .env file.');
        console.log('Please manualy run the SQL in backend/database/fix_infinite_recursion.sql in your Supabase SQL Editor.');
        process.exit(1);
    }

    console.log('Connecting to database...');
    const client = new Client({
        connectionString: databaseUrl,
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        console.log('✅ Connected to database.');

        const sqlPath = path.join(__dirname, 'database', 'fix_infinite_recursion.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Applying SQL fixes...');
        await client.query(sql);
        console.log('✅ SQL fixes applied successfully!');

    } catch (err) {
        console.error('❌ Error applying SQL fixes:', err.message);
    } finally {
        await client.end();
    }
}

applyFix();
