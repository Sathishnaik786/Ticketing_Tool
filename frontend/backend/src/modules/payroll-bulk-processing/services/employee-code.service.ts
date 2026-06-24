import { supabaseAdmin } from '@lib/supabase';

export class EmployeeCodeService {
  /**
   * Generates the next sequential employee code.
   * Aligned with Enterprise Numeric Standards.
   */
  static async generateNextCode(): Promise<string> {
    const { data, error } = await supabaseAdmin.rpc('get_next_employee_code');
    
    if (error) {
      const { count } = await supabaseAdmin.from('employees').select('*', { count: 'exact', head: true });
      const nextNum = 153500 + (count || 0) + 1; // Starting from a realistic base if seq fails
      return nextNum.toString();
    }

    return data.toString();
  }

  /**
   * Ensures every employee has a canonical numeric code.
   */
  static async backfillMissingCodes() {
    const { data: employees, error } = await supabaseAdmin
      .from('employees')
      .select('id, employee_id, employee_code')
      .is('employee_code', null);

    if (error) throw error;
    if (!employees || employees.length === 0) return { count: 0 };

    console.log(`Backfilling numeric codes for ${employees.length} employees...`);
    
    let updatedCount = 0;
    for (let i = 0; i < employees.length; i++) {
        const emp = employees[i];
        // Use existing numeric ID if available, else generate
        const code = emp.employee_id || (153500 + i + 1).toString();
        
        const { error: upError } = await supabaseAdmin
            .from('employees')
            .update({ employee_code: code })
            .eq('id', emp.id);
            
        if (!upError) updatedCount++;
    }

    return { count: updatedCount };
  }
}
