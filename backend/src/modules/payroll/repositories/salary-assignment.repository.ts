import { supabaseAdmin } from '@lib/supabase';
import { EmployeeSalaryAssignment } from '../types/payroll.types';

export class SalaryAssignmentRepository {
  static async findAll() {
    const { data, error } = await supabaseAdmin
      .from('employee_salary_assignments')
      .select(`
        *,
        employee:employees(id, first_name, last_name, email),
        structure:salary_structures(id, name)
      `)
      .order('effective_from', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async findByEmployeeId(employeeId: string) {
    const { data, error } = await supabaseAdmin
      .from('employee_salary_assignments')
      .select(`
        *,
        structure:salary_structures(id, name)
      `)
      .eq('employee_id', employeeId)
      .order('effective_from', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async findActiveByEmployeeId(employeeId: string) {
    const { data, error } = await supabaseAdmin
      .from('employee_salary_assignments')
      .select(`
        *,
        structure:salary_structures(
          *,
          components:salary_structure_components(
            *,
            component:salary_components(*)
          )
        )
      `)
      .eq('employee_id', employeeId)
      .eq('status', 'ACTIVE')
      .maybeSingle();
    
    if (error) throw error;
    return data;
  }

  static async create(assignment: Partial<EmployeeSalaryAssignment>) {
    const { data, error } = await supabaseAdmin
      .from('employee_salary_assignments')
      .insert([assignment])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async update(id: string, assignment: Partial<EmployeeSalaryAssignment>) {
    const { data, error } = await supabaseAdmin
      .from('employee_salary_assignments')
      .update(assignment)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async deactivateOthers(employeeId: string, excludeId?: string) {
    let query = supabaseAdmin
      .from('employee_salary_assignments')
      .update({ status: 'INACTIVE' })
      .eq('employee_id', employeeId);
    
    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { error } = await query;
    if (error) throw error;
    return true;
  }
}
