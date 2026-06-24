import { Request, Response } from 'express';
import { supabaseAdmin } from '@lib/supabase';
import { PayrollReopenService } from '../services/workflow/payroll-reopen.service';

export class GovernanceController {
  // Variances
  static async getVariances(req: Request, res: Response) {
    try {
      const { data, error } = await supabaseAdmin
        .from('payroll_variances')
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

  // Reopens
  static async requestReopen(req: Request, res: Response) {
    try {
      const { cycleId, reason } = req.body;
      const userId = (req as any).user.id;
      const request = await PayrollReopenService.requestReopen(cycleId, userId, reason);
      res.status(201).json(request);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async getReopenRequests(req: Request, res: Response) {
    try {
      const { data, error } = await supabaseAdmin
        .from('payroll_reopen_requests')
        .select(`
          *,
          cycle:payroll_cycles(cycle_name),
          requester:employees(first_name, last_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  // Notifications
  static async getNotifications(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const { data, error } = await supabaseAdmin
        .from('payroll_notifications')
        .select('*')
        .eq('recipient_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async markNotificationRead(req: Request, res: Response) {
    try {
      await supabaseAdmin
        .from('payroll_notifications')
        .update({ is_read: true })
        .eq('id', req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
