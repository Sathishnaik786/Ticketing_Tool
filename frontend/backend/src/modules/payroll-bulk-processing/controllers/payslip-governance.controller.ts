import { Request, Response } from 'express';
import { supabaseAdmin } from '@lib/supabase';
import { PayslipGeneratorService } from '../services/payslip-generator.service';
import { PayslipStorageService } from '../services/payslip-storage.service';

export class PayslipGovernanceController {
  
  /**
   * GET /api/payroll-bulk/templates
   * List all templates.
   */
  static async listTemplates(req: Request, res: Response) {
    try {
      const { data, error } = await supabaseAdmin
        .from('payslip_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      console.error('[TEMPLATE_LIST_ERROR]', err);
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * GET /api/payroll-bulk/templates/active
   * Fetch the current active template.
   */
  static async getActiveTemplate(req: Request, res: Response) {
    try {
      const { data, error } = await supabaseAdmin
        .from('payslip_templates')
        .select('*')
        .eq('is_active', true)
        .maybeSingle();

      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      console.error('[ACTIVE_TEMPLATE_FETCH_ERROR]', err);
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * POST /api/payroll-bulk/templates
   * Create a new template.
   */
  static async createTemplate(req: Request, res: Response) {
    try {
      const { 
        template_name, 
        organization_name, 
        logo_url, 
        company_address, 
        footer_text, 
        watermark_text, 
        theme_colors,
        font_family,
        bank_section_enabled,
        statutory_section_enabled,
        signature_enabled,
        qr_verification_enabled
      } = req.body;

      const { data, error } = await supabaseAdmin
        .from('payslip_templates')
        .insert({
          template_name,
          organization_name,
          logo_url,
          company_address,
          footer_text,
          watermark_text,
          theme_colors,
          font_family,
          bank_section_enabled: bank_section_enabled !== false,
          statutory_section_enabled: statutory_section_enabled !== false,
          signature_enabled: signature_enabled !== false,
          qr_verification_enabled: qr_verification_enabled !== false,
          is_active: false,
          version_number: 1
        })
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      console.error('[TEMPLATE_CREATE_ERROR]', err);
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * PUT /api/payroll-bulk/templates/:id
   * Update an existing template configuration.
   */
  static async updateTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { 
        template_name, 
        organization_name, 
        logo_url, 
        company_address, 
        footer_text, 
        watermark_text, 
        theme_colors,
        font_family,
        bank_section_enabled,
        statutory_section_enabled,
        signature_enabled,
        qr_verification_enabled
      } = req.body;

      const { data: existing } = await supabaseAdmin
        .from('payslip_templates')
        .select('version_number')
        .eq('id', id)
        .single();

      const nextVersion = (existing?.version_number || 1) + 1;

      const { data, error } = await supabaseAdmin
        .from('payslip_templates')
        .update({
          template_name,
          organization_name,
          logo_url,
          company_address,
          footer_text,
          watermark_text,
          theme_colors,
          font_family,
          bank_section_enabled: bank_section_enabled !== false,
          statutory_section_enabled: statutory_section_enabled !== false,
          signature_enabled: signature_enabled !== false,
          qr_verification_enabled: qr_verification_enabled !== false,
          version_number: nextVersion,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      res.json(data);
    } catch (err: any) {
      console.error('[TEMPLATE_UPDATE_ERROR]', err);
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * POST /api/payroll-bulk/templates/:id/activate
   * Set a specific template to active (idempotently deactivating previous active templates).
   */
  static async activateTemplate(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // 1. Deactivate all templates
      const { error: deactivateError } = await supabaseAdmin
        .from('payslip_templates')
        .update({ is_active: false })
        .neq('id', id);

      if (deactivateError) throw deactivateError;

      // 2. Activate target template
      const { data, error: activateError } = await supabaseAdmin
        .from('payslip_templates')
        .update({ is_active: true })
        .eq('id', id)
        .select()
        .single();

      if (activateError) throw activateError;

      console.info(`[TEMPLATE_ACTIVATION] Successfully activated template: ${data.template_name} (ID: ${data.id})`);
      res.json(data);
    } catch (err: any) {
      console.error('[TEMPLATE_ACTIVATE_ERROR]', err);
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * GET /api/payroll-bulk/payslips/:recordId/versions
   * Retrieve the version history of a specific payslip document.
   */
  static async getPayslipVersions(req: Request, res: Response) {
    try {
      const { recordId } = req.params;

      // Find the primary document
      const { data: document, error: docError } = await supabaseAdmin
        .from('employee_payslip_documents')
        .select('id')
        .eq('payroll_record_id', recordId)
        .maybeSingle();

      if (docError) throw docError;
      if (!document) {
        return res.json([]);
      }

      // Query all archived versions
      const { data: versions, error: verError } = await supabaseAdmin
        .from('payslip_document_versions')
        .select(`
          *,
          user:users(email)
        `)
        .eq('employee_payslip_document_id', document.id)
        .order('version_number', { ascending: false });

      if (verError) throw verError;
      res.json(versions);
    } catch (err: any) {
      console.error('[FETCH_VERSIONS_ERROR]', err);
      res.status(500).json({ error: err.message });
    }
  }

  /**
   * POST /api/payroll-bulk/payslips/:recordId/regenerate
   * Phase 5 & 6: Safely regenerates the payslip using the active branded template structure.
   * Increments document version and archives previous version cleanly.
   */
  static async regeneratePayslip(req: Request, res: Response) {
    try {
      const { recordId } = req.params;
      const { reason = 'Template redesign update' } = req.body;
      const userId = (req as any).user?.id;

      console.info(`[PAYSLIP_REGENERATION_START] Initiated for Record ID: ${recordId}`);

      // 1. Fetch primary payslip document
      const { data: document, error: docError } = await supabaseAdmin
        .from('employee_payslip_documents')
        .select('*')
        .eq('payroll_record_id', recordId)
        .maybeSingle();

      if (docError || !document) {
        throw new Error('No generated payslip document found for this payroll record.');
      }

      // 2. Fetch the immutable payroll record and related row details
      const { data: record, error: recError } = await supabaseAdmin
        .from('payroll_records')
        .select(`
          *,
          employee:employees(
            *,
            department:departments(name)
          )
        `)
        .eq('id', recordId)
        .single();

      if (recError || !record) {
        throw new Error('Accounting payroll record not found for this payslip.');
      }

      // Find the original bulk upload row to fetch detailed breakdowns (basic, hra, deductions, bank, uan, pan, etc)
      const { data: mapping } = await supabaseAdmin
        .from('payroll_bulk_row_mappings')
        .select(`
          *,
          row:payroll_bulk_upload_rows(*)
        `)
        .eq('employee_id', record.employee_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const row = mapping?.row;
      if (!row) {
        throw new Error('Original bulk uploaded row mapping not found for detailed pay components.');
      }

      // Load commitment preview metadata for computed detailed pan/uan/bank component allocations
      const { data: commitment } = await supabaseAdmin
        .from('payroll_bulk_commitments')
        .select('*, preview:payroll_bulk_preview_summaries(*)')
        .eq('upload_id', row.upload_id)
        .maybeSingle();

      const preview = commitment?.preview;
      const rowDetails = preview?.metadata?.calculatedDetails?.find((d: any) => d.rowId === row.id);

      // 3. Construct pay components snapshot for rendering
      const payslipNumber = document.payslip_number;

      // Resolve employee name, position/designation, and department from database record with fallbacks to Excel
      const dbEmp = record?.employee;
      let employeeName = '';
      let designation = '';
      let department = '';

      if (dbEmp) {
        if (dbEmp.first_name || dbEmp.last_name) {
          employeeName = `${dbEmp.first_name || ''} ${dbEmp.last_name || ''}`.trim();
        }
        if (dbEmp.position) {
          designation = dbEmp.position;
        }
        if (dbEmp.department && (dbEmp.department as any).name) {
          department = (dbEmp.department as any).name;
        }
      }

      // Fallback to Excel upload columns if database fields are blank
      if (!employeeName && row.employee_name) {
        employeeName = row.employee_name;
      }
      if (!designation && row.designation) {
        designation = row.designation;
      }
      if (!department && row.department) {
        department = row.department;
      }

      // Absolute fallback values for validation safety
      if (!employeeName) employeeName = 'Employee';
      if (!designation) designation = 'Staff Member';
      if (!department) department = 'Operations';

      const payslipData = {
        ...row,
        payslipNumber,
        employeeName,
        employeeCode: row.employee_code,
        designation,
        department,
        payrollMonth: row.payroll_month,
        payrollYear: row.payroll_year,
        basic: rowDetails?.base || 0,
        hra: rowDetails?.hra || 0,
        specialAllowance: rowDetails?.specialAllowance || 0,
        bonus: rowDetails?.additions?.bonus || 0,
        incentives: rowDetails?.additions?.incentives || 0,
        overtime: rowDetails?.additions?.overtime || 0,
        otherAdditions: rowDetails?.additions?.other || 0,
        variablePay: rowDetails?.additions?.variable || 0,
        pf: rowDetails?.deductions?.pf || 0,
        esi: rowDetails?.deductions?.esi || 0,
        professionalTax: rowDetails?.deductions?.pt || 0,
        incomeTax: rowDetails?.deductions?.tds || 0,
        otherDeductions: rowDetails?.deductions?.other || 0,
        grossSalary: rowDetails?.gross || 0,
        netSalary: rowDetails?.net || 0,
        totalDeductions: (rowDetails?.gross || 0) - (rowDetails?.net || 0),
        pan: rowDetails?.metadata?.pan || 'N/A',
        uan: rowDetails?.metadata?.uan || 'N/A',
        bankName: rowDetails?.metadata?.bankName || 'N/A',
        bankAccount: rowDetails?.metadata?.bankAccount || 'N/A'
      };

      // 4. Generate the new PDF artifact using the active branded template styling
      const { buffer, hash: newHash, token: newToken } = await PayslipGeneratorService.generatePayslip(payslipData);
      const fileName = `${payslipNumber}.pdf`;
      const newPdfPath = await PayslipStorageService.uploadPayslip({ 
        employeeId: record.employee_id, 
        fileName, 
        buffer 
      });

      // 5. Query version count to calculate next version number
      const { count } = await supabaseAdmin
        .from('payslip_document_versions')
        .select('*', { count: 'exact', head: true })
        .eq('employee_payslip_document_id', document.id);

      const nextVersionNumber = (count || 0) + 2; // Old original is v1, first archive is v2

      // 6. Archive current version to payslip_document_versions
      const { error: archiveError } = await supabaseAdmin
        .from('payslip_document_versions')
        .insert({
          employee_payslip_document_id: document.id,
          version_number: nextVersionNumber - 1, // Store current active as the old version
          pdf_url: document.pdf_url,
          pdf_hash: document.pdf_hash,
          generated_by: document.generated_by || userId,
          generated_at: document.generated_at || document.created_at,
          replaced_at: new Date().toISOString(),
          reason_for_regeneration: reason
        });

      if (archiveError) throw archiveError;

      // 7. Update primary document with new PDF artifact details
      const { error: updateDocError } = await supabaseAdmin
        .from('employee_payslip_documents')
        .update({
          pdf_url: newPdfPath,
          pdf_hash: newHash,
          verification_token: newToken,
          generated_by: userId,
          generated_at: new Date().toISOString()
        })
        .eq('id', document.id);

      if (updateDocError) throw updateDocError;

      // 8. Update corresponding accounting payroll record storage path
      const { error: updateRecError } = await supabaseAdmin
        .from('payroll_records')
        .update({
          storage_path: newPdfPath,
          pdf_generated_at: new Date().toISOString(),
          generation_error: null
        })
        .eq('id', recordId);

      if (updateRecError) throw updateRecError;

      console.info(`[PAYSLIP_REGENERATED] Successfully regenerated document: ${document.id}, Version: ${nextVersionNumber}`);
      res.json({
        success: true,
        message: `Payslip regenerated and upgraded to Version ${nextVersionNumber} successfully.`,
        pdfUrl: newPdfPath
      });

    } catch (err: any) {
      console.error('[REGENERATE_PAYSLIP_ERROR]', err);
      res.status(500).json({ error: err.message });
    }
  }
}
