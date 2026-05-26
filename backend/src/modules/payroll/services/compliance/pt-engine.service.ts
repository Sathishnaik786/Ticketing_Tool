import { ComplianceRuleService } from './compliance-rule.service';

export class PTEngineService {
  /**
   * Calculates Professional Tax.
   * Standard: Slab based on state.
   */
  static async calculate(employeeId: string, grossSalary: number, stateCode?: string) {
    // In a real system, we'd filter by stateCode
    const rules = await ComplianceRuleService.getActiveRules('PT');
    
    // Find the matching slab
    const matchingRule = rules.find(r => 
      grossSalary >= r.minimum_limit && 
      (r.maximum_limit === 0 || grossSalary <= r.maximum_limit)
    );

    if (!matchingRule) return { employee_amount: 0, employer_amount: 0, rule_snapshot: null };

    return {
      employee_amount: matchingRule.fixed_amount || 0,
      employer_amount: 0,
      rule_snapshot: matchingRule
    };
  }
}
