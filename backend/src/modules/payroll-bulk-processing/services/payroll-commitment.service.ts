// @ts-ignore
import { supabaseAdmin as _supabaseAdmin } from '@lib/supabase';
// @ts-ignore
const supabaseAdmin: any = _supabaseAdmin;
import { PayslipGeneratorService, ResolvedPayslipRenderPayload, CompanyPayrollConfig } from './payslip-generator.service';
import { PayslipStorageService } from './payslip-storage.service';
import { MappingStatus } from '../types/bulk-upload.types';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const getMonthName = (monthNumber: number): string => {
  if (!monthNumber || monthNumber < 1 || monthNumber > 12) return String(monthNumber);
  return MONTH_NAMES[monthNumber - 1];
};

async function fetchCompanyConfig(): Promise<CompanyPayrollConfig> {
  let activeTemplate: any = null;
  try {
    const { data: dbTemplate } = await supabaseAdmin
      .from('payslip_templates')
      .select('*')
      .eq('is_active', true)
      .maybeSingle();
    
    activeTemplate = dbTemplate;
  } catch (err) {
    console.warn('[PAYSLIP_TEMPLATE_RESOLUTION] Failed to query active template, applying corporate defaults:', err);
  }

  return {
    primaryColor: activeTemplate?.theme_colors?.primary || '#0f172a',
    secondaryColor: activeTemplate?.theme_colors?.secondary || '#475569',
    accentColor: activeTemplate?.theme_colors?.accent || '#10b981',
    fontFamily: activeTemplate?.font_family || 'Inter',
    watermarkText: activeTemplate?.watermark_text !== undefined ? activeTemplate?.watermark_text : 'CONFIDENTIAL',
    organizationName: activeTemplate?.organization_name || 'YVI Enterprise EMS',
    companyAddress: activeTemplate?.company_address || '123 Enterprise Corporate Boulevard, Tech Park, Suite 400',
    footerText: activeTemplate?.footer_text || 'This is a computer-generated document and does not require a physical signature.',
    logoUrl: activeTemplate?.logo_url || '',
    bankSectionEnabled: activeTemplate?.bank_section_enabled !== false,
    statutorySectionEnabled: activeTemplate?.statutory_section_enabled !== false,
    signatureEnabled: activeTemplate?.signature_enabled !== false,
    qrVerificationEnabled: activeTemplate?.qr_verification_enabled !== false
  };
}

