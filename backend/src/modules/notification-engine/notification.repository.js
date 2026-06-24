const { supabaseAdmin } = require('../../lib/supabase');

const getUserPreferences = async (tenantId, userId) => {
  const { data, error } = await supabaseAdmin
    .from('notification_preferences')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  return data;
};

const savePreferences = async (tenantId, userId, preferences) => {
  // preferences is an array of { template_key, enabled_channels }
  const rows = preferences.map(pref => ({
    tenant_id: tenantId,
    user_id: userId,
    template_key: pref.template_key,
    enabled_channels: pref.enabled_channels
  }));

  const { data, error } = await supabaseAdmin
    .from('notification_preferences')
    .upsert(rows, { onConflict: 'tenant_id,user_id,template_key' })
    .select();

  if (error) throw new Error(error.message);
  return data;
};

const getTemplate = async (tenantId, key, channel) => {
  const { data, error } = await supabaseAdmin
    .from('notification_templates')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('key', key)
    .eq('channel', channel)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

const createDeliveryLog = async (logData) => {
  const { tenant_id, recipient_id, channel, status, payload, error_message } = logData;

  const { data, error } = await supabaseAdmin
    .from('notification_delivery_logs')
    .insert([{
      tenant_id,
      recipient_id,
      channel,
      status: status || 'PENDING',
      payload,
      error_message,
      attempts: 1
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

const updateDeliveryLog = async (tenantId, logId, status, errorMessage = null, attempts = 1) => {
  const { data, error } = await supabaseAdmin
    .from('notification_delivery_logs')
    .update({
      status,
      error_message: errorMessage,
      attempts,
      sent_at: status === 'SENT' ? new Date().toISOString() : null
    })
    .eq('tenant_id', tenantId)
    .eq('id', logId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

module.exports = {
  getUserPreferences,
  savePreferences,
  getTemplate,
  createDeliveryLog,
  updateDeliveryLog
};
