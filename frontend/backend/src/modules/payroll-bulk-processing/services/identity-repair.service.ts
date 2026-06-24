import { supabaseAdmin } from '@lib/supabase';
import { PayrollIdentityService } from './payroll-identity.service';

export class IdentityRepairService {
  /**
   * Performs a safe, atomic repair of all payroll identity fields.
   * Aligned with Real Numeric Employee Codes.
   */
  static async repairAllIdentities(performedBy: string) {
    console.log('[REPAIR] Starting Enterprise Identity Repair...');
    
    // 1. Fetch all employees with their department names
    const { data: employees, error: fetchError } = await supabaseAdmin
      .from('employees')
      .select('id, first_name, last_name, employee_id, employee_code, position, departments(name)');

    if (fetchError) throw fetchError;
    if (!employees) return { count: 0 };

    let successCount = 0;
    let errorCount = 0;

    for (const emp of employees) {
      try {
        // Source of Truth: employee_id field (usually contains 153532, etc)
        const rawCode = (emp.employee_id || emp.employee_code || '').toString().trim();
        
        // If code is missing, we skip this for now or log it
        if (!rawCode) {
            console.warn(`[REPAIR] Skipping ${emp.id} - No numeric code found.`);
            errorCount++;
            continue;
        }

        const code = rawCode;
        
        // Normalize using EXPLICIT source fields
        const firstName = (emp.first_name || '').toUpperCase().trim();
        const lastName = (emp.last_name || '').toUpperCase().trim();
        const deptName = (emp as any).departments?.name || 'UNASSIGNED';
        const position = emp.position || 'UNASSIGNED';

        const nFullName = PayrollIdentityService.normalize(`${firstName} ${lastName}`);
        const nDept = PayrollIdentityService.normalize(deptName);
        const nPos = PayrollIdentityService.normalize(position);
        
        // Canonical Key: CODE|NAME (Numeric Code + Underscore Name)
        const identityKey = PayrollIdentityService.generateIdentityKey(code, `${firstName} ${lastName}`);

        console.log(`[REPAIR] Aligning Identity: ${firstName} ${lastName} [${code}]`);

        // 2. Perform EXPLICIT named update to prevent positional shifting
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
          .eq('id', emp.id);

        if (updateError) {
          console.error(`[REPAIR] Update Failed for ${emp.id}:`, updateError.message);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (err: any) {
        console.error(`[REPAIR] Runtime error for ${emp.id}:`, err.message);
        errorCount++;
      }
    }

    // 3. Log completion
    await supabaseAdmin.from('payroll_commitment_audits').insert({
      action_type: 'IDENTITY_REPAIR_COMPLETE',
      performed_by: performedBy,
      metadata: { 
        successCount, 
        errorCount, 
        reason: 'Numeric Code Alignment',
        timestamp: new Date().toISOString() 
      }
    });

    return { successCount, errorCount };
  }

  /**
   * Validates the integrity of the payroll identity data.
   */
  static async validateIntegrity() {
    const { data: employees, error } = await supabaseAdmin
      .from('employees')
      .select('id, employee_code, normalized_full_name, payroll_identity_key');

    if (error) throw error;

    const issues = {
      nullCodes: 0,
      duplicateCodes: new Set<string>(),
      malformedKeys: 0,
      total: employees.length
    };

    const codes = new Set<string>();

    employees.forEach(emp => {
      if (!emp.employee_code) issues.nullCodes++;
      if (emp.employee_code && codes.has(emp.employee_code)) {
          issues.duplicateCodes.add(emp.employee_code);
      }
      if (emp.employee_code) codes.add(emp.employee_code);

      if (emp.payroll_identity_key && !emp.payroll_identity_key.includes('|')) {
          issues.malformedKeys++;
      }
    });

    return {
      isValid: issues.nullCodes === 0 && issues.duplicateCodes.size === 0 && issues.malformedKeys === 0,
      issues: {
          nullCodes: issues.nullCodes,
          duplicateCodesCount: issues.duplicateCodes.size,
          malformedKeys: issues.malformedKeys
      }
    };
  }
}
