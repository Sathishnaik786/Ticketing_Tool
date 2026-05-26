import { supabaseAdmin } from '@lib/supabase';

export class ComplianceAuditService {
  /**
   * Scans employees for compliance data gaps.
   */
  static async runComplianceAudit() {
    const { data: employees, error } = await supabaseAdmin
      .from('employees')
      .select(`
        id, first_name, last_name, employee_code,
        tax_profile:employee_tax_profiles(pan_number, aadhaar_number, selected_regime),
        pf_profile:employee_pf_profiles(uan),
        esi_profile:employee_esi_profiles(esi_number)
      `);

    if (error) throw error;

    const audits = [];

    for (const emp of employees) {
      const tax = emp.tax_profile;
      const pf = emp.pf_profile;
      
      // 1. Check for missing PAN
      if (!tax?.pan_number) {
        audits.push({
          employee_id: emp.id,
          audit_type: 'MISSING_DATA',
          severity: 'HIGH',
          description: `Permanent Account Number (PAN) is missing for employee ${emp.employee_code}`
        });
      }

      // 2. Check for missing UAN (if PF eligible)
      if (!pf?.uan) {
        audits.push({
          employee_id: emp.id,
          audit_type: 'MISSING_DATA',
          severity: 'MEDIUM',
          description: `Universal Account Number (UAN) is missing for employee ${emp.employee_code}`
        });
      }
    }

    if (audits.length > 0) {
      await supabaseAdmin.from('payroll_compliance_audits').insert(audits);
    }

    return audits;
  }
}
