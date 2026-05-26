import { supabaseAdmin } from '@lib/supabase';

export class DuplicateCheckService {
  /**
   * Checks if a payroll record already exists for the employee in the given period.
   */
  static async checkDuplicatePayroll(params: {
    employeeId: string;
    month: number;
    year: number;
  }): Promise<boolean> {
    const { employeeId, month, year } = params;

    // Check in existing payroll_records table by joining with cycles
    const { data, error } = await supabaseAdmin
      .from('payroll_records')
      .select('id, cycles:payroll_cycles!inner(month, year)')
      .eq('employee_id', employeeId)
      .eq('cycles.month', month)
      .eq('cycles.year', year)
      .maybeSingle();

    if (error) {
      console.error({
        service: 'DuplicateCheckService',
        step: 'checkDuplicate',
        employeeId,
        month,
        year,
        error: error.message
      });
      return false;
    }

    return !!data;
  }
}
