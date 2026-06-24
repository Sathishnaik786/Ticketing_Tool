import { Request, Response } from 'express';
import { PayrollReconciliationService } from '../services/payroll-reconciliation.service';
import { VarianceDetectionService } from '../services/variance-detection.service';
import { PayrollClosureService } from '../services/payroll-closure.service';
import { supabaseAdmin } from '@lib/supabase';

export class PayrollFinanceController {
  /**
   * Initializes reconciliation for a commitment.
   */
  static async startReconciliation(req: Request, res: Response) {
    try {
      const { uploadId, commitmentId } = req.body;
      const user = (req as any).user;
      
      const batch = await PayrollReconciliationService.initializeReconciliation(uploadId, commitmentId, user.id);
      
      // Auto-scan for variances
      await VarianceDetectionService.scanForVariances(batch.id);
      
      res.status(201).json(batch);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Gets reconciliation details for a batch.
   */
  static async getReconciliation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { data, error } = await supabaseAdmin
        .from('payroll_reconciliation_batches')
        .select('*, payroll_financial_variances(*)')
        .eq('id', id)
        .single();

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Freezes a payroll upload batch.
   */
  static async freezeBatch(req: Request, res: Response) {
    try {
      const { uploadId } = req.params;
      const { reason } = req.body;
      const user = (req as any).user;

      const result = await PayrollClosureService.freezePayroll(uploadId, user.id, reason);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Gets all variance alerts.
   */
  static async getVariances(req: Request, res: Response) {
    try {
      const { data, error } = await supabaseAdmin
        .from('payroll_financial_variances')
        .select('*, employee:employees(first_name, last_name, employee_code)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
