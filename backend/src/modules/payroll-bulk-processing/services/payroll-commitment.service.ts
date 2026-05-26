import { supabaseAdmin } from '@lib/supabase';
import { PayslipGeneratorService } from './payslip-generator.service';
import { PayslipStorageService } from './payslip-storage.service';
import { MappingStatus } from '../types/bulk-upload.types';

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
        row:payroll_bulk_upload_rows(*)
      `)
      .eq('row.upload_id', uploadId)
      .in('mapping_status', [MappingStatus.MATCHED, MappingStatus.PARTIAL_MATCH]);

    if (mapError) {
      console.error('[PAYROLL_COMMITMENT] Mapping fetch failure:', mapError);
      throw mapError;
    }

    console.info("[PAYROLL_COMMIT_STARTED]", { uploadId, userId, previewId: preview.id });

    let successfulCount = 0;
    let failedCount = 0;

    for (const mapping of mappings) {
      const employeeId = mapping.employee_id;
      const row = mapping.row;
      
      try {
        // 4. Extract Calculation Details from Preview Metadata
        const rowDetails = preview.metadata?.calculatedDetails?.find((d: any) => d.rowId === row.id);
        
        // 5. Create Core Payroll Record (Accounting Phase - MUST SUCCEED)
        const { data: payrollRecord, error: prError } = await supabaseAdmin
          .from('payroll_records')
          .insert({
            employee_id: employeeId,
            gross_salary: rowDetails?.gross || row.gross_salary,
            net_salary: rowDetails?.net || row.net_salary,
            status: 'PROCESSED',
            is_locked: true,
            metadata: {
              ...(rowDetails || {}),
              commitment_id: commitment.id,
              upload_id: uploadId
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

        // 6. Document Generation Phase (Non-blocking for accounting)
        try {
            console.info("[PAYSLIP_RENDER_START]", row.employee_code);
            const payslipNumber = `PAY-${row.payroll_year}${row.payroll_month.toString().padStart(2, '0')}-${employeeId.substring(0, 4)}-${Math.floor(Math.random() * 1000)}`;
            
            // Resolve employee identity from DB first, falling back to Excel raw data
            let employeeName = '';
            let designation = '';
            let department = '';

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
                if (dbEmp.first_name || dbEmp.last_name) {
                  employeeName = `${dbEmp.first_name || ''} ${dbEmp.last_name || ''}`.trim();
                }
                if (dbEmp.position) {
                  designation = dbEmp.position;
                }
                if (dbEmp.department && (dbEmp.department as any).name) {
                  department = (dbEmp.department as any).name;
                }
              }
            } catch (err) {
              console.warn('[DB_EMPLOYEE_FETCH_WARN] Failed to query employee details from database:', err);
            }

            // Fallback to Excel upload columns if database fields are blank
            if (!employeeName && row.employee_name) {
              employeeName = row.employee_name;
            }
            if (!designation && row.designation) {
              designation = row.designation;
            }
            if (!department && row.department) {
              department = row.department;
            }

            // Absolute fallback values for validation safety
            if (!employeeName) employeeName = 'Employee';
            if (!designation) designation = 'Staff Member';
            if (!department) department = 'Operations';

            const payslipData = {
              ...row,
              payslipNumber,
              employeeName,
              employeeCode: row.employee_code,
              designation,
              department,
              payrollMonth: row.payroll_month,
              payrollYear: row.payroll_year,
              basic: rowDetails?.base || 0,
              hra: rowDetails?.hra || 0,
              specialAllowance: rowDetails?.specialAllowance || 0,
              bonus: rowDetails?.additions?.bonus || 0,
              incentives: rowDetails?.additions?.incentives || 0,
              overtime: rowDetails?.additions?.overtime || 0,
              otherAdditions: rowDetails?.additions?.other || 0,
              variablePay: rowDetails?.additions?.variable || 0,
              pf: rowDetails?.deductions?.pf || 0,
              esi: rowDetails?.deductions?.esi || 0,
              professionalTax: rowDetails?.deductions?.pt || 0,
              incomeTax: rowDetails?.deductions?.tds || 0,
              otherDeductions: rowDetails?.deductions?.other || 0,
              grossSalary: rowDetails?.gross || 0,
              netSalary: rowDetails?.net || 0,
              totalDeductions: (rowDetails?.gross || 0) - (rowDetails?.net || 0),
              pan: rowDetails?.metadata?.pan || 'N/A',
              uan: rowDetails?.metadata?.uan || 'N/A',
              bankName: rowDetails?.metadata?.bankName || 'N/A',
              bankAccount: rowDetails?.metadata?.bankAccount || 'N/A'
            };

            const { buffer, hash, token } = await PayslipGeneratorService.generatePayslip(payslipData);
            console.info("[PDF_RENDER_SUCCESS]", { employeeId, bufferLength: buffer.length });

            // 7. Upload PDF to Storage
            const fileName = `${payslipNumber}.pdf`;
            const pdfPath = await PayslipStorageService.uploadPayslip({
              employeeId: employeeId,
              fileName,
              buffer
            });
            console.info("[PDF_STORAGE_UPLOAD_SUCCESS]", { employeeId, pdfPath });

            // 8. Register Payslip Document
            await supabaseAdmin
              .from('employee_payslip_documents')
              .insert({
                employee_id: employeeId,
                payroll_record_id: payrollRecord.id,
                payroll_cycle_id: commitment.id,
                payslip_number: payslipNumber,
                pdf_url: pdfPath,
                pdf_hash: hash,
                verification_token: token,
                generated_by: userId,
                generated_at: new Date().toISOString()
              });

            // 9. Update Accounting Record with Document State
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

            // 10. Log individual success
            await supabaseAdmin.from('payroll_commitment_audits').insert({
              commitment_id: commitment.id,
              employee_id: employeeId,
              action_type: 'PAYSLIP_GENERATED',
              performed_by: userId,
              metadata: { payslipNumber, pdfPath }
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

    // 10. Update Commitment Completion Status
    // Final Audit: Count actual document success/failure across the batch
    const { data: batchRecords } = await supabaseAdmin
      .from('payroll_records')
      .select('document_status')
      .in('employee_id', mappings.map(m => m.employee_id));

    const totalDocSucceeded = batchRecords?.filter(r => r.document_status === 'GENERATED').length || 0;
    const totalDocFailed = batchRecords?.filter(r => r.document_status === 'FAILED').length || 0;
    
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
   * This is idempotent and does not create new accounting entries.
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

    // 1. Find employees in this batch who have a payroll record but NO payslip document
    const { data: mappings, error: mError } = await supabaseAdmin
      .from('payroll_bulk_row_mappings')
      .select(`
        *,
        row:payroll_bulk_upload_rows(*)
      `)
      .eq('row.upload_id', commitment.upload_id)
      .in('mapping_status', [MappingStatus.MATCHED, MappingStatus.PARTIAL_MATCH]);

    if (mError) throw mError;

    let recoveredCount = 0;

    for (const mapping of mappings) {
      const employeeId = mapping.employee_id;
      const row = mapping.row;

      try {
        // Check if payroll_record exists
        const { data: payrollRecord } = await supabaseAdmin
          .from('payroll_records')
          .select('id')
          .eq('employee_id', employeeId)
          // Ideally we match by month/year here to be precise
          .eq('gross_salary', row.gross_salary)
          .order('processed_at', { ascending: false })
          .limit(1)
          .single();

        if (!payrollRecord) {
            console.log(`[PAYROLL_RETRY] Skipping ${employeeId} - No accounting record found. Needs full commit.`);
            continue;
        }

        // Check if payslip already exists
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

        // REUSE THE DOCUMENT GENERATION LOGIC
        const rowDetails = preview.metadata?.calculatedDetails?.find((d: any) => d.rowId === row.id);
        const payslipNumber = `PAY-${row.payroll_year}${row.payroll_month.toString().padStart(2, '0')}-${employeeId.substring(0, 4)}-RETRY-${Math.floor(Math.random() * 1000)}`;
        
        const payslipData = {
          ...row,
          payslipNumber,
          employeeName: row.employee_name,
          employeeCode: row.employee_code,
          designation: row.designation,
          department: row.department,
          payrollMonth: row.payroll_month,
          payrollYear: row.payroll_year,
          basic: rowDetails?.base || 0,
          hra: rowDetails?.hra || 0,
          specialAllowance: rowDetails?.specialAllowance || 0,
          bonus: rowDetails?.additions?.bonus || 0,
          incentives: rowDetails?.additions?.incentives || 0,
          overtime: rowDetails?.additions?.overtime || 0,
          otherAdditions: rowDetails?.additions?.other || 0,
          variablePay: rowDetails?.additions?.variable || 0,
          pf: rowDetails?.deductions?.pf || 0,
          esi: rowDetails?.deductions?.esi || 0,
          professionalTax: rowDetails?.deductions?.pt || 0,
          incomeTax: rowDetails?.deductions?.tds || 0,
          otherDeductions: rowDetails?.deductions?.other || 0,
          grossSalary: rowDetails?.gross || 0,
          netSalary: rowDetails?.net || 0,
          totalDeductions: (rowDetails?.gross || 0) - (rowDetails?.net || 0),
          pan: rowDetails?.metadata?.pan || 'N/A',
          uan: rowDetails?.metadata?.uan || 'N/A',
          bankName: rowDetails?.metadata?.bankName || 'N/A',
          bankAccount: rowDetails?.metadata?.bankAccount || 'N/A'
        };

        const { buffer, hash, token } = await PayslipGeneratorService.generatePayslip(payslipData);
        const fileName = `${payslipNumber}.pdf`;
        const pdfPath = await PayslipStorageService.uploadPayslip({ employeeId, fileName, buffer });

        await supabaseAdmin.from('employee_payslip_documents').insert({
            employee_id: employeeId,
            payroll_record_id: payrollRecord.id,
            payroll_cycle_id: commitmentId,
            payslip_number: payslipNumber,
            pdf_url: pdfPath,
            pdf_hash: hash,
            verification_token: token,
            generated_by: userId,
            generated_at: new Date().toISOString()
        });

        // Update Accounting Record with Recovered Document State
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
            metadata: { payslipNumber, pdfPath }
        });

        recoveredCount++;

      } catch (err: any) {
        console.error(`[PAYROLL_RETRY] Failed recovery for ${employeeId}:`, err);
      }
    }

    // 2. Final Summary Reconciliation
    // Recalculate based on actual document persistence for this upload
    const { data: finalRecords } = await supabaseAdmin
      .from('payroll_records')
      .select('document_status')
      .in('employee_id', mappings.map(m => m.employee_id));

    const totalSucceeded = finalRecords?.filter(r => r.document_status === 'GENERATED').length || 0;
    const totalUnresolved = finalRecords?.filter(r => r.document_status === 'FAILED' || r.document_status === 'PENDING').length || 0;
    
    // Status is only COMPLETED if there are ZERO FAILED/PENDING documents
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
