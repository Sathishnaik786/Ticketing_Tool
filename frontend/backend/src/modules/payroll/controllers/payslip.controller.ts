import { Request, Response } from 'express';
import { PayslipGeneratorService } from '../services/payslip-engine/payslip-generator.service';
import { supabaseAdmin } from '@lib/supabase';
const { hasViewAllAccess, logDeniedAccess } = require('@middlewares/ownership.middleware');

const canViewAllPayroll = (user: any) => hasViewAllAccess(user, {
  allowRoles: ['SUPER_ADMIN', 'ADMIN', 'HR'],
  permissions: ['payroll.view_all', 'payroll.view']
});

const denyPayrollAccess = (req: Request, res: Response, employeeId: string, reason: string) => {
  logDeniedAccess(req, employeeId, reason);
  return res.status(403).json({ success: false, message: 'Access denied' });
};

export class PayslipController {
  static async generate(req: Request, res: Response) {
    try {
      const { payrollRecordId } = req.params;
      const userId = (req as any).user.id;
      const payslip = await PayslipGeneratorService.generate(payrollRecordId, userId);
      res.json(payslip);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getByEmployee(req: Request, res: Response) {
    try {
      const { employeeId } = req.params;
      const user = (req as any).user;

      if (!canViewAllPayroll(user) && String(employeeId) !== String(user.employeeId)) {
        return denyPayrollAccess(req, res, employeeId, 'payslip_employee_mismatch');
      }

      const { data, error } = await supabaseAdmin
        .from('payslips')
        .select(`
          *,
          record:payroll_records(
            *,
            cycle:payroll_cycles(cycle_name)
          )
        `)
        .eq('record.employee_id', employeeId)
        .order('generated_at', { ascending: false });
      
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { data, error } = await supabaseAdmin
        .from('payslips')
        .select(`
          *,
          record:payroll_records(
            *,
            employee:employees(*),
            cycle:payroll_cycles(*),
            components:payroll_component_values(*),
            statutory:statutory_deductions(*)
          )
        `)
        .eq('id', req.params.id)
        .single();
      
      if (error) throw error;
      const recordEmployeeId = (data as any)?.record?.employee_id;
      if (!canViewAllPayroll(user) && String(recordEmployeeId) !== String(user.employeeId)) {
        return denyPayrollAccess(req, res, recordEmployeeId, 'payslip_detail_employee_mismatch');
      }

      res.json(data);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }
}
