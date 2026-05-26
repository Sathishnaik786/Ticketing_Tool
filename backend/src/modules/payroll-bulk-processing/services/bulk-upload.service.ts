import { supabaseAdmin } from '@lib/supabase';
import { ExcelParserService } from './excel-parser.service';
import { UploadValidationService } from './upload-validation.service';
import { UploadStatus, RowStatus } from '../types/bulk-upload.types';
import { PayrollPreviewService } from './payroll-preview.service';

export class BulkUploadService {
  /**
   * Orchestrates the bulk upload process: parse, validate, and persist.
   */
  static async processBulkUpload(params: {
    userId: string;
    organizationId?: string;
    filePath: string;
    originalName: string;
    uploadName: string;
  }) {
    const { userId, organizationId, filePath, originalName, uploadName } = params;

    // 1. Initialize Upload Record
    const { data: upload, error: initError } = await supabaseAdmin
      .from('payroll_bulk_uploads')
      .insert({
        upload_name: uploadName,
        uploaded_by: userId,
        organization_id: organizationId,
        original_file_name: originalName,
        upload_status: UploadStatus.VALIDATING,
        processing_started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (initError) throw initError;

    try {
      // 2. Parse Excel
      const rows = await ExcelParserService.parsePayrollExcel(filePath);
      
      // 3. Validate Data
      const validationResults = await UploadValidationService.validateUploadData(rows);
      
      // 4. Prepare Row Persistence
      const allRowRecords = [
        ...validationResults.validRows.map(row => ({
          upload_id: upload.id,
          row_number: row.rowNumber,
          employee_code: row.employeeCode,
          employee_name: row.employeeName,
          department: row.department,
          designation: row.designation,
          payroll_month: row.month,
          payroll_year: row.year,
          gross_salary: row.grossSalary,
          net_salary: row.netSalary,
          upload_status: RowStatus.VALID,
          raw_data: row.rawData
        })),
        ...validationResults.invalidRows.map(row => ({
          upload_id: upload.id,
          row_number: row.rowNumber,
          employee_code: row.employeeCode,
          employee_name: row.employeeName,
          department: row.department,
          designation: row.designation,
          payroll_month: row.month,
          payroll_year: row.year,
          gross_salary: row.grossSalary,
          net_salary: row.netSalary,
          upload_status: RowStatus.INVALID,
          validation_errors: row.errors,
          raw_data: row
        })),
        ...validationResults.duplicateRows.map(row => ({
          upload_id: upload.id,
          row_number: row.rowNumber,
          employee_code: row.employeeCode,
          employee_name: row.employeeName,
          department: row.department,
          designation: row.designation,
          payroll_month: row.month,
          payroll_year: row.year,
          gross_salary: row.grossSalary,
          net_salary: row.netSalary,
          upload_status: RowStatus.DUPLICATE,
          validation_errors: row.errors,
          raw_data: row
        }))
      ];

      // 5. Bulk Insert Rows (Chunked for safety)
      const chunkSize = 100;
      for (let i = 0; i < allRowRecords.length; i += chunkSize) {
        const chunk = allRowRecords.slice(i, i + chunkSize);
        const { error: rowError } = await supabaseAdmin
          .from('payroll_bulk_upload_rows')
          .insert(chunk);
        
        if (rowError) console.error('Error inserting row chunk:', rowError);
      }

      // 6. Update Upload Summary
      const finalStatus = validationResults.invalidRows.length > 0 || validationResults.duplicateRows.length > 0
        ? UploadStatus.VALIDATED
        : UploadStatus.VALIDATED;

      await supabaseAdmin
        .from('payroll_bulk_uploads')
        .update({
          upload_status: finalStatus,
          total_rows: validationResults.summary.total,
          successful_rows: validationResults.summary.valid,
          failed_rows: validationResults.summary.invalid + validationResults.summary.duplicates,
          validation_summary: validationResults.summary,
          processing_completed_at: new Date().toISOString()
        })
        .eq('id', upload.id);

      // 7. Generate Initial Preview Summary
      // This ensures the preview dashboard has data even before mapping is triggered
      await PayrollPreviewService.generatePreview(upload.id, userId);

      return {
        uploadId: upload.id,
        summary: validationResults.summary
      };

    } catch (error: any) {
      // Handle Failure
      await supabaseAdmin
        .from('payroll_bulk_uploads')
        .update({
          upload_status: UploadStatus.FAILED,
          validation_summary: { error: error.message },
          processing_completed_at: new Date().toISOString()
        })
        .eq('id', upload.id);
      
      throw error;
    }
  }

  static async getUploads() {
    const { data, error } = await supabaseAdmin
      .from('payroll_bulk_uploads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  static async getUploadById(id: string) {
    const { data, error } = await supabaseAdmin
      .from('payroll_bulk_uploads')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async getUploadRows(uploadId: string) {
    const { data, error } = await supabaseAdmin
      .from('payroll_bulk_upload_rows')
      .select('*')
      .eq('upload_id', uploadId)
      .order('row_number', { ascending: true });
    
    if (error) throw error;
    return data;
  }
}
