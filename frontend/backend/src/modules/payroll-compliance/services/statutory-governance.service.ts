import { supabaseAdmin } from '@lib/supabase';

export class StatutoryGovernanceService {
  /**
   * Calculates EPF contributions (Employee & Employer).
   */
  static async calculateEPF(employeeId: string, pfBaseSalary: number) {
    const { data: profile, error } = await supabaseAdmin
      .from('employee_pf_profiles')
      .select('*')
      .eq('employee_id', employeeId)
      .maybeSingle();

    if (error || !profile || !profile.pf_eligible) return { employeePF: 0, employerPF: 0 };

    // wage ceiling (15,000 INR)
    const ceiling = 15000;
    const base = profile.pf_wage_ceiling_applicable ? Math.min(pfBaseSalary, ceiling) : pfBaseSalary;

    const employeePF = base * 0.12;
    const vpf = base * (Number(profile.voluntary_pf_rate) / 100);
    
    // Employer part: 12% total (3.67% EPF + 8.33% EPS)
    const employerPF = base * 0.12;

    return {
      employeePF: employeePF + vpf,
      employerPF,
      breakdown: { epf: base * 0.0367, eps: base * 0.0833 }
    };
  }

  /**
   * Calculates ESI contributions.
   */
  static async calculateESI(employeeId: string, grossSalary: number) {
    const { data: profile, error } = await supabaseAdmin
      .from('employee_esi_profiles')
      .select('*')
      .eq('employee_id', employeeId)
      .maybeSingle();

    if (error || !profile || !profile.esi_eligible) return { employeeESI: 0, employerESI: 0 };

    // ESI Wage Limit: 21,000 INR
    if (grossSalary > 21000) return { employeeESI: 0, employerESI: 0 };

    const employeeESI = grossSalary * 0.0075; // 0.75%
    const employerESI = grossSalary * 0.0325; // 3.25%

    return { employeeESI, employerESI };
  }
}
