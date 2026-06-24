import { supabaseAdmin } from '@lib/supabase';

export class PayrollCycleService {
  static async getAll() {
    const { data, error } = await supabaseAdmin
      .from('payroll_cycles')
      .select('*')
      .order('year', { ascending: false })
      .order('month', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async getById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('payroll_cycles')
      .select(`
        *,
        records:payroll_records(
          *,
          employee:employees(id, first_name, last_name, email)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async create(data: any) {
    // Validation: No duplicate cycle for same month/year/name
    const { data: existing } = await supabaseAdmin
      .from('payroll_cycles')
      .select('id')
      .eq('month', data.month)
      .eq('year', data.year)
      .eq('cycle_name', data.cycle_name)
      .maybeSingle();

    if (existing) throw new Error('Payroll cycle for this month/year already exists');

    const { data: cycle, error } = await supabaseAdmin
      .from('payroll_cycles')
      .insert([data])
      .select()
      .single();
    
    if (error) throw error;
    return cycle;
  }

  static async update(id: string, data: any) {
    const { data: cycle, error } = await supabaseAdmin
      .from('payroll_cycles')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return cycle;
  }
}
