import { supabaseAdmin } from '@lib/supabase';
import { SalaryStructure } from '../types/payroll.types';

export class SalaryStructureRepository {
  static async findAll() {
    const { data, error } = await supabaseAdmin
      .from('salary_structures')
      .select(`
        *,
        components:salary_structure_components(
          *,
          component:salary_components(*)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async findById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('salary_structures')
      .select(`
        *,
        components:salary_structure_components(
          *,
          component:salary_components(*)
        )
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async create(structure: Partial<SalaryStructure>) {
    const { data, error } = await supabaseAdmin
      .from('salary_structures')
      .insert([structure])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async update(id: string, structure: Partial<SalaryStructure>) {
    const { data, error } = await supabaseAdmin
      .from('salary_structures')
      .update(structure)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async delete(id: string) {
    const { error } = await supabaseAdmin
      .from('salary_structures')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  // Structure Components Management
  static async addComponents(structureId: string, components: any[]) {
    const { error } = await supabaseAdmin
      .from('salary_structure_components')
      .insert(components.map(c => ({ ...c, salary_structure_id: structureId })));
    
    if (error) throw error;
    return true;
  }

  static async removeComponents(structureId: string) {
    const { error } = await supabaseAdmin
      .from('salary_structure_components')
      .delete()
      .eq('salary_structure_id', structureId);
    
    if (error) throw error;
    return true;
  }
}
