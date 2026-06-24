const { supabaseAdmin } = require('../../lib/supabase');

const createAssignment = async (data) => {
  const { tenant_id, level_id, ticket_id, assigned_role, assigned_user_id, status, escalates_at } = data;
  
  const { data: record, error } = await supabaseAdmin
    .from('approval_assignments')
    .insert([{
      tenant_id,
      level_id,
      ticket_id,
      assigned_role,
      assigned_user_id,
      status: status || 'PENDING',
      escalates_at
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return record;
};

const getPendingAssignment = async (tenantId, assignmentId) => {
  const { data, error } = await supabaseAdmin
    .from('approval_assignments')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('id', assignmentId)
    .eq('status', 'PENDING')
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
};

const updateAssignmentStatus = async (tenantId, assignmentId, status) => {
  const { data, error } = await supabaseAdmin
    .from('approval_assignments')
    .update({ status })
    .eq('tenant_id', tenantId)
    .eq('id', assignmentId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
};

const createHistoryLog = async (data) => {
  const { tenant_id, assignment_id, actor_id, action, comments } = data;
  
  const { data: record, error } = await supabaseAdmin
    .from('approval_history')
    .insert([{
      tenant_id,
      assignment_id,
      actor_id,
      action,
      comments
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  return record;
};

const getTicketAssignments = async (tenantId, ticketId) => {
  const { data, error } = await supabaseAdmin
    .from('approval_assignments')
    .select('*, approval_levels(*)')
    .eq('tenant_id', tenantId)
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return data;
};

const getPendingUserAssignments = async (tenantId, userId, roles = []) => {
  let query = supabaseAdmin
    .from('approval_assignments')
    .select('*, approval_levels(policy_id)')
    .eq('tenant_id', tenantId)
    .eq('status', 'PENDING');

  if (roles.length > 0) {
    query = query.or(`assigned_user_id.eq.${userId},assigned_role.in.(${roles.join(',')})`);
  } else {
    query = query.eq('assigned_user_id', userId);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
};

module.exports = {
  createAssignment,
  getPendingAssignment,
  updateAssignmentStatus,
  createHistoryLog,
  getTicketAssignments,
  getPendingUserAssignments
};
