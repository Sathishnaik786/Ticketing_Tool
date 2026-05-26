import { FormulaEvaluator } from '../../formula-engine/formula-evaluator';
import { DependencyResolver } from '../../formula-engine/dependency-resolver';
import { AttendanceSummary } from './attendance.service';

export interface CalculationResult {
  gross_salary: number;
  total_earnings: number;
  total_deductions: number;
  net_salary: number;
  components: Array<{
    component_id: string;
    code: string;
    name: string;
    category: string;
    calculated_amount: number;
    formula_snapshot: string;
    sequence_order: number;
  }>;
}

export class PayrollCalculatorService {
  /**
   * Calculates salary for an employee based on structure and attendance.
   */
  static calculate(
    assignment: any,
    components: any[],
    attendance: AttendanceSummary
  ): CalculationResult {
    const monthlyCtc = Number(assignment.monthly_ctc);
    const annualCtc = Number(assignment.annual_ctc);
    
    // 1. Resolve Calculation Order
    const orderedComponents = DependencyResolver.resolveOrder(components.map(c => ({
      code: c.component.code,
      formula: c.formula_override || c.component.formula,
      calculation_type: c.component.calculation_type
    })) as any);

    // 2. Variable Injection
    const variables: any = {
      CTC: monthlyCtc,
      ANNUAL_CTC: annualCtc,
      WORKING_DAYS: attendance.totalWorkingDays,
      PAYABLE_DAYS: attendance.payableDays,
      LOP_DAYS: attendance.lopDays,
      gross: 0,
      net: 0
    };

    const results: any[] = [];
    let totalEarnings = 0;
    let totalDeductions = 0;

    // 3. Sequential Calculation
    for (const orderedComp of orderedComponents) {
      // Find original component details
      const compConfig = components.find(c => c.component.code === orderedComp.code);
      const formula = orderedComp.formula;
      
      let amount = 0;
      if (compConfig.component.calculation_type === 'FIXED') {
        amount = Number(compConfig.amount || 0); 
      } else if (formula) {
        amount = FormulaEvaluator.evaluate(formula, variables);
      }

      // 4. Apply Attendance Pro-rata (Optional based on component config)
      // Usually Earnings are pro-rated, deductions might not be.
      // For Phase-2, we apply LOP deduction separately or pro-rate Earnings.
      // Let's assume Earnings are pro-rated by (Payable Days / Total Days) if configured.
      // But prompt says: LOP Deduction = (monthly_salary / working_days) * lop_days
      // We will implement LOP as a specific deduction if it exists, or adjust gross.
      
      variables[orderedComp.code] = amount;
      
      if (compConfig.component.component_category === 'EARNING') {
        totalEarnings += amount;
      } else if (compConfig.component.component_category === 'DEDUCTION') {
        totalDeductions += amount;
      }

      results.push({
        component_id: compConfig.component.id,
        code: compConfig.component.code,
        name: compConfig.component.name,
        category: compConfig.component.component_category,
        calculated_amount: amount,
        formula_snapshot: formula || 'FIXED',
        sequence_order: compConfig.sequence_order
      });

      // Update aggregate variables for subsequent formulas
      variables.gross = totalEarnings;
      variables.net = totalEarnings - totalDeductions;
    }

    // 5. Explicit LOP Calculation if not handled in components
    // If LOP_DAYS > 0, we can add an automatic deduction or adjust gross
    const lopDeduction = (monthlyCtc / (attendance.totalWorkingDays || 30)) * attendance.lopDays;
    if (lopDeduction > 0) {
        totalDeductions += lopDeduction;
        results.push({
            component_id: 'LOP_AUTO',
            code: 'LOP',
            name: 'Loss of Pay',
            category: 'DEDUCTION',
            calculated_amount: lopDeduction,
            formula_snapshot: '(monthly_ctc / working_days) * lop_days',
            sequence_order: 999
        });
    }

    const netSalary = totalEarnings - totalDeductions;

    return {
      gross_salary: totalEarnings,
      total_earnings: totalEarnings,
      total_deductions: totalDeductions,
      net_salary: Math.max(0, netSalary),
      components: results
    };
  }
}
