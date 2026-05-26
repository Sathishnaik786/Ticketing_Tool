import { supabaseAdmin } from '@lib/supabase';

export class SalaryBatchEngineService {
  /**
   * Generates a treasury-ready disbursement batch.
   */
  static async generateBatch(reconId: string, userId: string) {
    // 1. Fetch Reconciled Disbursements
    const { data: disbursements, error: disError } = await supabaseAdmin
      .from('payroll_disbursements')
      .select('*, employee:employees(id, first_name, last_name, employee_code)')
      .eq('reconciliation_id', reconId)
      .eq('payout_status', 'SCHEDULED');

    if (disError || !disbursements.length) throw new Error('No scheduled payouts found for this reconciliation');

    const totalAmount = disbursements.reduce((acc, d) => acc + Number(d.amount), 0);
    const batchReference = `SAL/BCH/${new Date().getTime()}`;

    // 2. Create Batch (Maker Step)
    const { data: batch, error: batchError } = await supabaseAdmin
      .from('salary_disbursement_batches')
      .insert({
        reconciliation_id: reconId,
        batch_reference,
        total_amount: totalAmount,
        employee_count: disbursements.length,
        status: 'PENDING',
        maker_id: userId
      })
      .select()
      .single();

    if (batchError) throw batchError;

    // 3. Create Transaction Placeholders
    const transactions = disbursements.map(d => ({
      batch_id: batch.id,
      employee_id: d.employee_id,
      amount: d.amount,
      status: 'INITIATED'
    }));

    await supabaseAdmin.from('salary_disbursement_transactions').insert(transactions);

    // 4. Audit Log
    await supabaseAdmin.from('treasury_audit_logs').insert({
      batch_id: batch.id,
      action_type: 'BATCH_CREATED',
      performed_by: userId,
      reason: 'Standard monthly salary batch generation'
    });

    return batch;
  }

  /**
   * Generates Bank CSV Export.
   */
  static async generateBankExport(batchId: string) {
    const { data: transactions, error } = await supabaseAdmin
      .from('salary_disbursement_transactions')
      .select(`
        amount,
        employee:employees(
          first_name, 
          last_name, 
          employee_code,
          bank_account:employee_bank_accounts(account_number, ifsc_code)
        )
      `)
      .eq('batch_id', batchId);

    if (error) throw error;

    const exportRows = transactions.map(t => {
        const emp = t.employee as any;
        const bank = emp.bank_account?.[0];
        return {
            BeneficiaryName: `${emp.first_name} ${emp.last_name}`,
            AccountNumber: bank?.account_number,
            IFSC: bank?.ifsc_code,
            Amount: t.amount,
            Narration: `Salary Payment - ${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}`
        };
    });

    return exportRows;
  }
}
