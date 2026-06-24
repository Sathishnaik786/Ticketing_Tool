import { supabaseAdmin } from '@lib/supabase';
import { SalaryComponent } from '../types/payroll.types';

export class SalaryComponentRepository {
  static async findAll() {
    const { data, error } = await supabaseAdmin
      .from('salary_components')
      .select('*')
      .order('display_order', { ascending: true });
    
    if (error) throw error;
    return data;
  }

  static async findById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('salary_components')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async create(component: Partial<SalaryComponent>) {
    const { data, error } = await supabaseAdmin
      .from('salary_components')
      .insert([component])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async update(id: string, component: Partial<SalaryComponent>) {
    const { data, error } = await supabaseAdmin
      .from('salary_components')
      .update(component)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async delete(id: string) {
    const { error } = await supabaseAdmin
      .from('salary_components')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  static async findByCode(code: string) {
    const { data, error } = await supabaseAdmin
      .from('salary_components')
      .select('*')
      .eq('code', code)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }
}
