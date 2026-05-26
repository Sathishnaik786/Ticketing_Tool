import { supabaseAdmin } from '@lib/supabase';

export class PayrollReconciliationService {
  /**
   * Initializes a reconciliation batch for a committed payroll.
   */
  static async initializeReconciliation(uploadId: string, commitmentId: string, performedBy: string) {
    // 1. Fetch Commitment Totals
    const { data: commitment, error: commitError } = await supabaseAdmin
      .from('payroll_bulk_commitments')
      .select('*')
      .eq('id', commitmentId)
      .single();

    if (commitError || !commitment) throw new Error('Commitment record not found');

    // 2. Initialize Recon Batch
    const { data: batch, error: batchError } = await supabaseAdmin
      .from('payroll_reconciliation_batches')
      .insert({
        upload_id: uploadId,
        commitment_id: commitmentId,
        total_gross_payroll: commitment.gross_total,
        total_net_payout: commitment.net_total,
        total_deductions: (commitment.gross_total - commitment.net_total),
        reconciliation_status: 'PROCESSING'
      })
      .select()
      .single();

    if (batchError) throw batchError;

    // 3. Trigger Disbursement Lifecycle initialization (Mock/Internal)
    await this.initializeDisbursements(batch.id, commitmentId);

    return batch;
  }

  /**
   * Generates disbursement records for every employee in the commitment.
   */
  private static async initializeDisbursements(reconId: string, commitmentId: string) {
    // Fetch payslips to get individual amounts
    const { data: payslips, error } = await supabaseAdmin
      .from('employee_payslip_documents')
      .select('id, employee_id, payroll_record_id')
      .eq('generated_from', 'BULK_UPLOAD'); // In a real scenario, filter by commitment/upload

    if (error) throw error;

    // Fetch individual records for amounts (Simplified for Phase 2)
    const disbursements = payslips.map(ps => ({
      reconciliation_id: reconId,
      employee_id: ps.employee_id,
      amount: 0, // In production, this would be the calculated net from the record
      payout_status: 'SCHEDULED'
    }));

    await supabaseAdmin.from('payroll_disbursements').insert(disbursements);
  }

  /**
   * Performs financial balancing check.
   */
  static async runBalancingCheck(reconId: string) {
    const { data: batch, error } = await supabaseAdmin
      .from('payroll_reconciliation_batches')
      .select('*, payroll_disbursements(amount)')
      .eq('id', reconId)
      .single();

    if (error || !batch) throw new Error('Reconciliation batch not found');

    const totalDisbursed = (batch as any).payroll_disbursements.reduce((acc: number, d: any) => acc + Number(d.amount), 0);
    const isBalanced = Math.abs(totalDisbursed - Number(batch.total_net_payout)) < 0.01;

    const status = isBalanced ? 'MATCHED' : 'PARTIAL_MATCH';

    await supabaseAdmin
      .from('payroll_reconciliation_batches')
      .update({ 
        reconciliation_status: status,
        reconciled_at: new Date().toISOString()
      })
      .eq('id', reconId);

    return { isBalanced, totalDisbursed, target: batch.total_net_payout };
  }
}
