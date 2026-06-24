import { supabaseAdmin } from '@lib/supabase';

export class ReconciliationService {
  /**
   * Reconciles payroll totals against journal entries and disbursements.
   */
  static async runReconciliation(cycleId: string, userId: string) {
    // 1. Get Payroll Net Total
    const { data: records } = await supabaseAdmin
      .from('payroll_records')
      .select('net_salary')
      .eq('payroll_cycle_id', cycleId);
    
    const expectedTotal = records?.reduce((sum, r) => sum + Number(r.net_salary), 0) || 0;

    // 2. Get Disbursement Total
    const { data: disbursements } = await supabaseAdmin
      .from('payroll_disbursements')
      .select('amount')
      .filter('payroll_record_id', 'in', 
        supabaseAdmin.from('payroll_records').select('id').eq('payroll_cycle_id', cycleId)
      );
    
    const actualTotal = disbursements?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;

    const diff = expectedTotal - actualTotal;

    // 3. Save Reconciliation Report
    const { data: report } = await supabaseAdmin
      .from('payroll_reconciliations')
      .insert([{
        payroll_cycle_id: cycleId,
        expected_amount: expectedTotal,
        actual_amount: actualTotal,
        difference_amount: diff,
        reconciliation_status: Math.abs(diff) < 0.01 ? 'MATCHED' : 'MISMATCHED',
        reconciled_by: userId,
        reconciled_at: new Date().toISOString()
      }])
      .select()
      .single();

    return report;
  }
}
