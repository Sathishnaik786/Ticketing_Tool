import { SalaryStructureRepository } from '../repositories/salary-structure.repository';
import { AuditRepository } from '../repositories/audit.repository';
import { SalaryStructure } from '../types/payroll.types';

export class SalaryStructureService {
  static async getAll() {
    return await SalaryStructureRepository.findAll();
  }

  static async getById(id: string) {
    return await SalaryStructureRepository.findById(id);
  }

  static async create(data: any, userId: string) {
    const { components, ...structureData } = data;
    
    const structure = await SalaryStructureRepository.create({
      ...structureData,
      created_by: userId
    });

    if (components && components.length > 0) {
      await SalaryStructureRepository.addComponents(structure.id, components);
    }

    const fullStructure = await SalaryStructureRepository.findById(structure.id);

    await AuditRepository.log({
      user_id: userId,
      action: 'CREATE',
      entity_type: 'SALARY_STRUCTURE',
      entity_id: structure.id,
      new_value: fullStructure
    });

    return fullStructure;
  }

  static async update(id: string, data: any, userId: string) {
    const oldStructure = await SalaryStructureRepository.findById(id);
    const { components, ...structureData } = data;

    const structure = await SalaryStructureRepository.update(id, structureData);

    if (components) {
      await SalaryStructureRepository.removeComponents(id);
      if (components.length > 0) {
        await SalaryStructureRepository.addComponents(id, components);
      }
    }

    const fullStructure = await SalaryStructureRepository.findById(id);

    await AuditRepository.log({
      user_id: userId,
      action: 'UPDATE',
      entity_type: 'SALARY_STRUCTURE',
      entity_id: id,
      old_value: oldStructure,
      new_value: fullStructure
    });

    return fullStructure;
  }

  static async delete(id: string, userId: string) {
    const oldStructure = await SalaryStructureRepository.findById(id);
    await SalaryStructureRepository.delete(id);
    
    await AuditRepository.log({
      user_id: userId,
      action: 'DELETE',
      entity_type: 'SALARY_STRUCTURE',
      entity_id: id,
      old_value: oldStructure
    });

    return true;
  }
}
