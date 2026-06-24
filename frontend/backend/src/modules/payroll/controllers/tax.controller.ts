import { Request, Response } from 'express';
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

export class TaxController {
  static async getSlabs(req: Request, res: Response) {
    try {
      const { data, error } = await supabaseAdmin
        .from('tax_slabs')
        .select('*')
        .order('minimum_income', { ascending: true });
      
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async createSlab(req: Request, res: Response) {
    try {
      const { data, error } = await supabaseAdmin
        .from('tax_slabs')
        .insert([req.body])
        .select()
        .single();
      
      if (error) throw error;
      res.status(201).json(data);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getEmployeeProfile(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const employeeId = req.params.employeeId;

      if (!canViewAllPayroll(user) && String(employeeId) !== String(user.employeeId)) {
        return denyPayrollAccess(req, res, employeeId, 'tax_profile_employee_mismatch');
      }

      const { data, error } = await supabaseAdmin
        .from('employee_tax_profiles')
        .select('*')
        .eq('employee_id', employeeId)
        .maybeSingle();
      
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async updateEmployeeProfile(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const employeeId = req.params.employeeId;

      if (!canViewAllPayroll(user) && String(employeeId) !== String(user.employeeId)) {
        return denyPayrollAccess(req, res, employeeId, 'tax_profile_update_employee_mismatch');
      }

      const { data, error } = await supabaseAdmin
        .from('employee_tax_profiles')
        .upsert({ ...req.body, employee_id: employeeId }, { onConflict: 'employee_id' })
        .select()
        .single();
      
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
