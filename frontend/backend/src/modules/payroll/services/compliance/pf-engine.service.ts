import { ComplianceRuleService } from './compliance-rule.service';
import { FormulaEvaluator } from '../../formula-engine/formula-evaluator';

export class PFEngineService {
  /**
   * Calculates Provident Fund contribution.
   * Standard: 12% of Basic Pay (or capped limit).
   */
  static async calculate(employeeId: string, variables: any) {
    const rules = await ComplianceRuleService.getActiveRules('PF');
    if (rules.length === 0) return { employee_amount: 0, employer_amount: 0, rule: null };

    const rule = rules[0]; // Assuming one active PF rule
    const pfSalary = variables.BASIC || 0;
    
    // Apply wage ceiling if applicable
    const eligibleSalary = rule.maximum_limit > 0 
      ? Math.min(pfSalary, rule.maximum_limit) 
      : pfSalary;

    let amount = 0;
    if (rule.calculation_type === 'PERCENTAGE') {
      amount = eligibleSalary * (rule.percentage_value! / 100);
    } else if (rule.calculation_type === 'FORMULA' && rule.formula) {
      amount = FormulaEvaluator.evaluate(rule.formula, { ...variables, ELIGIBLE_SALARY: eligibleSalary });
    }

    return {
      employee_amount: Math.round(amount),
      employer_amount: Math.round(amount), // Standard match
      rule_snapshot: rule
    };
  }
}
