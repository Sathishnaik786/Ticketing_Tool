import { supabaseAdmin } from '@lib/supabase';
import { ProcessingLogService } from './processing-log.service';

export class PayrollLockService {
  /**
   * Locks a payroll cycle, making all results immutable.
   */
  static async lockCycle(cycleId: string, userId: string) {
    const { data: cycle, error: cycleError } = await supabaseAdmin
      .from('payroll_cycles')
      .select('status')
      .eq('id', cycleId)
      .single();

    if (cycleError || !cycle) throw new Error('Cycle not found');
    if (cycle.status !== 'COMPLETED') throw new Error('Can only lock completed payroll cycles');

    // Start Transactional update
    const { error: updateError } = await supabaseAdmin
      .from('payroll_cycles')
      .update({ 
        is_locked: true, 
        status: 'LOCKED',
        processed_by: userId
      })
      .eq('id', cycleId);

    if (updateError) throw updateError;

    // Lock all individual records in this cycle
    const { error: recordsError } = await supabaseAdmin
      .from('payroll_records')
      .update({ is_locked: true, status: 'LOCKED' })
      .eq('payroll_cycle_id', cycleId);

    if (recordsError) throw recordsError;

    await ProcessingLogService.log(cycleId, `Payroll cycle locked by user ${userId}`, 'INFO');

    return true;
  }

  /**
   * Checks if a payroll record is locked.
   */
  static async isRecordLocked(recordId: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from('payroll_records')
      .select('is_locked')
      .eq('id', recordId)
      .single();

    if (error) return true; // Default to safe-locked
    return data.is_locked;
  }
}
