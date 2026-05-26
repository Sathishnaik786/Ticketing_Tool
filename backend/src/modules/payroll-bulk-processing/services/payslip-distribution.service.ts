import { supabaseAdmin } from '@lib/supabase';
import { PayslipStorageService } from './payslip-storage.service';

export class PayslipDistributionService {
  /**
   * Generates a secure signed URL for an Admin/HR to view or download a payslip.
   */
  static async getAdminSignedUrl(recordId: string) {
    // 1. Fetch document metadata
    const { data: document, error } = await supabaseAdmin
      .from('employee_payslip_documents')
      .select(`
        *,
        employee:employees(employee_code, first_name, last_name)
      `)
      .eq('payroll_record_id', recordId)
      .single();

    if (error || !document) {
      throw new Error('Payslip document not found for this record');
    }

    // 2. Generate signed URL from storage
    const result = await PayslipStorageService.getSignedUrl(document.pdf_url);
    console.info("[SIGNED_URL_GENERATED]", { recordId, pdfUrl: document.pdf_url });

    return {
      url: result.signedUrl,
      fileName: `payslip_${document.employee?.employee_code || 'EMP'}_${document.payslip_number}.pdf`,
      metadata: document
    };

  }

  /**
   * Fetches all successful payslip documents for a specific commitment batch.
   */
  static async getBatchDocuments(commitmentId: string) {
    const { data, error } = await supabaseAdmin
      .from('employee_payslip_documents')
      .select(`
        *,
        employee:employees(employee_code, first_name, last_name)
      `)
      .eq('payroll_cycle_id', commitmentId); // Assuming we link by cycle or use audit join

    if (error) throw error;
    return data;
  }
}
