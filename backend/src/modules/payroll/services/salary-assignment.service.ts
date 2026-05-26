import { SalaryAssignmentRepository } from '../repositories/salary-assignment.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { FormulaEvaluator } from '../formula-engine/formula-evaluator';
import { DependencyResolver } from '../formula-engine/dependency-resolver';
import { EmployeeSalaryAssignment } from '../types/payroll.types';

export class SalaryAssignmentService {
  static async getAll() {
    return await SalaryAssignmentRepository.findAll();
  }

  static async getByEmployeeId(employeeId: string) {
    return await SalaryAssignmentRepository.findByEmployeeId(employeeId);
  }

  static async create(data: Partial<EmployeeSalaryAssignment>, userId: string) {
    // 1. Deactivate existing active assignment for this employee
    if (data.employee_id) {
      await SalaryAssignmentRepository.deactivateOthers(data.employee_id);
    }

    // 2. Create new assignment
    const assignment = await SalaryAssignmentRepository.create({
      ...data,
      status: 'ACTIVE'
    });

    await AuditRepository.log({
      user_id: userId,
      action: 'CREATE',
      entity_type: 'SALARY_ASSIGNMENT',
      entity_id: assignment.id,
      new_value: assignment
    });

    return assignment;
  }

  static async calculateSalaryPreview(employeeId: string, annualCtc: number, structureId: string) {
    // This is a utility for the frontend to preview how much an employee will get
    // based on a structure and CTC.
    
    // 1. Get structure and its components
    const { SalaryStructureRepository } = await import('../repositories/salary-structure.repository');
    const structure = await SalaryStructureRepository.findById(structureId);
    
    if (!structure || !structure.components) {
      throw new Error('Salary structure not found or has no components');
    }

    const components = structure.components.map((sc: any) => ({
      ...sc.component,
      formula: sc.formula_override || sc.component.formula
    }));

    // 2. Resolve order
    const orderedComponents = DependencyResolver.resolveOrder(components);

    // 3. Evaluate formulas
    const monthlyCtc = annualCtc / 12;
    const variables: any = {
      CTC: monthlyCtc,
      ANNUAL_CTC: annualCtc,
      gross: 0,
      net: 0
    };

    const results = [];
    let gross = 0;
    let totalDeductions = 0;

    for (const comp of orderedComponents) {
      let value = 0;
      if (comp.calculation_type === 'FIXED') {
        value = 0; // Default or from input? Let's assume fixed are manually entered or zero for preview
      } else if (comp.calculation_type === 'PERCENTAGE' || comp.calculation_type === 'FORMULA') {
        if (comp.formula) {
          value = FormulaEvaluator.evaluate(comp.formula, variables);
        }
      }

      variables[comp.code] = value;
      
      if (comp.component_category === 'EARNING') {
        gross += value;
      } else if (comp.component_category === 'DEDUCTION') {
        totalDeductions += value;
      }

      results.push({
        code: comp.code,
        name: comp.name,
        category: comp.component_category,
        value: value
      });

      // Update aggregate variables
      variables.gross = gross;
      variables.net = gross - totalDeductions;
    }

    return {
      monthly_ctc: monthlyCtc,
      gross: gross,
      net: gross - totalDeductions,
      components: results
    };
  }
}
