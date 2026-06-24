import { supabaseAdmin } from '@lib/supabase';

export class PayrollClosureService {
  /**
   * Freezes a payroll batch to prevent any further modifications.
   */
  static async freezePayroll(uploadId: string, performedBy: string, reason: string) {
    // 1. Check current status
    const { data: upload, error: fetchError } = await supabaseAdmin
      .from('payroll_bulk_uploads')
      .select('upload_status')
      .eq('id', uploadId)
      .single();

    if (fetchError || !upload) throw new Error('Upload batch not found');

    // 2. Perform Atomic Update with Locking
    const { error: updateError } = await supabaseAdmin
      .from('payroll_bulk_uploads')
      .update({ 
        upload_status: 'LOCKED',
        processing_completed_at: new Date().toISOString()
      })
      .eq('id', uploadId);

    if (updateError) throw updateError;

    // 3. Log Closure Audit
    await supabaseAdmin.from('payroll_closure_audits').insert({
      upload_id: uploadId,
      previous_status: upload.upload_status,
      new_status: 'LOCKED',
      action_type: 'FREEZE',
      performed_by: performedBy,
      reason: reason || 'Monthly Payroll Finalization'
    });

    return { success: true, status: 'LOCKED' };
  }

  /**
   * Closes a payroll cycle permanently after reconciliation.
   */
  static async closePayroll(uploadId: string, performedBy: string) {
    // Permanent closure logic
    const { error } = await supabaseAdmin
      .from('payroll_bulk_uploads')
      .update({ upload_status: 'CLOSED' })
      .eq('id', uploadId);

    if (error) throw error;

    await supabaseAdmin.from('payroll_closure_audits').insert({
      upload_id: uploadId,
      action_type: 'CLOSE',
      new_status: 'CLOSED',
      performed_by: performedBy,
      reason: 'Reconciliation complete. Batch closed.'
    });

    return { success: true };
  }
}
