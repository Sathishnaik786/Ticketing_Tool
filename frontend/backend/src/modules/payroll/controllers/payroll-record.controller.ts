import { Request, Response } from 'express';
import { supabaseAdmin } from '@lib/supabase';
import { PayrollPreviewService } from '../services/payroll-processing/payroll-preview.service';
const { hasViewAllAccess, logDeniedAccess } = require('@middlewares/ownership.middleware');

const canViewAllPayroll = (user: any) => hasViewAllAccess(user, {
  allowRoles: ['SUPER_ADMIN', 'ADMIN', 'HR'],
  permissions: ['payroll.view_all', 'payroll.view']
});

const denyPayrollAccess = (req: Request, res: Response, employeeId: string, reason: string) => {
  logDeniedAccess(req, employeeId, reason);
  return res.status(403).json({ success: false, message: 'Access denied' });
};

export class PayrollRecordController {
  static async getAll(req: Request, res: Response) {
    try {
      const { data, error } = await supabaseAdmin
        .from('payroll_records')
        .select(`
          *,
          employee:employees(id, first_name, last_name, email),
          cycle:payroll_cycles(id, cycle_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { data, error } = await supabaseAdmin
        .from('payroll_records')
        .select(`
          *,
          employee:employees(*),
          cycle:payroll_cycles(*),
          components:payroll_component_values(*),
          snapshot:payroll_snapshots(*)
        `)
        .eq('id', req.params.id)
        .single();
      
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  static async getByEmployeeId(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const employeeId = req.params.employeeId;

      if (!canViewAllPayroll(user) && String(employeeId) !== String(user.employeeId)) {
        return denyPayrollAccess(req, res, employeeId, 'payroll_record_employee_mismatch');
      }

      const { data, error } = await supabaseAdmin
        .from('payroll_records')
        .select(`
          *,
          cycle:payroll_cycles(id, cycle_name)
        `)
        .eq('employee_id', employeeId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async preview(req: Request, res: Response) {
    try {
      const { employeeId, startDate, endDate } = req.body;
      const preview = await PayrollPreviewService.preview(employeeId, startDate, endDate);
      res.json(preview);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
