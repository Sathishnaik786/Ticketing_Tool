import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import crypto from 'crypto';
import { PdfRendererService } from './pdf-renderer.service';
import { numberToWords } from '../../../utils/number-to-words';
import { supabaseAdmin } from '@lib/supabase';

export class PayslipGeneratorService {
  /**
   * Generates a payslip PDF from data, dynamically rendering with the active branded template structure.
   */
  static async generatePayslip(data: any): Promise<{ buffer: Buffer; hash: string; token: string }> {
    const templatePath = path.join(__dirname, '../templates/payslip-template.html');
    const templateSource = fs.readFileSync(templatePath, 'utf8');
    const template = handlebars.compile(templateSource);

    const verificationToken = crypto.randomBytes(16).toString('hex');
    const generatedAt = new Date().toLocaleString();

    console.log(`[PAYSLIP_GENERATION] Preparing data for ${data.employeeName} (${data.employeeCode})`);

    // Fetch active branded template dynamically
    let activeTemplate: any = null;
    try {
      const { data: dbTemplate } = await supabaseAdmin
        .from('payslip_templates')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();
      
      activeTemplate = dbTemplate;
    } catch (err) {
      console.warn('[PAYSLIP_TEMPLATE_RESOLUTION] Failed to query active template, applying corporate defaults:', err);
    }

    // Resolve institutional template configurations with robust defaults
    const templateConfig = {
      primaryColor: activeTemplate?.theme_colors?.primary || '#0f172a',
      secondaryColor: activeTemplate?.theme_colors?.secondary || '#475569',
      accentColor: activeTemplate?.theme_colors?.accent || '#10b981',
      fontFamily: activeTemplate?.font_family || 'Inter',
      watermarkText: activeTemplate?.watermark_text || 'CONFIDENTIAL',
      organizationName: activeTemplate?.organization_name || 'YVI Enterprise EMS',
      companyAddress: activeTemplate?.company_address || '123 Enterprise Corporate Boulevard, Tech Park, Suite 400',
      footerText: activeTemplate?.footer_text || 'This is a computer-generated document and does not require a physical signature.',
      logoUrl: activeTemplate?.logo_url || '',
      bankSectionEnabled: activeTemplate?.bank_section_enabled !== false,
      statutorySectionEnabled: activeTemplate?.statutory_section_enabled !== false,
      signatureEnabled: activeTemplate?.signature_enabled !== false,
      qrVerificationEnabled: activeTemplate?.qr_verification_enabled !== false
    };

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
      
      // Statutory Identifiers (Fallbacks)
      pan: (data.pan && data.pan !== 'null' && data.pan !== 'undefined') ? data.pan : 'N/A',
      uan: (data.uan && data.uan !== 'null' && data.uan !== 'undefined') ? data.uan : 'N/A',
      bankName: (data.bankName && data.bankName !== 'null' && data.bankName !== 'undefined') ? data.bankName : 'N/A',
      bankAccount: (data.bankAccount && data.bankAccount !== 'null' && data.bankAccount !== 'undefined') ? data.bankAccount : 'N/A'
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
