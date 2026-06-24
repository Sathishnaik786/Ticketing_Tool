const { supabaseAdmin } = require('../../lib/supabase');

const createPolicy = async (data) => {
  const { tenant_id, name, description, priority, category, subcategory, department_id, business_unit_id, catalog_item_id, response_target_mins, resolution_target_mins, is_active } = data;

  const { data: record, error } = await supabaseAdmin
    .from('sla_policies')
    .insert([{
      tenant_id,
      name,
      description,
      priority: priority || 'MEDIUM',
      category: category || null,
      subcategory: subcategory || null,
      department_id: department_id || null,
      business_unit_id: business_unit_id || null,
      catalog_item_id: catalog_item_id || null,
      response_target_mins,
      resolution_target_mins,
      is_active: is_active !== undefined ? is_active : true
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return record;
};

const createEscalationRule = async (data) => {
  const { tenant_id, policy_id, trigger_event, buffer_percentage, action_type, action_payload } = data;

  const { data: record, error } = await supabaseAdmin
    .from('sla_escalation_rules')
    .insert([{
      tenant_id,
      policy_id,
      trigger_event,
      buffer_percentage: buffer_percentage || 80,
      action_type,
      action_payload: action_payload || {}
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return record;
};

const getPolicies = async (tenantId) => {
  const { data, error } = await supabaseAdmin
    .from('sla_policies')
    .select('*, sla_escalation_rules(*)')
    .eq('tenant_id', tenantId);

  if (error) throw new Error(error.message);
  return data;
};

const getPolicyWithRules = async (tenantId, id) => {
  const { data: policy, error: policyError } = await supabaseAdmin
    .from('sla_policies')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .maybeSingle();

  if (policyError) throw new Error(policyError.message);
  if (!policy) return null;

  const { data: rules, error: rulesError } = await supabaseAdmin
    .from('sla_escalation_rules')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('policy_id', id);

  if (rulesError) throw new Error(rulesError.message);

  return {
    ...policy,
    rules
  };
};

const updatePolicy = async (tenantId, id, data) => {
  const { name, description, priority, category, subcategory, department_id, business_unit_id, catalog_item_id, response_target_mins, resolution_target_mins, is_active } = data;

  const { data: record, error } = await supabaseAdmin
    .from('sla_policies')
    .update({
      name,
      description,
      priority,
      category,
      subcategory,
      department_id,
      business_unit_id,
      catalog_item_id,
      response_target_mins,
      resolution_target_mins,
      is_active
    })
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return record;
};

const deletePolicy = async (tenantId, id) => {
  const { error } = await supabaseAdmin
    .from('sla_policies')
    .delete()
    .eq('tenant_id', tenantId)
    .eq('id', id);

  if (error) throw new Error(error.message);
  return true;
};

const deleteEscalationRules = async (tenantId, policyId) => {
  const { error } = await supabaseAdmin
    .from('sla_escalation_rules')
    .delete()
    .eq('tenant_id', tenantId)
    .eq('policy_id', policyId);

  if (error) throw new Error(error.message);
  return true;
};

const createBreachRecord = async (data) => {
  const { tenant_id, ticket_id, policy_id, breach_type, target_time, breached_at, is_acknowledged } = data;

  const { data: record, error } = await supabaseAdmin
    .from('sla_breaches')
    .insert([{
      tenant_id,
      ticket_id,
      policy_id,
      breach_type,
      target_time,
      breached_at: breached_at || null,
      is_acknowledged: is_acknowledged || false
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return record;
};

const getBreaches = async (tenantId) => {
  const { data, error } = await supabaseAdmin
    .from('sla_breaches')
    .select('*, sla_policies(name)')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
};

const getPendingBreaches = async (tenantId) => {
  const { data, error } = await supabaseAdmin
    .from('sla_breaches')
    .select('*')
    .eq('tenant_id', tenantId)
    .is('breached_at', null);

  if (error) throw new Error(error.message);
  return data;
};

const updateBreach = async (tenantId, id, updates) => {
  const { data, error } = await supabaseAdmin
    .from('sla_breaches')
    .update(updates)
    .eq('tenant_id', tenantId)
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

module.exports = {
  createPolicy,
  createEscalationRule,
  getPolicies,
  getPolicyWithRules,
  updatePolicy,
  deletePolicy,
  deleteEscalationRules,
  createBreachRecord,
  getBreaches,
  getPendingBreaches,
  updateBreach
};
