import { supabaseAdmin } from '@lib/supabase';

export class PayrollIdentityService {
  /**
   * Normalizes a string for payroll identity.
   * "Sathish Naik" -> "SATHISH_NAIK"
   */
  static normalize(val: string): string {
    if (!val) return '';
    // Convert to string in case of numeric inputs to prevent numeric values in name fields
    const str = String(val);
    return str
      .toUpperCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^A-Z0-9_]/g, ''); // Remove special chars
  }

  /**
   * Generates a unique payroll identity key.
   * Format: CODE|NORMALIZED_NAME
   */
  static generateIdentityKey(code: string, name: string): string {
    const nCode = String(code).toUpperCase().trim();
    const nName = this.normalize(name);
    return `${nCode}|${nName}`;
  }

  /**
   * Audits all employees for payroll readiness.
   */
  static async auditEmployees(organizationId?: string) {
    let query = supabaseAdmin
      .from('employees')
      .select('id, first_name, last_name, employee_code, employee_id, department_id, position, payroll_identity_key, payroll_eligible, departments(name)');
    
    const { data: employees, error } = await query;
    if (error) throw error;

    const report = {
      totalEmployees: employees.length,
      readyCount: 0,
      missingFields: [] as any[],
      duplicates: [] as any[],
      issues: [] as any[]
    };

    const identityMap = new Map<string, string[]>();

    employees.forEach(emp => {
      const fullName = `${emp.first_name} ${emp.last_name}`;
      const deptName = emp.departments?.name || '';
      const code = emp.employee_code || '';
      
      const missing = [];
      if (!code) missing.push('employee_code');
      if (!emp.first_name || !emp.last_name) missing.push('name');
      if (!deptName) missing.push('department');
      if (!emp.payroll_identity_key) missing.push('payroll_identity_key');

      if (missing.length > 0 || !emp.payroll_eligible) {
        report.missingFields.push({
          id: emp.id,
          name: fullName,
          fields: missing,
          eligible: emp.payroll_eligible,
          existingCode: emp.employee_id // Show the real ID if we have it
        });
      } else {
        report.readyCount++;
      }

      // Duplicate detection on identity key
      if (emp.payroll_identity_key) {
        if (identityMap.has(emp.payroll_identity_key)) {
            identityMap.get(emp.payroll_identity_key)?.push(emp.id);
        } else {
            identityMap.set(emp.payroll_identity_key, [emp.id]);
        }
      }
    });

    identityMap.forEach((ids, key) => {
      if (ids.length > 1) {
        report.duplicates.push({
          identityKey: key,
          employeeIds: ids
        });
      }
    });

    return report;
  }

  /**
   * Safely normalizes employee data and updates the identity key.
   * Aligned with Enterprise Numeric Employee Codes.
   */
  static async normalizeEmployee(employeeId: string, performedBy: string) {
    const { data: emp, error: fetchError } = await supabaseAdmin
      .from('employees')
      .select('*, departments(name)')
      .eq('id', employeeId)
      .single();

    if (fetchError || !emp) throw new Error('Employee not found');

    // 1. Identify Real Employee Code
    // We prioritize existing employee_id column which holds the numeric identifiers (153532, etc)
    const code = (emp.employee_id || emp.employee_code || '').toString().trim();
    if (!code) throw new Error(`Employee ${emp.id} has no numeric code (employee_id) assigned.`);

    const nFirstName = (emp.first_name || '').toUpperCase().trim();
    const nLastName = (emp.last_name || '').toUpperCase().trim();
    const nFullName = this.normalize(`${nFirstName} ${nLastName}`);
    
    // Explicit department normalization
    const deptSource = (emp.departments as any)?.name || 'UNASSIGNED';
    const nDept = this.normalize(deptSource);
    const nPos = this.normalize(emp.position || 'UNASSIGNED');

    const identityKey = this.generateIdentityKey(code, `${nFirstName} ${nLastName}`);

    const { error: updateError } = await supabaseAdmin
      .from('employees')
      .update({
        employee_code: code,
        normalized_full_name: nFullName,
        normalized_department: nDept,
        normalized_designation: nPos,
        payroll_identity_key: identityKey,
        payroll_eligible: true
      })
      .eq('id', employeeId);

    if (updateError) throw updateError;

    // Log the change
    await supabaseAdmin.from('payroll_commitment_audits').insert({
      action_type: 'IDENTITY_STANDARDIZATION',
      employee_id: employeeId,
      performed_by: performedBy,
      old_state: { code: emp.employee_code, key: emp.payroll_identity_key },
      new_state: { code, key: identityKey, normalized: nFullName },
      metadata: { reason: 'Real Numeric Employee Code Alignment' }
    });

    return { success: true, identityKey };
  }
}
