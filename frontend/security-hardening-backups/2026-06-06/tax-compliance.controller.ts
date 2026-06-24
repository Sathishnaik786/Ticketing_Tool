import { Request, Response } from 'express';
import { supabaseAdmin } from '@lib/supabase';

export class TaxComplianceController {
  /**
   * Submit investment declaration for an employee.
   */
  static async submitDeclaration(req: Request, res: Response) {
    try {
      const { employeeId, financialYear, declarations } = req.body;
      const user = (req as any).user;

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
