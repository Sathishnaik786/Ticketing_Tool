import { supabaseAdmin } from '@lib/supabase';

export class AuditRepository {
  static async log(data: {
    user_id: string;
    action: string;
    entity_type: string;
    entity_id: string;
    old_value?: any;
    new_value?: any;
  }) {
    const { error } = await supabaseAdmin
      .from('payroll_audit_logs')
      .insert([data]);

    if (error) {
      console.error('Audit Log Error:', error);
    }
  }
}
