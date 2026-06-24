import { Request, Response } from 'express';
import { supabaseAdmin } from '@lib/supabase';
import { DisbursementService } from '../services/finance/disbursement.service';

export class DisbursementController {
  static async getDisbursements(req: Request, res: Response) {
    try {
      const { data, error } = await supabaseAdmin
        .from('payroll_disbursements')
        .select(`
          *,
          record:payroll_records(
            *,
            employee:employees(first_name, last_name)
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async initiate(req: Request, res: Response) {
    try {
      const { cycleId } = req.params;
      await DisbursementService.initiateDisbursements(cycleId as string);
      res.json({ message: 'Disbursements initiated successfully' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async processBatch(req: Request, res: Response) {
    try {
      const { ids } = req.body;
      await DisbursementService.processBatch(ids);
      res.json({ message: 'Batch processed successfully' });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
