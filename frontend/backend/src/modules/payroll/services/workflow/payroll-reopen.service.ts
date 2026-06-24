import { supabaseAdmin } from '@lib/supabase';
import { PayrollNotificationService } from './payroll-notification.service';

export class PayrollReopenService {
  /**
   * Submits a request to reopen a locked payroll cycle.
   */
  static async requestReopen(cycleId: string, userId: string, reason: string) {
    const { data: cycle } = await supabaseAdmin
      .from('payroll_cycles')
      .select('is_locked')
      .eq('id', cycleId)
      .single();

    if (!cycle?.is_locked) throw new Error('Only locked payrolls can be reopened');

    const { data: request, error } = await supabaseAdmin
      .from('payroll_reopen_requests')
      .insert([{
        payroll_cycle_id: cycleId,
        requested_by: userId,
        reason,
        status: 'PENDING'
      }])
      .select()
      .single();

    if (error) throw error;

    // Notify Super Admin
    await PayrollNotificationService.notifyApprovers(cycleId, 'Reopen Request', 'ADMIN');

    return request;
  }

  /**
   * Approves a reopen request and unlocks the cycle.
   */
  static async approveReopen(requestId: string, adminId: string) {
    const { data: request } = await supabaseAdmin
      .from('payroll_reopen_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (!request) throw new Error('Request not found');

    // 1. Mark request approved
    await supabaseAdmin
      .from('payroll_reopen_requests')
      .update({
        status: 'APPROVED',
        approved_by: adminId,
        approved_at: new Date().toISOString()
      })
      .eq('id', requestId);

    // 2. Unlock Cycle & Reset Status
    await supabaseAdmin
      .from('payroll_cycles')
      .update({
        is_locked: false,
        status: 'DRAFT'
      })
      .eq('id', request.payroll_cycle_id);

    // 3. Unlock all records in cycle
    await supabaseAdmin
        .from('payroll_records')
        .update({ is_locked: false, status: 'PENDING' })
        .eq('payroll_cycle_id', request.payroll_cycle_id);

    await PayrollNotificationService.send(
      request.requested_by,
      'APPROVED',
      'Payroll Reopen Approved',
      'The payroll cycle has been unlocked and is now in DRAFT status for corrections.',
      { type: 'PAYROLL_CYCLE', id: request.payroll_cycle_id }
    );
  }
}
