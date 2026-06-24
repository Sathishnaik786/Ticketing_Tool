const { supabaseAdmin } = require('../../lib/supabase');

const getActiveWorkflows = async (tenantId) => {
  const { data, error } = await supabaseAdmin
    .from('workflows')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_active', true);

  if (error) throw new Error(error.message);
  return data;
};

const getPublishedVersion = async (tenantId, workflowId) => {
  const { data, error } = await supabaseAdmin
    .from('workflow_versions')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('workflow_id', workflowId)
    .eq('status', 'PUBLISHED')
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

const getVersionSteps = async (tenantId, versionId) => {
  const { data, error } = await supabaseAdmin
    .from('workflow_steps')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('version_id', versionId)
    .order('step_order', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

const createWorkflowDraft = async (tenantId, workflowId, steps) => {
  // Get next version number
  const { data: versions, error: verErr } = await supabaseAdmin
    .from('workflow_versions')
    .select('version_number')
    .eq('tenant_id', tenantId)
    .eq('workflow_id', workflowId)
    .order('version_number', { ascending: false });

  if (verErr) throw new Error(verErr.message);

  const nextVer = (versions[0]?.version_number || 0) + 1;

  // Insert Draft Version
  const { data: draft, error: draftErr } = await supabaseAdmin
    .from('workflow_versions')
    .insert([{
      tenant_id: tenantId,
      workflow_id: workflowId,
      version_number: nextVer,
      status: 'DRAFT'
    }])
    .select()
    .single();

  if (draftErr) throw new Error(draftErr.message);

  // Insert Steps
  if (steps && steps.length > 0) {
    const stepRows = steps.map((step, idx) => ({
      tenant_id: tenantId,
      version_id: draft.id,
      step_order: idx + 1,
      name: step.name,
      type: step.type,
      assigned_role: step.assigned_role || null,
      assigned_user_id: step.assigned_user_id || null,
      configuration: step.configuration || {}
    }));

    const { error: stepsErr } = await supabaseAdmin
      .from('workflow_steps')
      .insert(stepRows);

    if (stepsErr) throw new Error(stepsErr.message);
  }

  return draft;
};

const publishVersion = async (tenantId, workflowId, versionId) => {
  const { data, error } = await supabaseAdmin
    .rpc('publish_workflow_version', {
      p_tenant_id: tenantId,
      p_workflow_id: workflowId,
      p_version_id: versionId
    });

  if (error) throw new Error(error.message);
  return data;
};

const getTicketWorkflowState = async (tenantId, ticketId) => {
  const { data, error } = await supabaseAdmin
    .from('ticket_workflow_state')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('ticket_id', ticketId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

const setTicketWorkflowState = async (stateData) => {
  const { tenant_id, ticket_id, version_id, current_step_id, state_status } = stateData;

  const { data: existing } = await supabaseAdmin
    .from('ticket_workflow_state')
    .select('id')
    .eq('tenant_id', tenant_id)
    .eq('ticket_id', ticket_id)
    .maybeSingle();

  if (existing) {
    const { data, error } = await supabaseAdmin
      .from('ticket_workflow_state')
      .update({
        version_id,
        current_step_id,
        state_status,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  } else {
    const { data, error } = await supabaseAdmin
      .from('ticket_workflow_state')
      .insert([{
        tenant_id,
        ticket_id,
        version_id,
        current_step_id,
        state_status
      }])
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }
};

module.exports = {
  getActiveWorkflows,
  getPublishedVersion,
  getVersionSteps,
  createWorkflowDraft,
  publishVersion,
  getTicketWorkflowState,
  setTicketWorkflowState
};
