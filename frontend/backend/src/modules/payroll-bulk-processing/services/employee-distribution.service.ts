import { supabaseAdmin } from '@lib/supabase';
import { PayslipStorageService } from './payslip-storage.service';

export class EmployeeDistributionService {
  /**
   * Fetches payslips for a specific user (by users.id / auth.uid).
   */
  static async getEmployeePayslips(userId: string) {
    // Look up employee.id from users.id
    const { data: employee, error: empError } = await supabaseAdmin
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (empError || !employee) {
      console.warn(`[ESS_PAYSLIPS] No employee profile linked to user ID: ${userId}`);
      return [];
    }

    const { data, error } = await supabaseAdmin
      .from('employee_payslip_documents')
      .select('*')
      .eq('employee_id', employee.id)
      .eq('is_visible_to_employee', true)
      .order('generated_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  /**
   * Gets a secure download link for a payslip.
   */
  static async getSecureDownloadLink(payslipId: string, userId: string) {
    // Look up employee.id from users.id
    const { data: employee, error: empError } = await supabaseAdmin
      .from('employees')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (empError || !employee) throw new Error('Employee profile not found');

    // Verify ownership
    const { data: payslip, error: fetchError } = await supabaseAdmin
      .from('employee_payslip_documents')
      .select('pdf_url, employee_id')
      .eq('id', payslipId)
      .single();

    if (fetchError || !payslip) throw new Error('Payslip not found');
    if (payslip.employee_id !== employee.id) throw new Error('Access denied');

    // Generate signed URL
    const result = await PayslipStorageService.getSignedUrl(payslip.pdf_url);
    return result.signedUrl;
  }

}
