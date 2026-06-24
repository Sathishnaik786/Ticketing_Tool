const { Client } = require('pg');
require('dotenv').config();

const runDbInit = async () => {
  const databaseUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (!databaseUrl) {
    console.warn('[DB_INIT] DATABASE_URL or DIRECT_URL not set in environment. Skipping database initialization.');
    return;
  }

  const client = new Client({
    connectionString: databaseUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('[DB_INIT] Connected to PostgreSQL to apply schema definitions.');

    // 1. Create partial unique index to enforce single published version per workflow
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_single_published_version
      ON workflow_versions(tenant_id, workflow_id)
      WHERE status = 'PUBLISHED';
    `);
    console.log('[DB_INIT] Verified single-published-version constraint index.');

    // 2. Create RPC function for atomic publishing
    await client.query(`
      CREATE OR REPLACE FUNCTION publish_workflow_version(
          p_tenant_id UUID,
          p_workflow_id UUID,
          p_version_id UUID
      )
      RETURNS JSONB AS $$
      DECLARE
          v_result JSONB;
      BEGIN
          -- 1. Archive other published versions
          UPDATE workflow_versions
          SET status = 'ARCHIVED'
          WHERE tenant_id = p_tenant_id
            AND workflow_id = p_workflow_id
            AND status = 'PUBLISHED';

          -- 2. Publish the target version
          UPDATE workflow_versions
          SET status = 'PUBLISHED',
              published_at = CURRENT_TIMESTAMP
          WHERE tenant_id = p_tenant_id
            AND id = p_version_id
          RETURNING row_to_json(workflow_versions.*)::JSONB INTO v_result;

          RETURN v_result;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);
    console.log('[DB_INIT] Created publish_workflow_version RPC function.');

  } catch (err) {
    console.error('[DB_INIT] Error applying database schema/functions:', err.message);
  } finally {
    try {
      await client.end();
    } catch (e) {
      // Ignore
    }
  }
};

module.exports = { runDbInit };
