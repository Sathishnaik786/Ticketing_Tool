import { SalaryComponentRepository } from '../repositories/salary-component.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { FormulaValidator } from '../formula-engine/formula-validator';
import { SalaryComponent } from '../types/payroll.types';

export class SalaryComponentService {
  static async getAll() {
    return await SalaryComponentRepository.findAll();
  }

  static async getById(id: string) {
    return await SalaryComponentRepository.findById(id);
  }

  static async create(data: Partial<SalaryComponent>, userId: string) {
    if (data.calculation_type === 'FORMULA' && data.formula) {
      const validation = FormulaValidator.validate(data.formula);
      if (!validation.isValid) {
        throw new Error(`Invalid formula: ${validation.error}`);
      }
    }

    const component = await SalaryComponentRepository.create(data);
    
    await AuditRepository.log({
      user_id: userId,
      action: 'CREATE',
      entity_type: 'SALARY_COMPONENT',
      entity_id: component.id,
      new_value: component
    });

    return component;
  }

  static async update(id: string, data: Partial<SalaryComponent>, userId: string) {
    const oldComponent = await SalaryComponentRepository.findById(id);
    
    if (data.calculation_type === 'FORMULA' && data.formula) {
      const validation = FormulaValidator.validate(data.formula);
      if (!validation.isValid) {
        throw new Error(`Invalid formula: ${validation.error}`);
      }
    }

    const component = await SalaryComponentRepository.update(id, data);
    
    await AuditRepository.log({
      user_id: userId,
      action: 'UPDATE',
      entity_type: 'SALARY_COMPONENT',
      entity_id: id,
      old_value: oldComponent,
      new_value: component
    });

    return component;
  }

  static async delete(id: string, userId: string) {
    const oldComponent = await SalaryComponentRepository.findById(id);
    await SalaryComponentRepository.delete(id);
    
    await AuditRepository.log({
      user_id: userId,
      action: 'DELETE',
      entity_type: 'SALARY_COMPONENT',
      entity_id: id,
      old_value: oldComponent
    });

    return true;
  }
}
