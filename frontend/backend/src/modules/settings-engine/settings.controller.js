const { supabaseAdmin } = require('../../lib/supabase');
const { invalidateCache } = require('../../lib/settingsRegistry');
const { getQueue } = require('../../lib/queue');
const { resolveTenantId } = require('../../lib/tenantResolver');

const getSettings = async (req, res) => {
  try {
    const tenantId = await resolveTenantId(req.user);

    const { data, error } = await supabaseAdmin
      .from('system_settings')
      .select('*')
      .eq('tenant_id', tenantId);

    if (error) throw new Error(error.message);
    return res.status(200).json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

const updateSetting = async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  if (value === undefined) {
    return res.status(400).json({ success: false, message: 'Missing parameter: value.' });
  }

  try {
    const tenantId = await resolveTenantId(req.user);
    // 1. Get old value for auditing
    const { data: oldRecord } = await supabaseAdmin
      .from('system_settings')
      .select('value')
      .eq('tenant_id', tenantId)
      .eq('key', key)
      .maybeSingle();

    const oldVal = oldRecord ? oldRecord.value : null;

    // 2. Perform database update
    const { data: updatedRecord, error } = await supabaseAdmin
      .from('system_settings')
      .update({ value: String(value) })
      .eq('tenant_id', tenantId)
      .eq('key', key)
      .select()
      .single();

    if (error) throw new Error(error.message);

    // 3. Clear settings registry cache
    await invalidateCache(key);

    // 4. Asynchronously log the update action using audit-queue
    const auditQueue = getQueue('audit-queue');
    await auditQueue.add('logSettingAction', {
      tenantId,
      actorId: req.user?.id || null,
      action: 'UPDATE_SYSTEM_SETTING',
      targetEntity: 'SYSTEM_SETTINGS',
      targetId: null,
      oldValues: { [key]: oldVal },
      newValues: { [key]: value }
    });

    return res.status(200).json({ success: true, data: updatedRecord });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getSettings,
  updateSetting
};
