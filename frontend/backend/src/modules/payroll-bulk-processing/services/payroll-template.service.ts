import * as XLSX from 'xlsx';

export class PayrollTemplateService {
  /**
   * Generates a standardized enterprise payroll upload template.
   */
  static generateTemplate() {
    // 1. Data Sheet (Headers + Sample Row)
    const headers = [
      'Employee Code', 
      'Month', 
      'Year', 
      'Payable Days', 
      'LOP Days', 
      'Basic',
      'HRA',
      'Special Allowance',
      'Bonus', 
      'Incentives', 
      'Overtime Amount', 
      'Other Additions', 
      'PF Employee',
      'Professional Tax',
      'Income Tax',
      'Other Deductions',
      'Bank Name',
      'Bank Account Number',
      'IFSC Code',
      'PAN Number',
      'UAN Number',
      'Remarks'
    ];

    const sampleRows = [
      {
        'Employee Code': '153532',
        'Month': 5,
        'Year': 2024,
        'Payable Days': 30,
        'LOP Days': 0,
        'Basic': 15000,
        'HRA': 6000,
        'Special Allowance': 4000,
        'Bonus': 0,
        'Incentives': 0,
        'Overtime Amount': 0,
        'Other Additions': 0,
        'PF Employee': 1800,
        'Professional Tax': 200,
        'Income Tax': 0,
        'Other Deductions': 0,
        'Bank Name': 'HDFC Bank',
        'Bank Account Number': '50100234567890',
        'IFSC Code': 'HDFC0001234',
        'PAN Number': 'ABCDE1234F',
        'UAN Number': '100123456789',
        'Remarks': 'Standard Payroll'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(sampleRows, { header: headers });

    // 2. Instructions Sheet
    const instructions = [
      ['INSTRUCTION', 'RULE'],
      ['Employee Code', 'Must match the numeric code in EMS Employee Master'],
      ['Month', 'Numeric month (1-12) or Full name'],
      ['Year', 'YYYY format (e.g., 2024)'],
      ['Mandatory Fields', 'Basic, HRA, PF Employee, and PT are REQUIRED for valid payroll generation.'],
      ['Excel Source of Truth', 'EMS will strictly use these values for payslips and payouts. Master salary configs are ignored.'],
      ['Numeric Fields', 'Do not include currency symbols or commas'],
      ['IFSC/Account', 'Ensure correct formatting to prevent treasury rejection'],
      ['Final Net', 'Net Salary will be calculated as (Earnings - Deductions). If negative, row will be rejected.']
    ];
    const wsInstructions = XLSX.utils.aoa_to_sheet(instructions);

    // 3. Build Workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payroll Data');
    XLSX.utils.book_append_sheet(wb, wsInstructions, 'HR Instructions');

    // Generate Buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    return buf;
  }
}
