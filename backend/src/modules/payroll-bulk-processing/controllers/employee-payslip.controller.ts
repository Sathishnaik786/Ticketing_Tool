import { Request, Response } from 'express';
import { EmployeeDistributionService } from '../services/employee-distribution.service';

export class EmployeePayslipController {
  /**
   * Get all payslips for the authenticated employee.
   */
  static async listMyPayslips(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const payslips = await EmployeeDistributionService.getEmployeePayslips(user.id);
      res.json(payslips);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Get secure download link for a payslip.
   */
  static async getDownloadLink(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const url = await EmployeeDistributionService.getSecureDownloadLink(id, user.id);
      res.json({ url });
    } catch (error: any) {
      res.status(403).json({ message: error.message });
    }
  }
}
