import { PFEngineService } from './pf-engine.service';
import { ESIEngineService } from './esi-engine.service';
import { PTEngineService } from './pt-engine.service';
import { TDSEngineService } from './tds-engine.service';
import { EmployerContributionService } from './employer-contribution.service';
import { supabaseAdmin } from '@lib/supabase';

export class ComplianceOrchestrator {
  /**
   * Calculates all statutory deductions and contributions for an employee.
   */
  static async process(employeeId: string, payrollRecordId: string, variables: any, grossSalary: number) {
    // 1. Calculate Deductions
    const pf = await PFEngineService.calculate(employeeId, variables);
    const esi = await ESIEngineService.calculate(employeeId, grossSalary);
    const pt = await PTEngineService.calculate(employeeId, grossSalary);
    const tds = await TDSEngineService.calculate(employeeId, grossSalary);

    const deductions = [
      { type: 'PF', ...pf },
      { type: 'ESI', ...esi },
      { type: 'PT', ...pt },
      { type: 'TDS', ...tds }
    ].filter(d => d.employee_amount > 0 || d.employer_amount > 0);

    // 2. Save Statutory Deductions
    if (deductions.length > 0) {
      await supabaseAdmin.from('statutory_deductions').insert(
        deductions.map(d => ({
          payroll_record_id: payrollRecordId,
          deduction_type: d.type,
          rule_snapshot: d.rule_snapshot || { type: d.type, regime: (d as any).tax_regime },
          employee_amount: d.employee_amount,
          employer_amount: d.employer_amount
        }))
      );
    }

    // 3. Calculate & Save Employer Contributions
    const contributions = await EmployerContributionService.calculateAll(employeeId, variables, grossSalary);
    if (contributions.length > 0) {
      await supabaseAdmin.from('employer_contributions').insert(
        contributions.map(c => ({
          payroll_record_id: payrollRecordId,
          contribution_type: c.type,
          formula_snapshot: c.rule_snapshot,
          amount: c.amount
        }))
      );
    }

    // 4. Return Total Employee Deductions to adjust Net Salary
    const totalEmployeeDeductions = deductions.reduce((sum, d) => sum + d.employee_amount, 0);
    const totalEmployerContributions = contributions.reduce((sum, c) => sum + c.amount, 0);

    return {
      totalEmployeeDeductions,
      totalEmployerContributions,
      breakdown: deductions
    };
  }
}
