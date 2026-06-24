import { ComplianceRuleService } from './compliance-rule.service';

export class ESIEngineService {
  /**
   * Calculates Employee State Insurance.
   * Standard: 0.75% Employee, 3.25% Employer if Gross <= 21000.
   */
  static async calculate(employeeId: string, grossSalary: number) {
    const rules = await ComplianceRuleService.getActiveRules('ESI');
    if (rules.length === 0) return { employee_amount: 0, employer_amount: 0, rule: null };

    const rule = rules[0];
    
    // Check eligibility
    if (rule.maximum_limit > 0 && grossSalary > rule.maximum_limit) {
      return { employee_amount: 0, employer_amount: 0, rule_snapshot: rule };
    }

    const employeePercentage = rule.percentage_value || 0.75;
    const employerPercentage = 3.25; // Often fixed or separate rule

    return {
      employee_amount: Math.ceil(grossSalary * (employeePercentage / 100)),
      employer_amount: Math.ceil(grossSalary * (employerPercentage / 100)),
      rule_snapshot: rule
    };
  }
}
