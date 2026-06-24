import { Request, Response } from 'express';
import { PayrollIdentityService } from '../services/payroll-identity.service';

export class IdentityPreparationController {
  /**
   * Returns a comprehensive report of payroll readiness across all employees.
   */
  static async getReadinessReport(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const report = await PayrollIdentityService.auditEmployees(user.organizationId);
      res.json(report);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Performs standardization on a specific employee.
   */
  static async normalizeEmployee(req: Request, res: Response) {
    try {
      const { employeeId } = req.params;
      const user = (req as any).user;
      
      const result = await PayrollIdentityService.normalizeEmployee(employeeId, user.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Generates missing employee codes for the entire workforce.
   */
  static async backfillCodes(req: Request, res: Response) {
    try {
        const { EmployeeCodeService } = require('../services/employee-code.service');
        const result = await EmployeeCodeService.backfillMissingCodes();
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
  }

  /**
   * Performs a safe, atomic repair of all corrupted identity fields.
   */
  static async repairData(req: Request, res: Response) {
    try {
        const { IdentityRepairService } = require('../services/identity-repair.service');
        const user = (req as any).user;
        const result = await IdentityRepairService.repairAllIdentities(user.id);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
  }

  /**
   * Validates the integrity of the payroll identity data.
   */
  static async validateIntegrity(req: Request, res: Response) {
    try {
        const { IdentityRepairService } = require('../services/identity-repair.service');
        const result = await IdentityRepairService.validateIntegrity();
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
  }
}
