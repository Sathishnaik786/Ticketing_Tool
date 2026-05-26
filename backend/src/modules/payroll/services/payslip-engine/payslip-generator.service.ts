import { supabaseAdmin } from '@lib/supabase';
import { PayslipTemplateService } from './payslip-template.service';
import { PDFRendererService } from './pdf-renderer.service';
import crypto from 'crypto';

export class PayslipGeneratorService {
  /**
   * Generates a payslip from snapshots and saves it to storage.
   */
  static async generate(payrollRecordId: string, generatedBy: string) {
    // 1. Fetch Snapshot Data (Immutability Rule)
    const { data: record, error: recordError } = await supabaseAdmin
      .from('payroll_records')
      .select(`
        *,
        employee:employees(*),
        cycle:payroll_cycles(*),
        components:payroll_component_values(*),
        statutory:statutory_deductions(*)
      `)
      .eq('id', payrollRecordId)
      .single();

    if (recordError || !record) throw new Error('Payroll record not found');

    // 2. Prepare Template Data
    const html = PayslipTemplateService.getTemplate({
      employee: record.employee,
      record: record,
      components: record.components,
      statutory: record.statutory,
      cycle: record.cycle
    });

    // 3. Render PDF
    const pdfBuffer = await PDFRendererService.render(html);
    
    // 4. Generate Hash & Token
    const hash = crypto.createHash('sha256').update(pdfBuffer).digest('hex');
    const token = crypto.randomBytes(16).toString('hex');
    const payslipNumber = `PS-${record.cycle.year}${record.cycle.month}-${record.employee.id.slice(0,4)}`;

    // 5. Upload to Storage (Mocking URL for now, in real would use Supabase Storage)
    const fileName = `${payslipNumber}.pdf`;
    const fileUrl = `https://storage.yvi.app/payslips/${fileName}`; 

    // 6. Save to Database
    const { data: payslip, error: payslipError } = await supabaseAdmin
      .from('payslips')
      .upsert({
        payroll_record_id: payrollRecordId,
        payslip_number: payslipNumber,
        file_url: fileUrl,
        file_name: fileName,
        generated_by: generatedBy,
        document_hash: hash,
        verification_token: token
      }, { onConflict: 'payroll_record_id' })
      .select()
      .single();

    if (payslipError) throw payslipError;

    // 7. Add to Payroll Documents
    await supabaseAdmin
      .from('payroll_documents')
      .insert([{
        employee_id: record.employee_id,
        payroll_record_id: record.id,
        document_type: 'PAYSLIP',
        document_name: `Payslip - ${record.cycle.cycle_name}`,
        document_url: fileUrl,
        metadata: { hash, token }
      }]);

    return payslip;
  }
}
