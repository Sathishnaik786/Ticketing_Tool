import { supabaseAdmin } from '@lib/supabase';
import { MappingConfidenceService } from './mapping-confidence.service';
import { DuplicateCheckService } from './duplicate-check.service';
import { PayrollIdentityService } from './payroll-identity.service';
import { MappingResult, MappingStatus } from '../types/bulk-upload.types';

export class EmployeeMappingService {
  /**
   * Maps a batch of upload rows to actual employees.
   */
  static async mapBatch(uploadId: string, organizationId?: string) {
    // 1. Fetch all validated rows for this upload
    const { data: rows, error: rowError } = await supabaseAdmin
      .from('payroll_bulk_upload_rows')
      .select('*')
      .eq('upload_id', uploadId);

    if (rowError) {
      console.error({ module: 'employee-mapping', step: 'fetch_rows', uploadId, error: rowError.message });
      throw rowError;
    }

    if (!rows || rows.length === 0) return { mappedCount: 0 };

    // 2. Fetch employees for matching
    let query = supabaseAdmin.from('employees').select('id, first_name, last_name, employee_code, department_id, position, payroll_identity_key');
    
    const { data: employees, error: empError } = await query;
    if (empError) throw empError;

    // 2.5 Clear existing mappings
    await supabaseAdmin.from('payroll_bulk_row_mappings').delete().in('upload_row_id', rows.map(r => r.id));

    const results: any[] = [];

    for (const row of rows) {
      try {
        const inputCode = row.employee_code?.toUpperCase().trim();
        const inputName = PayrollIdentityService.normalize(row.employee_name);

        // 3. Match Logic Priority: 
        // 1. Employee Code (Exact)
        // 2. Payroll Identity Key (Exact)
        // 3. Full Name (Normalized)
        let matchedEmployee = employees.find(e => 
          (e.employee_code && e.employee_code.toUpperCase().trim() === inputCode) ||
          (e.payroll_identity_key && e.payroll_identity_key === `${inputCode}|${inputName}`)
        );
        
        const confidence = MappingConfidenceService.calculateConfidence({
          codeMatch: !!(matchedEmployee && matchedEmployee.employee_code && matchedEmployee.employee_code.toUpperCase().trim() === inputCode),
          nameMatch: !!matchedEmployee,
          departmentMatch: !!(matchedEmployee && row.department && matchedEmployee.department_id),
          positionMatch: !!(matchedEmployee && row.designation && matchedEmployee.position?.toLowerCase() === row.designation?.toLowerCase())
        });

        let finalStatus = confidence.status;
        let notes = '';

        if (matchedEmployee) {
          const isDuplicate = await DuplicateCheckService.checkDuplicatePayroll({
            employeeId: matchedEmployee.id,
            month: row.payroll_month,
            year: row.payroll_year
          });

          if (isDuplicate) {
            finalStatus = MappingStatus.DUPLICATE_PAYROLL;
            notes = 'Existing payroll record found for this period.';
          }
        }

        results.push({
          upload_row_id: row.id,
          employee_id: matchedEmployee?.id || null,
          mapping_status: finalStatus,
          mapping_confidence: confidence.score,
          matched_by: confidence.matchedBy,
          mapping_notes: notes || (finalStatus === MappingStatus.NOT_FOUND ? 'No matching employee found.' : '')
        });
      } catch (rowError: any) {
        results.push({
          upload_row_id: row.id,
          employee_id: null,
          mapping_status: MappingStatus.INVALID,
          mapping_confidence: 0,
          mapping_notes: `System error during mapping: ${rowError.message}`
        });
      }
    }

    await supabaseAdmin.from('payroll_bulk_row_mappings').insert(results);
    return { mappedCount: results.length };
  }
}
