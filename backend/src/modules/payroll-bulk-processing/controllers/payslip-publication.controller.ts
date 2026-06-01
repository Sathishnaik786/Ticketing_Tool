import { Request, Response } from 'express';
import { PayslipPublicationService } from '../services/payslip-publication.service';
import { supabaseAdmin } from '@lib/supabase';

export class PayslipPublicationController {
  
  /**
   * [ADMIN/HR] Publish a single document
   */
  static async publishDocument(req: Request, res: Response) {
    try {
      const { recordId } = req.params;
      const user = (req as any).user;

      if (!recordId) {
        return res.status(400).json({ error: 'Record ID is required' });
      }

      const document = await PayslipPublicationService.publishDocument(recordId, user.id);
      
      return res.status(200).json({
        message: 'Payslip published successfully',
        data: document
      });
    } catch (error: any) {
      console.error('[PayslipPublicationController] publishDocument error', error);
      return res.status(500).json({ error: error.message || 'Failed to publish document' });
    }
  }

  /**
   * [ADMIN/HR] Publish an entire commitment batch
   */
  static async publishBatch(req: Request, res: Response) {
    try {
      const { commitmentId } = req.params;
      const user = (req as any).user;

      if (!commitmentId) {
        return res.status(400).json({ error: 'Commitment ID is required' });
      }

      const result = await PayslipPublicationService.publishBatch(commitmentId, user.id);
      
      return res.status(200).json({
        message: `Successfully published ${result.publishedCount} payslips`,
        data: result
      });
    } catch (error: any) {
      console.error('[PayslipPublicationController] publishBatch error', error);
      return res.status(500).json({ error: error.message || 'Failed to publish batch' });
    }
  }

  /**
   * [EMPLOYEE] Get my published payslips
   */
  static async getMyPayslips(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      // We need the employee UUID corresponding to this user.
      const { data: employee, error: empError } = await supabaseAdmin
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (empError || !employee) {
        return res.status(404).json({ error: 'Employee profile not found for this user' });
      }

      const payslips = await PayslipPublicationService.getMyPayslips(employee.id);
      
      return res.status(200).json({
        message: 'Payslips fetched successfully',
        data: payslips
      });
    } catch (error: any) {
      console.error('[PayslipPublicationController] getMyPayslips error', error);
      return res.status(500).json({ error: error.message || 'Failed to fetch payslips' });
    }
  }

  /**
   * [EMPLOYEE] View a published payslip (logs audit and returns URL)
   */
  static async viewPayslip(req: Request, res: Response) {
    try {
      const { documentId } = req.params;
      const user = (req as any).user;

      const { data: employee } = await supabaseAdmin
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!employee) return res.status(404).json({ error: 'Employee not found' });

      const result = await PayslipPublicationService.recordViewAndGetUrl(documentId, employee.id);
      
      return res.status(200).json({ data: result });
    } catch (error: any) {
      console.error('[PayslipPublicationController] viewPayslip error', error);
      return res.status(500).json({ error: error.message || 'Failed to view payslip' });
    }
  }

  /**
   * [EMPLOYEE] Download a published payslip (logs audit and returns URL)
   */
  static async downloadPayslip(req: Request, res: Response) {
    try {
      const { documentId } = req.params;
      const user = (req as any).user;

      const { data: employee } = await supabaseAdmin
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!employee) return res.status(404).json({ error: 'Employee not found' });

      const result = await PayslipPublicationService.recordDownloadAndGetUrl(documentId, employee.id);
      
      return res.status(200).json({ data: result });
    } catch (error: any) {
      console.error('[PayslipPublicationController] downloadPayslip error', error);
      return res.status(500).json({ error: error.message || 'Failed to download payslip' });
    }
  }
}
