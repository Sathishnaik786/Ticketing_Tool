import { supabaseAdmin } from '@lib/supabase';

export class PayrollSettingsRepository {
  static async findAll() {
    const { data, error } = await supabaseAdmin
      .from('payroll_settings')
      .select('*');
    
    if (error) throw error;
    return data;
  }

  static async findByKey(key: string) {
    const { data, error } = await supabaseAdmin
      .from('payroll_settings')
      .select('*')
      .eq('setting_key', key)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }

  static async update(key: string, value: any) {
    const { data, error } = await supabaseAdmin
      .from('payroll_settings')
      .upsert({ setting_key: key, setting_value: value }, { onConflict: 'setting_key' })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}