async function buildRenderPayload(
    employeeId: string, 
    row: any, 
    rowDetails: any, 
    companyConfig: CompanyPayrollConfig,
    isRetry: boolean = false
): Promise<ResolvedPayslipRenderPayload> {
    const payslipNumber = `PAY-${row.payroll_year}${row.payroll_month.toString().padStart(2, '0')}-${employeeId.substring(0, 4)}-${isRetry ? 'RETRY-' : ''}${Math.floor(Math.random() * 1000)}`;

    let employeeName = row.employee_name || row.raw_data?.employeeName;
    let designation = row.designation || row.raw_data?.designation;
    let department = row.department || row.raw_data?.department;

    if (!employeeName || !designation || !department) {
        try {
          const { data: dbEmp } = await supabaseAdmin
            .from('employees')
            .select(`
              first_name, 
              last_name, 
              position, 
              department:departments(name)
            `)
            .eq('id', employeeId)
            .maybeSingle();

          if (dbEmp) {
            if (!employeeName && (dbEmp.first_name || dbEmp.last_name)) {
              employeeName = `${dbEmp.first_name || ''} ${dbEmp.last_name || ''}`.trim();
            }
            if (!designation && dbEmp.position) designation = dbEmp.position;
            if (!department && dbEmp.department && (dbEmp.department as any).name) {
              department = (dbEmp.department as any).name;
            }
          }
        } catch (err) {
          console.warn('[DB_EMPLOYEE_FETCH_WARN] Failed to query employee fallback details:', err);
        }
    }

    if (!employeeName) employeeName = 'Employee';
    if (!designation) designation = 'Staff Member';
    if (!department) department = 'Operations';

    const resolvedMonth = getMonthName(row.payroll_month);
    const gross = rowDetails?.gross || row.gross_salary || 0;
    const net = rowDetails?.net || row.net_salary || 0;

    return {
      templateVersion: 'v1',
      payslipNumber,
      resolvedEmployeeName: employeeName,
      resolvedEmployeeCode: row.employee_code,
      resolvedDesignation: designation,
      resolvedDepartment: department,
      resolvedMonth,
      resolvedYear: row.payroll_year,
      totalWorkingDays: row.total_working_days || row.raw_data?.totalWorkingDays || 0,
      payableDays: row.payable_days || row.raw_data?.payableDays || 0,
      lopDays: row.lop_days || row.raw_data?.lopDays || 0,
      
      basic: rowDetails?.base || row.raw_data?.basic || 0,
      hra: rowDetails?.hra || row.raw_data?.hra || 0,
      specialAllowance: rowDetails?.specialAllowance || row.raw_data?.specialAllowance || 0,
      bonus: rowDetails?.additions?.bonus || row.raw_data?.bonus || 0,
      incentives: rowDetails?.additions?.incentives || row.raw_data?.incentives || 0,
      overtime: rowDetails?.additions?.overtime || row.raw_data?.overtime || 0,
      otherAdditions: rowDetails?.additions?.other || row.raw_data?.otherAdditions || 0,
      variablePay: rowDetails?.additions?.variable || row.raw_data?.variablePay || 0,

      pf: rowDetails?.deductions?.pf || row.raw_data?.pf || 0,
      esi: rowDetails?.deductions?.esi || row.raw_data?.esi || 0,
      professionalTax: rowDetails?.deductions?.pt || row.raw_data?.professionalTax || 0,
      incomeTax: rowDetails?.deductions?.tds || row.raw_data?.incomeTax || 0,
      otherDeductions: rowDetails?.deductions?.other || row.raw_data?.otherDeductions || 0,

      grossSalary: gross,
      totalDeductions: gross - net,
      netSalary: net,

      resolvedPAN: row.pan || row.raw_data?.pan || rowDetails?.metadata?.pan || 'N/A',
      resolvedUAN: row.uan || row.raw_data?.uan || rowDetails?.metadata?.uan || 'N/A',
      resolvedBankName: row.bank_name || row.raw_data?.bankName || rowDetails?.metadata?.bankName || 'N/A',
      resolvedAccountNumber: row.bank_account || row.raw_data?.bankAccount || rowDetails?.metadata?.bankAccount || 'N/A',
      resolvedIFSC: row.ifsc_code || row.raw_data?.ifscCode || rowDetails?.metadata?.ifscCode || 'N/A',

      companyConfig
    };
}

