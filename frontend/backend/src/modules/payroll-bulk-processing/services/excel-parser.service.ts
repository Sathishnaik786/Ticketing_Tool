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

    const parseMonth = (val: any) => {
        if (val === null || val === undefined) return 0;
        if (typeof val === 'number') return val;
        
        const strVal = String(val).trim().toLowerCase();
        
        const months: { [key: string]: number } = {
            'january': 1, 'jan': 1,
            'february': 2, 'feb': 2,
            'march': 3, 'mar': 3,
            'april': 4, 'apr': 4,
            'may': 5,
            'june': 6, 'jun': 6,
            'july': 7, 'jul': 7,
            'august': 8, 'aug': 8,
            'september': 9, 'sep': 9,
            'october': 10, 'oct': 10,
            'november': 11, 'nov': 11,
            'december': 12, 'dec': 12
        };
        
        if (months[strVal]) return months[strVal];
        return Number(val) || 0;
    };

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const data: ExcelRowData = {
        employeeCode: getVal(row, 'employee code', 'emp code', 'code')?.toString() || '',
        employeeName: getVal(row, 'employee name', 'name', 'emp name')?.toString() || '',
        department: getVal(row, 'department', 'dept')?.toString() || '',
        designation: getVal(row, 'designation', 'position', 'role')?.toString() || '',
        month: parseMonth(getVal(row, 'month')),
        year: toNum(getVal(row, 'year')),
        
        // Operational Variables
        totalWorkingDays: toNum(getVal(row, 'total working days', 'working days total', 'total days')),
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
        pf: toNum(getVal(row, 'pf employee', 'employee pf', 'pf')),
        pfEmployer: toNum(getVal(row, 'pf employer', 'employer pf')),
        esi: toNum(getVal(row, 'esi employee', 'employee esi', 'esi')),
        esiEmployer: toNum(getVal(row, 'esi employer', 'employer esi')),
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
