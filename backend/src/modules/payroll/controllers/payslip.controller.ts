import { Request, Response } from 'express';
import { PayslipGeneratorService } from '../services/payslip-engine/payslip-generator.service';
import { supabaseAdmin } from '@lib/supabase';

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
      res.json(data);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }
}