export class PayrollCommitmentService {
  /**
   * Commits an upload batch into the core payroll engine and generates payslips.
   */
  static async commitUpload(uploadId: string, userId: string) {
    // 1. Verify Preview Status is READY
    const { data: preview, error: previewError } = await supabaseAdmin
      .from('payroll_bulk_preview_summaries')
      .select('*')
      .eq('upload_id', uploadId)
      .single();

    if (previewError || !preview) throw new Error('Preview not found for this upload');
    if (preview.preview_status !== 'READY') {
      throw new Error(`Upload is not ready for commitment. Status: ${preview.preview_status}`);
    }

    // 2. Initialize Commitment Record
    const { data: commitment, error: commitError } = await supabaseAdmin
      .from('payroll_bulk_commitments')
      .insert({
        upload_id: uploadId,
        commitment_status: 'PROCESSING',
        total_committed: 0,
        total_failed: 0,
        gross_total: preview.gross_total,
        net_total: preview.net_total,
        committed_by: userId,
        committed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (commitError) throw commitError;

    // 3. Fetch all mapped rows (Including Partial Matches)
    const { data: mappings, error: mapError } = await supabaseAdmin
      .from('payroll_bulk_row_mappings')
      .select(`
        *,
        row:payroll_bulk_upload_rows!inner(*)
      `)
      .eq('row.upload_id', uploadId)
      .in('mapping_status', [MappingStatus.MATCHED, MappingStatus.PARTIAL_MATCH]);

    if (mapError) {
      console.error('[PAYROLL_COMMITMENT] Mapping fetch failure:', mapError);
      throw mapError;
    }

    console.info("[PAYROLL_COMMIT_STARTED]", { uploadId, userId, previewId: preview.id });

    // Fetch config once per batch
    const companyConfig = await fetchCompanyConfig();

    let successfulCount = 0;
    let failedCount = 0;

    for (const mapping of mappings) {
      const employeeId = mapping.employee_id;
      const row = mapping.row;
      
      try {
        // 4. Extract Calculation Details from Preview Metadata
        const rowDetails = preview.metadata?.calculatedDetails?.find((d: any) => d.rowId === row.id);
        
        // 5. Build Hardened Render Payload FIRST
        const renderPayload = await buildRenderPayload(employeeId, row, rowDetails, companyConfig, false);

        // 6. Create Core Payroll Record (Accounting Phase - MUST SUCCEED)
        const { data: payrollRecord, error: prError } = await supabaseAdmin
          .from('payroll_records')
          .insert({
            employee_id: employeeId,
            gross_salary: renderPayload.grossSalary,
            net_salary: renderPayload.netSalary,
            status: 'PROCESSED',
            is_locked: true,
            metadata: {
              ...(rowDetails || {}),
              commitment_id: commitment.id,
              upload_id: uploadId,
              render_payload: renderPayload
            },
            processed_at: new Date().toISOString()
          })
          .select()
          .single();

        if (prError) {
          console.error(`[PAYROLL_COMMITMENT] [ACCOUNTING_FAILURE] Employee: ${employeeId}`, prError);
          throw prError; 
        }

        console.log(`[PAYROLL_COMMITMENT] [ACCOUNTING_SUCCESS] Record Created: ${payrollRecord.id}`);
        successfulCount++;

        // 7. Document Generation Phase (Non-blocking for accounting)
        try {
            console.info("[PAYSLIP_RENDER_START]", row.employee_code);

            const { buffer, hash, token } = await PayslipGeneratorService.generatePayslip(renderPayload);
            console.info("[PDF_RENDER_SUCCESS]", { employeeId, bufferLength: buffer.length });

            // 8. Upload PDF to Storage
            const fileName = `${renderPayload.payslipNumber}.pdf`;
            const pdfPath = await PayslipStorageService.uploadPayslip({
              employeeId: employeeId,
              fileName,
              buffer
            });
            console.info("[PDF_STORAGE_UPLOAD_SUCCESS]", { employeeId, pdfPath });

            // 9. Register Payslip Document
            await supabaseAdmin
              .from('employee_payslip_documents')
              .insert({
                employee_id: employeeId,
                payroll_record_id: payrollRecord.id,
                payroll_cycle_id: commitment.id,
                payslip_number: renderPayload.payslipNumber,
                pdf_url: pdfPath,
                pdf_hash: hash,
                verification_token: token,
                generated_by: userId,
                generated_at: new Date().toISOString()
              });

            // 10. Update Accounting Record with Document State
            const { error: updateError } = await supabaseAdmin
              .from('payroll_records')
              .update({
                document_status: 'GENERATED',
                pdf_generated_at: new Date().toISOString(),
                storage_path: pdfPath,
                generation_error: null
              })
              .eq('id', payrollRecord.id);

            if (updateError) {
                console.error("[PAYROLL_RECORD_UPDATE_FAILURE]", { recordId: payrollRecord.id, error: updateError });
                throw updateError;
            }
            console.info("[PAYROLL_RECORD_UPDATED]", { recordId: payrollRecord.id, status: 'GENERATED' });

            // 11. Log individual success
            await supabaseAdmin.from('payroll_commitment_audits').insert({
              commitment_id: commitment.id,
              employee_id: employeeId,
              action_type: 'PAYSLIP_GENERATED',
              performed_by: userId,
              metadata: { payslipNumber: renderPayload.payslipNumber, pdfPath }
            });

        } catch (docErr: any) {
            console.error("[PAYSLIP_ENGINE_FAILURE]", { employeeId, error: docErr.message });
            
            // Mark the document as failed in the accounting record for retry logic
            await supabaseAdmin
              .from('payroll_records')
              .update({
                document_status: 'FAILED',
                generation_error: docErr.message
              })
              .eq('id', payrollRecord.id);

            await supabaseAdmin.from('payroll_commitment_audits').insert({
                commitment_id: commitment.id,
                employee_id: employeeId,
                action_type: 'DOCUMENT_FAILED',
                performed_by: userId,
                metadata: { error: docErr.message, stage: 'DOCUMENTATION' }
            });
        }

      } catch (err: any) {
        console.error(`[PAYROLL_COMMITMENT_CRITICAL] Failed for mapping ${mapping.id}:`, err);
        failedCount++;
        
        await supabaseAdmin.from('payroll_commitment_audits').insert({
          commitment_id: commitment.id,
          employee_id: employeeId,
          action_type: 'COMMIT_FAILED',
          performed_by: userId,
          metadata: { error: err.message, stage: 'ACCOUNTING' }
        });
      }
    }

    // 12. Update Commitment Completion Status
    const { data: batchRecords } = await supabaseAdmin
      .from('payroll_records')
      .select('document_status')
      .in('employee_id', mappings.map((m: any) => m.employee_id));

    const totalDocSucceeded = batchRecords?.filter((r: any) => r.document_status === 'GENERATED').length || 0;
    const totalDocFailed = batchRecords?.filter((r: any) => r.document_status === 'FAILED').length || 0;
    
    const finalStatus = (failedCount > 0 || totalDocFailed > 0)
        ? (successfulCount > 0 ? 'PARTIAL_FAILURE' : 'FAILED')
        : 'COMPLETED';
    
    console.log(`[PAYROLL_COMMITMENT] Batch Finalized. Status: ${finalStatus} (S: ${totalDocSucceeded}, F: ${totalDocFailed})`);

    await supabaseAdmin
      .from('payroll_bulk_commitments')
      .update({
        commitment_status: finalStatus,
        total_committed: totalDocSucceeded,
        total_failed: totalDocFailed + failedCount
      })
      .eq('id', commitment.id);

    return {
      commitmentId: commitment.id,
      successfulCount: totalDocSucceeded,
      failedCount: totalDocFailed + failedCount,
      status: finalStatus
    };
  }

  /**
   * Retries payslip generation for employees who have a payroll_record but no payslip.
   */
  static async retryPayslipGeneration(commitmentId: string, userId: string) {
    console.log(`[PAYROLL_RETRY] Initiating recovery for commitment: ${commitmentId}`);

    const { data: commitment, error: cError } = await supabaseAdmin
      .from('payroll_bulk_commitments')
      .select('*, preview:payroll_bulk_preview_summaries(*)')
      .eq('id', commitmentId)
      .single();

    if (cError || !commitment) throw new Error('Commitment record not found');
    const preview = commitment.preview;

    const { data: mappings, error: mError } = await supabaseAdmin
      .from('payroll_bulk_row_mappings')
      .select(`
        *,
        row:payroll_bulk_upload_rows!inner(*)
      `)
      .eq('row.upload_id', commitment.upload_id)
      .in('mapping_status', [MappingStatus.MATCHED, MappingStatus.PARTIAL_MATCH]);

    if (mError) throw mError;

    // Fetch config once per batch
    const companyConfig = await fetchCompanyConfig();
    let recoveredCount = 0;

    for (const mapping of mappings) {
      const employeeId = mapping.employee_id;
      const row = mapping.row;

      try {
        const { data: payrollRecord } = await supabaseAdmin
          .from('payroll_records')
          .select('id, metadata')
          .eq('employee_id', employeeId)
          .eq('gross_salary', row.gross_salary)
          .order('processed_at', { ascending: false })
          .limit(1)
          .single();

        if (!payrollRecord) {
            console.log(`[PAYROLL_RETRY] Skipping ${employeeId} - No accounting record found. Needs full commit.`);
            continue;
        }

        const { data: existingDoc } = await supabaseAdmin
          .from('employee_payslip_documents')
          .select('id')
          .eq('payroll_record_id', payrollRecord.id)
          .single();

        if (existingDoc) {
            console.log(`[PAYROLL_RETRY] Skipping ${employeeId} - Payslip already exists.`);
            continue;
        }

        console.log(`[PAYROLL_RETRY] Attempting recovery for ${employeeId}`);

        // Extract or rebuild the payload
        let renderPayload = (payrollRecord.metadata as any)?.render_payload;
        if (!renderPayload) {
            const rowDetails = preview.metadata?.calculatedDetails?.find((d: any) => d.rowId === row.id);
            renderPayload = await buildRenderPayload(employeeId, row, rowDetails, companyConfig, true);
            
            // Backfill the payload if it was missing
            await supabaseAdmin
              .from('payroll_records')
              .update({
                metadata: {
                  ...payrollRecord.metadata,
                  render_payload: renderPayload
                }
              })
              .eq('id', payrollRecord.id);
        }

        const { buffer, hash, token } = await PayslipGeneratorService.generatePayslip(renderPayload);
        const fileName = `${renderPayload.payslipNumber}.pdf`;
        const pdfPath = await PayslipStorageService.uploadPayslip({ employeeId, fileName, buffer });

        await supabaseAdmin.from('employee_payslip_documents').insert({
            employee_id: employeeId,
            payroll_record_id: payrollRecord.id,
            payroll_cycle_id: commitmentId,
            payslip_number: renderPayload.payslipNumber,
            pdf_url: pdfPath,
            pdf_hash: hash,
            verification_token: token,
            generated_by: userId,
            generated_at: new Date().toISOString()
        });

        await supabaseAdmin
          .from('payroll_records')
          .update({
            document_status: 'GENERATED',
            pdf_generated_at: new Date().toISOString(),
            storage_path: pdfPath,
            generation_error: null
          })
          .eq('id', payrollRecord.id);

        await supabaseAdmin.from('payroll_commitment_audits').insert({
            commitment_id: commitmentId,
            employee_id: employeeId,
            action_type: 'PAYSLIP_RECOVERED',
            performed_by: userId,
            metadata: { payslipNumber: renderPayload.payslipNumber, pdfPath }
        });

        recoveredCount++;

      } catch (err: any) {
        console.error(`[PAYROLL_RETRY] Failed recovery for ${employeeId}:`, err);
      }
    }

    const { data: finalRecords } = await supabaseAdmin
      .from('payroll_records')
      .select('document_status')
      .in('employee_id', mappings.map((m: any) => m.employee_id));

    const totalSucceeded = finalRecords?.filter((r: any) => r.document_status === 'GENERATED').length || 0;
    const totalUnresolved = finalRecords?.filter((r: any) => r.document_status === 'FAILED' || r.document_status === 'PENDING').length || 0;
    
    const finalStatus = totalUnresolved === 0 ? 'COMPLETED' : 'PARTIAL_FAILURE';

    console.info(`[PAYROLL_RETRY_RECONCILE] Succeeded=${totalSucceeded}, Unresolved=${totalUnresolved}, Status=${finalStatus}`);

    await supabaseAdmin
      .from('payroll_bulk_commitments')
      .update({
        total_committed: totalSucceeded,
        total_failed: totalUnresolved,
        commitment_status: finalStatus
      })
      .eq('id', commitmentId);

    console.log(`[PAYROLL_RETRY] Recovery cycle complete. Recovered: ${recoveredCount}`);
    return { recoveredCount };
  }
}
