import { supabaseAdmin } from '@lib/supabase';

export class PayrollSnapshotService {
  /**
   * Creates an immutable snapshot of salary structure and components for a payroll record.
   */
  static async createSnapshot(
    payrollRecordId: string,
    structure: any,
    components: any[]
  ) {
    const snapshot = {
      payroll_record_id: payrollRecordId,
      salary_structure_snapshot: structure,
      component_snapshot: components.map(c => ({
          id: c.component.id,
          code: c.component.code,
          name: c.component.name,
          category: c.component.component_category,
          calculation_type: c.component.calculation_type
      })),
      formula_snapshot: components.reduce((acc, c) => {
          acc[c.component.code] = c.formula_override || c.component.formula;
          return acc;
      }, {} as any)
    };

    const { error } = await supabaseAdmin
      .from('payroll_snapshots')
      .insert([snapshot]);

    if (error) {
      console.error('Error creating payroll snapshot:', error);
      throw error;
    }
  }

  /**
   * Retrieves a snapshot for a specific payroll record.
   */
  static async getSnapshot(payrollRecordId: string) {
    const { data, error } = await supabaseAdmin
      .from('payroll_snapshots')
      .select('*')
      .eq('payroll_record_id', payrollRecordId)
      .maybeSingle();

    if (error) throw error;
    return data;
  }
}
