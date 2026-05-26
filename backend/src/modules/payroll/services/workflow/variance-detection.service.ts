import { supabaseAdmin } from '@lib/supabase';

export class VarianceDetectionService {
  /**
   * Detects abnormal changes in payroll compared to previous cycles.
   */
  static async detect(record: any) {
    const { employee_id, gross_salary, total_deductions, net_salary } = record;

    // 1. Fetch Previous Processed Record
    const { data: prevRecord } = await supabaseAdmin
      .from('payroll_records')
      .select('gross_salary, net_salary, total_deductions')
      .eq('employee_id', employee_id)
      .eq('status', 'LOCKED')
      .order('processed_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!prevRecord) return []; // First payroll, no variance

    const variances = [];

    // 2. Check Gross Spike (> 20%)
    const grossDiff = Number(gross_salary) - Number(prevRecord.gross_salary);
    const grossPct = (grossDiff / Number(prevRecord.gross_salary)) * 100;

    if (Math.abs(grossPct) > 20) {
      variances.push({
        payroll_record_id: record.id,
        variance_type: 'GROSS_CHANGE',
        previous_amount: prevRecord.gross_salary,
        current_amount: gross_salary,
        variance_percentage: grossPct,
        severity: Math.abs(grossPct) > 50 ? 'HIGH' : 'MEDIUM',
        remarks: `Significant change in gross salary: ${grossPct.toFixed(2)}%`
      });
    }

    // 3. Check Negative Net
    if (Number(net_salary) < 0) {
      variances.push({
        payroll_record_id: record.id,
        variance_type: 'NEGATIVE_PAYROLL',
        previous_amount: prevRecord.net_salary,
        current_amount: net_salary,
        variance_percentage: 100,
        severity: 'CRITICAL',
        remarks: 'Net salary resulted in a negative value.'
      });
    }

    // 4. Save Variances
    if (variances.length > 0) {
      await supabaseAdmin.from('payroll_variances').insert(variances);
    }

    return variances;
  }
}
