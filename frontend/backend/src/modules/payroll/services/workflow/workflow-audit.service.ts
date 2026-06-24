import { supabaseAdmin } from '@lib/supabase';

export class WorkflowAuditService {
  static async log(data: {
    entity_type: 'CYCLE' | 'APPROVAL' | 'RULE';
    entity_id: string;
    action_type: 'APPROVE' | 'REJECT' | 'ESCALATE' | 'REOPEN' | 'DELEGATE';
    performed_by: string;
    old_state?: any;
    new_state?: any;
    metadata?: any;
  }) {
    const { error } = await supabaseAdmin
      .from('payroll_workflow_audits')
      .insert([data]);
    
    if (error) console.error('Audit logging failed:', error);
  }

  static async getAuditTrail(entityId: string) {
    const { data, error } = await supabaseAdmin
      .from('payroll_workflow_audits')
      .select(`
        *,
        performer:users(id, first_name, last_name)
      `)
      .eq('entity_id', entityId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }
}
