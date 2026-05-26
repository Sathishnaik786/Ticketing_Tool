import { supabaseAdmin } from '@lib/supabase';
import { MappingStatus } from '../types/bulk-upload.types';
import { StatutoryGovernanceService } from '../../payroll-compliance/services/statutory-governance.service';
import { TDSEngineService } from '../../payroll-compliance/services/tds-engine.service';

export class PayrollPreviewService {
  /**
   * Generates a preview summary for the upload batch.
   */
  static async generatePreview(uploadId: string, userId: string) {
    // 1. Fetch rows, mappings, and full employee details for calculation
    const { data: rows, error } = await supabaseAdmin
      .from('payroll_bulk_upload_rows')
      .select(`
        *,
        mapping:payroll_bulk_row_mappings(
          *,
          employee:employees(
            id, first_name, last_name, employee_code, position
          )
        )
      `)
      .eq('upload_id', uploadId);

    if (error) throw error;

    const summary = {
      totalRows: rows.length,
      matchedRows: 0,
      unmatchedRows: 0,
      duplicateRows: 0,
      invalidRows: 0,
      grossTotal: 0,
      netTotal: 0,
      calculatedDetails: [] as any[]
    };

    for (const row of rows) {
      const mapping = row.mapping?.[0];
      const employee = mapping?.employee;
      const status = mapping?.mapping_status || 'NOT_FOUND';
      const raw = row.raw_data as any;

      if (status === MappingStatus.MATCHED || status === MappingStatus.PARTIAL_MATCH) {
        summary.matchedRows++;
        
        // --- EXCEL-DRIVEN SOURCE OF TRUTH CALCULATION ENGINE ---
        // Strictly use Excel row values. Ignore employee master salary.
        
        const basic = Number(raw.basic) || 0;
        const hra = Number(raw.hra) || 0;
        const specialAllowance = Number(raw.specialAllowance) || 0;
        const bonus = Number(raw.bonus) || 0;
        const incentives = Number(raw.incentives) || 0;
        const overtime = Number(raw.overtime) || 0;
        const otherAdditions = Number(raw.otherAdditions) || 0;
        const variablePay = Number(raw.variablePay) || 0;
        
        const pfEmployee = Number(raw.pfEmployee) || 0;
        const pt = Number(raw.professionalTax) || 0;
        const tds = Number(raw.incomeTax) || 0;
        const otherDeductionsValue = Number(raw.otherDeductions) || 0;
        
        // Institutional Validation: Reject if mandatory financial pillars are missing
        if (basic <= 0 && status === MappingStatus.MATCHED) {
            summary.invalidRows++;
            summary.calculatedDetails.push({
                rowId: row.id,
                employeeName: `${employee?.first_name} ${employee?.last_name}`,
                employeeCode: employee?.employee_code || raw.employeeCode,
                calculationStatus: 'VALIDATION_ERROR',
                notes: 'MISSING_BASIC_SALARY',
                gross: 0, net: 0, base: 0, pf: 0, tds: 0, deductions: 0
            });
            continue;
        }

        // 1. Calculate Gross strictly from components (MONTHLY ONLY - NO MULTIPLIERS)
        const calculatedGross = basic + hra + specialAllowance + bonus + incentives + overtime + otherAdditions + variablePay;
        
        // 2. Calculate Total Deductions
        const totalDeductions = pfEmployee + pt + tds + otherDeductionsValue;
        
        // 3. Final Net Payout
        const calculatedNet = calculatedGross - totalDeductions;

        if (calculatedNet < 0) {
            summary.invalidRows++;
            summary.calculatedDetails.push({
                rowId: row.id,
                employeeName: `${employee?.first_name} ${employee?.last_name}`,
                employeeCode: employee?.employee_code || raw.employeeCode,
                calculationStatus: 'INVALID_FINANCIALS',
                notes: 'NEGATIVE_NET_SALARY',
                gross: calculatedGross, net: calculatedNet, base: basic, pf: pfEmployee, tds: tds, deductions: totalDeductions
            });
            continue;
        }

        summary.grossTotal += calculatedGross;
        summary.netTotal += calculatedNet;

        // 4. Persist Granular Snapshot for Immutable Record
        const snapshot = {
          rowId: row.id,
          employeeName: `${employee?.first_name} ${employee?.last_name}`,
          employeeCode: employee?.employee_code || raw.employeeCode,
          calculationStatus: 'VALID',
          gross: calculatedGross,
          net: calculatedNet,
          base: basic,
          hra: hra,
          specialAllowance: specialAllowance,
          additions: { 
            bonus, 
            incentives, 
            overtime, 
            other: otherAdditions,
            variable: variablePay
          },
          deductions: {
            pf: pfEmployee,
            pt: pt,
            tds: tds,
            other: otherDeductionsValue
          },
          metadata: {
            payableDays: Number(raw.payableDays) || 0,
            lopDays: Number(raw.lopDays) || 0,
            pan: raw.pan || employee?.pan_number || 'N/A',
            uan: raw.uan || employee?.uan_number || 'N/A',
            bankName: raw.bankName || employee?.bank_name || 'N/A',
            bankAccount: raw.bankAccount || employee?.bank_account_number || 'N/A',
            ifscCode: raw.ifscCode || employee?.bank_ifsc_code || 'N/A',
            source: 'EXCEL_UPLOAD'
          }
        };

        console.info("[PAYROLL_CALCULATION_SUCCESS]", {
            employee: snapshot.employeeName,
            code: snapshot.employeeCode,
            gross: calculatedGross,
            net: calculatedNet,
            components: { basic, hra, specialAllowance, pfEmployee, pt, tds }
        });

        summary.calculatedDetails.push(snapshot);
      } else if (status === MappingStatus.DUPLICATE_PAYROLL) {
        summary.duplicateRows++;
      } else if (status === MappingStatus.NOT_FOUND || status === MappingStatus.AMBIGUOUS) {
        summary.unmatchedRows++;
      } else {
        summary.invalidRows++;
      }
    }

    const previewStatus = summary.unmatchedRows > 0 || summary.duplicateRows > 0
      ? 'REVIEW_REQUIRED'
      : 'READY';

    // 2. Persist calculations to the batch summary
    await supabaseAdmin
      .from('payroll_bulk_preview_summaries')
      .delete()
      .eq('upload_id', uploadId);

    const { data: preview, error: previewError } = await supabaseAdmin
      .from('payroll_bulk_preview_summaries')
      .insert({
        upload_id: uploadId,
        total_rows: summary.totalRows,
        matched_rows: summary.matchedRows,
        unmatched_rows: summary.unmatchedRows,
        duplicate_rows: summary.duplicateRows,
        invalid_rows: summary.invalidRows,
        gross_total: summary.grossTotal,
        net_total: summary.netTotal,
        preview_status: previewStatus,
        created_by: userId,
        metadata: { calculatedDetails: summary.calculatedDetails }
      })
      .select()
      .maybeSingle();

    if (previewError) throw previewError;

    return preview;
  }
}
