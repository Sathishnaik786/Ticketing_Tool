import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

export const PayrollTemplateService = {
  /**
   * Generates and downloads the official Enterprise Payroll Upload Template.
   */
  downloadTemplate: async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Payroll Variables');

    // Define Columns
    worksheet.columns = [
      { header: 'Employee Code', key: 'employeeCode', width: 20 },
      { header: 'Month', key: 'month', width: 10 },
      { header: 'Year', key: 'year', width: 10 },
      { header: 'Payable Days', key: 'payableDays', width: 15 },
      { header: 'LOP Days', key: 'lopDays', width: 15 },
      { header: 'Bonus', key: 'bonus', width: 15 },
      { header: 'Incentives', key: 'incentives', width: 15 },
      { header: 'Overtime', key: 'overtime', width: 15 },
      { header: 'Other Deductions', key: 'deductions', width: 20 },
    ];

    // Add Sample Row
    worksheet.addRow({
      employeeCode: '153533',
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
      payableDays: 30,
      lopDays: 0,
      bonus: 0,
      incentives: 0,
      overtime: 0,
      deductions: 0,
    });

    // Styling
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' }, // Slate-800
    };

    // Data Validation Hints
    worksheet.dataValidations.add('B2:B100', {
      type: 'whole',
      operator: 'between',
      allowBlank: false,
      showErrorMessage: true,
      formulae: [1, 12],
      errorTitle: 'Invalid Month',
      error: 'Please enter a value between 1 and 12',
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Ticketra_Payroll_Template_${new Date().toISOString().split('T')[0]}.xlsx`);
  }
};
