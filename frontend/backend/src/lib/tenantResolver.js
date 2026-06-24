const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin } = require('./supabase');

let defaultTenantId = null;

const resolveTenantId = async (user) => {
  if (user && user.tenant_id) return user.tenant_id;
  if (defaultTenantId) return defaultTenantId;

  try {
    const { data, error } = await supabaseAdmin
      .from('companies')
      .select('id')
      .limit(1);

    if (!error && data && data.length > 0) {
      defaultTenantId = data[0].id;
      return defaultTenantId;
    }
  } catch (err) {
    // Ignore error and fall back
  }

  defaultTenantId = uuidv4();
  return defaultTenantId;
};

module.exports = {
  resolveTenantId
};
