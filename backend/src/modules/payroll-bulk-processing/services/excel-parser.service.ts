import ExcelJS from 'exceljs';
import { ExcelRowData } from '../types/bulk-upload.types';

export class ExcelParserService {
  /**
   * Parses a payroll excel file and returns normalized row data.
   */
  static async parsePayrollExcel(filePath: string): Promise<ExcelRowData[]> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);
    
    const worksheet = workbook.getWorksheet(1); // Assume first sheet
    if (!worksheet) throw new Error('Excel file is empty or invalid');

    const rows: ExcelRowData[] = [];
    
    // Header mapping (Expected Format)
    const headers: { [key: string]: number } = {};
    const headerRow = worksheet.getRow(1);
    
    headerRow.eachCell((cell, colNumber) => {
      const value = cell.value?.toString().trim().toLowerCase();
      if (value) headers[value] = colNumber;
    });

    // Basic column mapping helper
    const getVal = (row: ExcelJS.Row, ...names: string[]) => {
      for (const name of names) {
        const index = headers[name.toLowerCase()];
        if (index) {
          const cell = row.getCell(index);
          return cell.value;
        }
      }
      return null;
    };

    const toNum = (val: any) => {
        if (val === null || val === undefined) return 0;
        if (typeof val === 'object' && val.result !== undefined) return Number(val.result) || 0; // Handle formulas
        return Number(val) || 0;
    };

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const data: ExcelRowData = {
        employeeCode: getVal(row, 'employee code', 'emp code', 'code')?.toString() || '',
        month: toNum(getVal(row, 'month')),
        year: toNum(getVal(row, 'year')),
        
        // Operational Variables
        payableDays: toNum(getVal(row, 'payable days', 'working days')),
        lopDays: toNum(getVal(row, 'lop days', 'unpaid leaves')),
        
        // Earnings
        basic: toNum(getVal(row, 'basic', 'basic salary')),
        hra: toNum(getVal(row, 'hra', 'house rent allowance')),
        specialAllowance: toNum(getVal(row, 'special allowance', 'allowance')),
        bonus: toNum(getVal(row, 'bonus')),
        incentives: toNum(getVal(row, 'incentives', 'commissions')),
        overtime: toNum(getVal(row, 'overtime amount', 'ot', 'overtime')),
        otherAdditions: toNum(getVal(row, 'other additions', 'additions')),

        // Deductions
        pfEmployee: toNum(getVal(row, 'pf employee', 'employee pf', 'pf')),
        pfEmployer: toNum(getVal(row, 'pf employer', 'employer pf')),
        professionalTax: toNum(getVal(row, 'professional tax', 'pt')),
        incomeTax: toNum(getVal(row, 'income tax', 'tds', 'tax')),
        otherDeductions: toNum(getVal(row, 'other deductions', 'deductions')),

        variablePay: toNum(getVal(row, 'variable pay')),
        gratuity: toNum(getVal(row, 'gratuity')),

        // Identity & Treasury Info
        bankName: getVal(row, 'bank name')?.toString() || '',
        bankAccount: getVal(row, 'bank account number', 'account no', 'bank account')?.toString() || '',
        ifscCode: getVal(row, 'ifsc code', 'ifsc')?.toString() || '',
        pan: getVal(row, 'pan number', 'pan')?.toString() || '',
        uan: getVal(row, 'uan number', 'uan')?.toString() || '',
        
        remarks: getVal(row, 'remarks')?.toString() || '',
        
        // Derived for backward compatibility (calculated below in engine if needed, but we capture if present)
        grossSalary: toNum(getVal(row, 'gross salary', 'gross')),
        netSalary: toNum(getVal(row, 'net salary', 'net'))
      };

      // Only add if employeeCode exists
      if (data.employeeCode) {
        console.info("[EXCEL_ROW_PARSED]", {
            code: data.employeeCode,
            basic: data.basic,
            gross: data.grossSalary,
            net: data.netSalary
        });
        rows.push(data);
      }
    });

    return rows;
  }
}
