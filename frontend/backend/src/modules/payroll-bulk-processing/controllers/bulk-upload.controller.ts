import { Request, Response } from 'express';
import { BulkUploadService } from '../services/bulk-upload.service';
import { EmployeeMappingService } from '../services/employee-mapping.service';
import { PayrollPreviewService } from '../services/payroll-preview.service';
import { UploadReviewService } from '../services/upload-review.service';
import { PayrollCommitmentService } from '../services/payroll-commitment.service';
import { PayslipDistributionService } from '../services/payslip-distribution.service';
import { supabaseAdmin } from '@lib/supabase';

export class BulkUploadController {
  /**
   * Handle Excel file upload and trigger processing.
   */
  static async upload(req: Request, res: Response) {
    try {
      const file = req.file;
      const { uploadName } = req.body;
      const user = (req as any).user;

      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      if (!uploadName) {
        return res.status(400).json({ message: 'Upload name is required' });
      }


      const result = await BulkUploadService.processBulkUpload({
        userId: user.id,
        organizationId: user.organizationId,
        filePath: file.path,
        originalName: file.originalname,
        uploadName: uploadName
      });

      res.status(201).json(result);
    } catch (error: any) {
      console.error('Bulk upload error:', error);
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Triggers employee mapping for an upload batch.
   */
  static async mapEmployees(req: Request, res: Response) {
    const { uploadId } = req.params;
    console.log(`[DEBUG] Starting mapEmployees for upload: ${uploadId}`);
    
    try {
      const user = (req as any).user;

      // 1. Trigger Mapping Batch
      console.log(`[DEBUG] Executing EmployeeMappingService.mapBatch...`);
      const mappingResult = await EmployeeMappingService.mapBatch(uploadId, user.organizationId);
      
      // 2. Refresh Preview
      console.log(`[DEBUG] Executing PayrollPreviewService.generatePreview...`);
      const previewResult = await PayrollPreviewService.generatePreview(uploadId, user.id);

      console.log(`[DEBUG] Mapping flow completed successfully for ${uploadId}`);
      
      res.status(200).json({
        success: true,
        message: 'Employee mapping completed',
        data: {
          mappings: mappingResult,
          preview: previewResult
        }
      });
    } catch (error: any) {
      console.error(`[ERROR] Mapping Engine Failure for ${uploadId}:`, {
        message: error.message,
        stack: error.stack,
        details: error
      });

      res.status(500).json({ 
        success: false,
        message: 'Internal server error during employee mapping',
        error: error.message,
        path: req.path
      });
    }
  }

  /**
   * Fetches mapping details for an upload batch.
   */
  static async getMappings(req: Request, res: Response) {
    try {
      const { uploadId } = req.params;
      
      const { data: mappings, error: mapError } = await supabaseAdmin
        .from('payroll_bulk_row_mappings')
        .select(`
          *,
          employee:employees(id, first_name, last_name),
          row:payroll_bulk_upload_rows!inner(*)
        `)
        .eq('row.upload_id', uploadId);

      if (mapError) throw mapError;
      res.json(mappings);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Gets the preview summary for an upload batch.
   */
  static async getPreview(req: Request, res: Response) {
    try {
      const { uploadId } = req.params;
      const { data, error } = await supabaseAdmin
        .from('payroll_bulk_preview_summaries')
        .select('*')
        .eq('upload_id', uploadId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return res.status(404).json({ message: 'Preview not found' });
      
      res.json(data);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  /**
   * Updates a row mapping manually.
   */
  static async updateRowMapping(req: Request, res: Response) {
    try {
      const { uploadId, rowId } = req.params;
      const { employeeId, notes } = req.body;
      const user = (req as any).user;

      // 1. Safeguard: Prevent duplicate employee assignment in the same batch
      const { data: existing, error: checkError } = await supabaseAdmin
        .from('payroll_bulk_row_mappings')
        .select('upload_row_id, row:payroll_bulk_upload_rows!inner(upload_id)')
        .eq('employee_id', employeeId)
        .eq('row.upload_id', uploadId)
        .neq('upload_row_id', rowId)
        .maybeSingle();

      if (existing) {
        return res.status(400).json({ 
          success: false, 
          message: 'This employee is already assigned to another row in this batch.' 
        });
      }

      const result = await UploadReviewService.updateMapping({
        uploadId,
        rowId,
        employeeId,
        userId: user.id,
        notes
      });

      // Recalculate preview after mapping update
      await PayrollPreviewService.generatePreview(uploadId, user.id);

      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Manually triggers preview recalculation.
   */
  static async recalculatePreview(req: Request, res: Response) {
    try {
      const { uploadId } = req.params;
      const user = (req as any).user;

      const result = await PayrollPreviewService.generatePreview(uploadId, user.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Officially commits the payroll upload and generates payslips.
   */
  static async commit(req: Request, res: Response) {
    try {
      const { uploadId } = req.params;
      const user = (req as any).user;

      const result = await PayrollCommitmentService.commitUpload(uploadId, user.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Retries payslip generation for a commitment.
   */
  static async retryDocs(req: Request, res: Response) {
    try {
      const { commitmentId } = req.params;
      const user = (req as any).user;

      const result = await PayrollCommitmentService.retryPayslipGeneration(commitmentId, user.id);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Lists all commitment batches with their records for diagnostics.
   */
  static async listCommitments(req: Request, res: Response) {
    try {
      console.info("[PAYROLL_RECORD_FETCH] Fetching commitments");
      const { data: commitments, error: commitError } = await supabaseAdmin
        .from('payroll_bulk_commitments')
        .select('*, upload:payroll_bulk_uploads(upload_name)')
        .order('created_at', { ascending: false });
      
      if (commitError) throw commitError;

      const enrichedCommitments = [];

      for (const commitment of commitments || []) {
        console.info("[DOCUMENT_QUERY_RESULT] Processing commitment ID:", commitment.id);
        
        // 1. Fetch audits to get employee_ids associated with this commitment
        const { data: audits } = await supabaseAdmin
          .from('payroll_commitment_audits')
          .select('employee_id')
          .eq('commitment_id', commitment.id);

        const employeeIds = audits?.map(a => a.employee_id).filter(Boolean) || [];

        if (employeeIds.length === 0) {
          enrichedCommitments.push({ ...commitment, records: [] });
          continue;
        }

        // 2. Fetch payroll records for these employees
        const { data: records, error: recordsError } = await supabaseAdmin
          .from('payroll_records')
          .select(`
            *,
            employee:employees(id, first_name, last_name, employee_code)
          `)
          .in('employee_id', employeeIds);

        if (recordsError) {
          console.error("[PAYROLL_RECORD_FETCH_ERROR]", recordsError);
          enrichedCommitments.push({ ...commitment, records: [] });
          continue;
        }

        // Filter records that belong to this commitment
        let commitmentRecords = records?.filter(r => r.metadata?.commitment_id === commitment.id) || [];

        // Self-Healing: If no records match by commitment_id in metadata (due to legacy/stale data),
        // we associate records created within a 10-minute window of the commitment's creation
        if (commitmentRecords.length === 0 && records) {
          const commitmentTime = new Date(commitment.created_at).getTime();
          commitmentRecords = records.filter(r => {
            const recordTime = new Date(r.created_at || r.processed_at).getTime();
            return Math.abs(recordTime - commitmentTime) < 10 * 60 * 1000;
          });

          // Perform in-memory and database backfill for these records to seal the link permanently
          for (const record of commitmentRecords) {
            console.info("[STORAGE_PATH_VALIDATION] Legacy Record Self-Heal trigger for Record:", record.id);
            
            // Find if there's already a payslip document generated for this record
            const { data: doc } = await supabaseAdmin
              .from('employee_payslip_documents')
              .select('*')
              .eq('payroll_record_id', record.id)
              .maybeSingle();

            const updatedMetadata = {
              ...(record.metadata || {}),
              commitment_id: commitment.id,
              upload_id: commitment.upload_id
            };

            const updateData: any = {
              metadata: updatedMetadata
            };

            if (doc?.pdf_url) {
              updateData.storage_path = doc.pdf_url;
              updateData.document_status = 'GENERATED';
              record.storage_path = doc.pdf_url;
              record.document_status = 'GENERATED';
            }

            // Perform permanent db updates to heal historical batch data
            await supabaseAdmin
              .from('payroll_records')
              .update(updateData)
              .eq('id', record.id);
            
            record.metadata = updatedMetadata;

            // Also ensure the employee_payslip_documents table has payroll_cycle_id populated
            if (doc && !doc.payroll_cycle_id) {
              await supabaseAdmin
                .from('employee_payslip_documents')
                .update({ payroll_cycle_id: commitment.id })
                .eq('id', doc.id);
            }
          }
        }

        // Format records list for high-fidelity QA trace & diagnostic panel rendering
        const formattedRecords = commitmentRecords.map(r => ({
          id: r.id,
          employee_id: r.employee_id,
          employee_name: r.employee ? `${r.employee.first_name} ${r.employee.last_name}` : 'Unknown Employee',
          employee_code: r.employee?.employee_code || 'N/A',
          document_status: r.document_status || 'PENDING',
          storage_path: r.storage_path,
          generation_error: r.generation_error
        }));

        enrichedCommitments.push({
          ...commitment,
          records: formattedRecords
        });
      }

      res.json(enrichedCommitments);
    } catch (error: any) {
      console.error("[PAYROLL_RECORD_FETCH_ERROR]", error);
      res.status(500).json({ message: error.message });
    }
  }



  /**
   * List all bulk uploads.
   */
  static async list(req: Request, res: Response) {
    try {
      const uploads = await BulkUploadService.getUploads();
      res.json(uploads);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Get single upload details.
   */
  static async getById(req: Request, res: Response) {
    try {
      const upload = await BulkUploadService.getUploadById(req.params.id);
      res.json(upload);
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  /**
   * Get rows for a specific upload.
   */
  static async getRows(req: Request, res: Response) {
    try {
      const rows = await BulkUploadService.getUploadRows(req.params.id);
      res.json(rows);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
  /**
   * Get historical payslips for the currently logged-in employee.
   */
  static async getMyPayslips(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      
      // 1. Get employee record for this user
      const { data: employee, error: empError } = await supabaseAdmin
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (empError || !employee) {
        return res.status(404).json({ message: 'Employee profile not found' });
      }

      // 2. Fetch payslips
      const { data: payslips, error: payError } = await supabaseAdmin
        .from('employee_payslip_documents')
        .select('*')
        .eq('employee_id', employee.id)
        .order('generated_at', { ascending: false });

      if (payError) throw payError;
      res.json(payslips);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Generates a secure, signed download URL for a specific payslip record.
   */
  static async getPayslipDownloadUrl(req: Request, res: Response) {
    try {
      const { recordId } = req.params;
      const user = (req as any).user;

      // 1. Generate Signed URL via Distribution Service
      const result = await PayslipDistributionService.getAdminSignedUrl(recordId);

      // 2. Audit the retrieval for compliance
      await supabaseAdmin.from('payroll_document_download_logs').insert({
        payslip_document_id: result.metadata.id,
        employee_id: result.metadata.employee_id,
        ip_address: req.ip,
        user_agent: req.get('User-Agent')
      });

      res.json({ 
        url: result.url,
        fileName: result.fileName,
        expiresIn: '3600s'
      });
    } catch (error: any) {
      console.error("[PAYSLIP_DOWNLOAD_ERROR]", error);
      res.status(500).json({ message: error.message });
    }
  }
}
