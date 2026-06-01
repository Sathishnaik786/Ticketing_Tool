// @ts-ignore
import { supabaseAdmin as _supabaseAdmin } from '@lib/supabase';
// @ts-ignore
const supabaseAdmin: any = _supabaseAdmin;
import { PayslipStorageService } from './payslip-storage.service';

export class PayslipPublicationService {
  /**
   * Publishes a single payslip document.
   */
  static async publishDocument(recordId: string, publishedBy: string) {
    // 1. Mark as published
    const { data: document, error } = await supabaseAdmin
      .from('employee_payslip_documents')
      .update({
        is_published: true,
        published_at: new Date().toISOString(),
        published_by: publishedBy
      })
      .eq('payroll_record_id', recordId)
      .select('*, employee:employees(user_id, employee_code, first_name, last_name)')
      .single();

    if (error || !document) {
      throw new Error('Failed to publish payslip document: ' + (error?.message || 'Not found'));
    }

    // 2. Log Audit
    await this.logAudit('PAYSLIP_PUBLISHED', document.employee_id, document.id, publishedBy);

    // 3. (Optional) Fire notification if user_id exists
    // In a real app, integrate with your notification/Socket.IO service here
    if (document.employee && (document.employee as any).user_id) {
       console.info(`[NOTIFICATION_EMITTED] Payslip published for employee ${document.employee_id}`);
    }

    return document;
  }

  /**
   * Publishes all unpublished documents in a specific commitment batch.
   */
  static async publishBatch(commitmentId: string, publishedBy: string) {
    // Note: Depends on how commitmentId is linked. We assume `payroll_cycle_id`.
    
    // 1. Get unpublished docs
    const { data: docsToPublish, error: fetchError } = await supabaseAdmin
      .from('employee_payslip_documents')
      .select('id, employee_id')
      .eq('payroll_cycle_id', commitmentId)
      .eq('is_published', false);

    if (fetchError) throw fetchError;
    if (!docsToPublish || docsToPublish.length === 0) return { publishedCount: 0 };

    // 2. Update them
    const { error: updateError } = await supabaseAdmin
      .from('employee_payslip_documents')
      .update({
        is_published: true,
        published_at: new Date().toISOString(),
        published_by: publishedBy
      })
      .eq('payroll_cycle_id', commitmentId)
      .eq('is_published', false);

    if (updateError) throw updateError;

    // 3. Log Audits in bulk
    const audits = docsToPublish.map((doc: any) => ({
      event_type: 'PAYSLIP_PUBLISHED',
      employee_id: doc.employee_id,
      document_id: doc.id,
      user_id: publishedBy,
      created_at: new Date().toISOString()
    }));

    await supabaseAdmin.from('payslip_publication_audits').insert(audits);

    return { publishedCount: docsToPublish.length };
  }

  /**
   * Logs a view and retrieves a signed URL for the employee.
   */
  static async recordViewAndGetUrl(documentId: string, employeeId: string) {
    const { data: document, error } = await supabaseAdmin
      .from('employee_payslip_documents')
      .update({ viewed_at: new Date().toISOString() })
      .eq('id', documentId)
      .eq('employee_id', employeeId)
      .eq('is_published', true)
      .select()
      .single();

    if (error || !document) throw new Error('Document not found or access denied');

    await this.logAudit('PAYSLIP_VIEWED', employeeId, documentId, employeeId);
    
    const result = await PayslipStorageService.getSignedUrl(document.pdf_url);
    return { url: result.signedUrl };
  }

  /**
   * Logs a download and retrieves a signed URL.
   */
  static async recordDownloadAndGetUrl(documentId: string, employeeId: string) {
    // Atomic increment using RPC or fetch+update
    const { data: document, error } = await supabaseAdmin
      .from('employee_payslip_documents')
      .select('download_count, pdf_url')
      .eq('id', documentId)
      .eq('employee_id', employeeId)
      .eq('is_published', true)
      .single();

    if (error || !document) throw new Error('Document not found or access denied');

    await supabaseAdmin
      .from('employee_payslip_documents')
      .update({ download_count: document.download_count + 1 })
      .eq('id', documentId);

    await this.logAudit('PAYSLIP_DOWNLOADED', employeeId, documentId, employeeId);

    const result = await PayslipStorageService.getSignedUrl(document.pdf_url);
    return { url: result.signedUrl };
  }

  static async getMyPayslips(employeeId: string) {
    const { data: documents, error } = await supabaseAdmin
      .from('employee_payslip_documents')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('is_published', true)
      .order('published_at', { ascending: false });

    if (error) throw error;
    if (!documents || documents.length === 0) return [];

    const recordIds = documents.map((d: any) => d.payroll_record_id).filter(Boolean);
    let payrollRecordsMap: Record<string, any> = {};

    if (recordIds.length > 0) {
      const { data: records } = await supabaseAdmin
        .from('payroll_records')
        .select('id, net_salary, metadata')
        .in('id', recordIds);
      
      if (records) {
        payrollRecordsMap = records.reduce((acc: any, r: any) => {
          acc[r.id] = r;
          return acc;
        }, {});
      }
    }

    return documents.map((doc: any) => {
      const pr = payrollRecordsMap[doc.payroll_record_id] || {};
      const payload = pr.metadata?.render_payload || {};
      
      const monthStr = payload.resolvedMonth || 'January';
      const yearStr = payload.resolvedYear || new Date().getFullYear();
      const periodStartDate = new Date(`1 ${monthStr} ${yearStr}`).toISOString();

      return {
        ...doc,
        payroll_records: {
          net_payable: pr.net_salary || 0,
          period_start_date: periodStartDate
        }
      };
    });
  }

  private static async logAudit(eventType: string, employeeId: string, documentId: string, userId: string) {
    try {
      const { error } = await supabaseAdmin.from('payslip_publication_audits').insert({
        event_type: eventType,
        employee_id: employeeId,
        document_id: documentId,
        user_id: userId,
        created_at: new Date().toISOString()
      });
      if (error) {
        console.error('[AUDIT_ERROR] Failed to log publication audit', error);
      }
    } catch (err: any) {
      console.error('[AUDIT_ERROR] Exception logging publication audit', err);
    }
  }
}
