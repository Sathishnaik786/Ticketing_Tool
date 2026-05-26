import { supabaseAdmin } from '@lib/supabase';

export class VarianceDetectionService {
  /**
   * Scans a reconciliation batch for financial anomalies.
   */
  static async scanForVariances(reconId: string) {
    const { data: batch, error } = await supabaseAdmin
      .from('payroll_reconciliation_batches')
      .select('*, payroll_disbursements(*, employee:employees(first_name, last_name, salary))')
      .eq('id', reconId)
      .single();

    if (error || !batch) throw new Error('Batch not found');

    const variances = [];

    for (const disbursement of (batch as any).payroll_disbursements) {
      const emp = disbursement.employee;
      const payoutAmount = Number(disbursement.amount);
      const masterSalary = Number(emp.salary);

      // 1. Salary Spike Detection (> 25%)
      if (masterSalary > 0 && payoutAmount > (masterSalary * 1.25)) {
        variances.push({
          reconciliation_id: reconId,
          employee_id: disbursement.employee_id,
          variance_type: 'SALARY_SPIKE',
          severity: 'HIGH',
          description: `Payout (${payoutAmount}) is >25% higher than master salary (${masterSalary})`,
          metadata: { payoutAmount, masterSalary }
        });
      }

      // 2. Negative Net Pay Detection
      if (payoutAmount < 0) {
        variances.push({
          reconciliation_id: reconId,
          employee_id: disbursement.employee_id,
          variance_type: 'NEGATIVE_NET',
          severity: 'CRITICAL',
          description: `Calculated net payout is negative: ${payoutAmount}`,
          metadata: { payoutAmount }
        });
      }
    }

    if (variances.length > 0) {
      await supabaseAdmin.from('payroll_financial_variances').insert(variances);
      await supabaseAdmin
        .from('payroll_reconciliation_batches')
        .update({ variance_count: variances.length, variance_severity: 'HIGH' })
        .eq('id', reconId);
    }

    return { varianceCount: variances.length };
  }
}
