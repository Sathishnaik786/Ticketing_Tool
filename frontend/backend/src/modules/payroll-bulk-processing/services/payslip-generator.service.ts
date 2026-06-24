import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import crypto from 'crypto';
import { PdfRendererService } from './pdf-renderer.service';
import { numberToWords } from '../../../utils/number-to-words';

export interface CompanyPayrollConfig {
  organizationName: string;
  companyAddress: string;
  logoUrl?: string;
  footerText: string;
  watermarkText?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  bankSectionEnabled?: boolean;
  statutorySectionEnabled?: boolean;
  signatureEnabled?: boolean;
  qrVerificationEnabled?: boolean;
}

export interface ResolvedPayslipRenderPayload {
  templateVersion?: string;
  payslipNumber: string;
  resolvedEmployeeName: string;
  resolvedEmployeeCode: string;
  resolvedDesignation: string;
  resolvedDepartment: string;
  resolvedMonth: string;
  resolvedYear: number;
  totalWorkingDays?: number;
  payableDays?: number;
  lopDays?: number;

  basic: number;
  hra: number;
  specialAllowance: number;
  bonus: number;
  incentives: number;
  overtime: number;
  otherAdditions: number;
  variablePay: number;

  pf: number;
  esi: number;
  professionalTax: number;
  incomeTax: number;
  otherDeductions: number;

  grossSalary: number;
  totalDeductions: number;
  netSalary: number;

  resolvedPAN: string;
  resolvedUAN: string;
  resolvedBankName: string;
  resolvedAccountNumber: string;
  resolvedIFSC: string;

  companyConfig: CompanyPayrollConfig;
}

export class PayslipGeneratorService {
  /**
   * Generates a payslip PDF from data, dynamically rendering with the active branded template structure.
   */
  static async generatePayslip(data: ResolvedPayslipRenderPayload): Promise<{ buffer: Buffer; hash: string; token: string }> {
    const templatePath = path.join(__dirname, '../templates/payslip-template.html');
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateSource);

    const verificationToken = crypto.randomBytes(16).toString('hex');
    const generatedAt = new Date().toLocaleString();

    console.log(`[PAYSLIP_GENERATION] Preparing data for ${data.resolvedEmployeeName} (${data.resolvedEmployeeCode})`);

    // Configuration is injected entirely via payload - No DB queries during render phase
    const templateConfig = data.companyConfig;

    // Prepare data for template with strict enterprise breakdown
    const templateData = {
      ...data,
      ...templateConfig,
      verificationToken,
      generatedAt,
      // Ensure all amounts are formatted defensively
      basic: Number(data.basic || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      hra: Number(data.hra || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      specialAllowance: Number(data.specialAllowance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      bonus: Number(data.bonus || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      incentives: Number(data.incentives || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      overtime: Number(data.overtime || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      otherAdditions: Number(data.otherAdditions || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      variablePay: Number(data.variablePay || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      
      pf: Number(data.pf || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      esi: Number(data.esi || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      professionalTax: Number(data.professionalTax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      incomeTax: Number(data.incomeTax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      otherDeductions: Number(data.otherDeductions || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 }),
      
      grossSalary: Number(data.grossSalary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      totalDeductions: Number(data.totalDeductions || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      netSalary: Number(data.netSalary || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
      
      netSalaryInWords: (Number(data.netSalary || 0) > 0) 
        ? numberToWords(Math.round(Number(data.netSalary))) 
        : "Zero Rupees Only",
      
      // Statutory Identifiers (Fallbacks mapped directly from strict payload)
      pan: (data.resolvedPAN && data.resolvedPAN !== 'null' && data.resolvedPAN !== 'undefined') ? data.resolvedPAN : 'N/A',
      uan: (data.resolvedUAN && data.resolvedUAN !== 'null' && data.resolvedUAN !== 'undefined') ? data.resolvedUAN : 'N/A',
      bankName: (data.resolvedBankName && data.resolvedBankName !== 'null' && data.resolvedBankName !== 'undefined') ? data.resolvedBankName : 'N/A',
      bankAccount: (data.resolvedAccountNumber && data.resolvedAccountNumber !== 'null' && data.resolvedAccountNumber !== 'undefined') ? data.resolvedAccountNumber : 'N/A'
    };

    const html = template(templateData);
    const pdfBuffer = await PdfRendererService.renderHtmlToPdf(html);

    const hash = crypto.createHash('sha256').update(pdfBuffer).digest('hex');

    return {
      buffer: pdfBuffer,
      hash,
      token: verificationToken
    };
  }
}
