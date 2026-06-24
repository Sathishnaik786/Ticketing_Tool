import { ExcelRowData, ValidationResult } from '../types/bulk-upload.types';
import { PayrollRowSchema } from '../validators/payroll-upload.validator';

export class UploadValidationService {
  /**
   * Validates parsed excel rows and categorizes them.
   */
  static async validateUploadData(rows: ExcelRowData[]): Promise<ValidationResult> {
    const validRows: any[] = [];
    const invalidRows: any[] = [];
    const duplicateRows: any[] = [];
    const seenEmployeeCodes = new Set<string>();

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2; // +1 for 0-index, +1 for header

      // Check for duplicates within the file
      if (seenEmployeeCodes.has(row.employeeCode)) {
        duplicateRows.push({
          ...row,
          rowNumber,
          errors: [{ path: 'employeeCode', message: 'Duplicate employee code in this file' }]
        });
        continue;
      }
      seenEmployeeCodes.add(row.employeeCode);

      const validation = PayrollRowSchema.safeParse(row);

      if (validation.success) {
        validRows.push({
          ...validation.data,
          rowNumber,
          rawData: row
        });
      } else {
        invalidRows.push({
          ...row,
          rowNumber,
          errors: validation.error.issues.map(issue => ({
            path: issue.path.join('.'),
            message: issue.message
          }))
        });
      }
    }

    return {
      validRows,
      invalidRows,
      duplicateRows,
      summary: {
        total: rows.length,
        valid: validRows.length,
        invalid: invalidRows.length,
        duplicates: duplicateRows.length
      }
    };
  }
}
