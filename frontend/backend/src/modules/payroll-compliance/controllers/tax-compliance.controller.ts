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

export class TaxComplianceController {
  /**
   * Submit investment declaration for an employee.
   */
  static async submitDeclaration(req: Request, res: Response) {
    try {
      const { employeeId, financialYear, declarations } = req.body;
      const user = (req as any).user;

      if (!canViewAllPayroll(user) && String(employeeId) !== String(user.employeeId)) {
        return denyPayrollAccess(req, res, employeeId, 'investment_declaration_employee_mismatch');
      }

      const { data, error } = await supabaseAdmin
        .from('investment_declarations')
        .upsert({
          employee_id: employeeId,
          financial_year: financialYear,
          ...declarations,
          status: 'SUBMITTED',
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Get employee tax profile with projections.
   */
  static async getTaxProfile(req: Request, res: Response) {
    try {
      const { employeeId } = req.params;
      const user = (req as any).user;

      if (!canViewAllPayroll(user) && String(employeeId) !== String(user.employeeId)) {
        return denyPayrollAccess(req, res, employeeId, 'tax_compliance_profile_employee_mismatch');
      }

      const { data, error } = await supabaseAdmin
        .from('employee_tax_profiles')
        .select('*, declarations:investment_declarations(*)')
        .eq('employee_id', employeeId)
        .maybeSingle();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
