import { supabaseAdmin } from '@lib/supabase';

export class PayslipStorageService {
  // Phase 2: One standardized institutional bucket constant
  public static readonly BUCKET_NAME = 'payroll-payslips';
  private static bucketInitialized = false;

  /**
   * Phase 3: Auto Create Bucket Safely on Backend Startup/Usage
   * Idempotently checks if the payslip storage bucket exists, and creates it if not.
   */
  static async ensureBucketExists(): Promise<void> {
    if (this.bucketInitialized) return;

    try {
      console.info(`[STORAGE_INITIALIZATION] Checking bucket "${this.BUCKET_NAME}"...`);
      const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
      
      if (listError) {
        console.error('[STORAGE_INITIALIZATION] Error listing buckets:', listError.message);
        throw listError;
      }

      const bucketExists = buckets.some(b => b.name === this.BUCKET_NAME);

      if (!bucketExists) {
        console.info(`[STORAGE_INITIALIZATION] Bucket "${this.BUCKET_NAME}" not found. Auto-creating...`);
        
        // Private bucket, pdf mime only, 10MB size limit
        const { error: createError } = await supabaseAdmin.storage.createBucket(this.BUCKET_NAME, {
          public: false,
          allowedMimeTypes: ['application/pdf'],
          fileSizeLimit: 10485760 // 10MB
        });

        if (createError) {
          console.error(`[STORAGE_INITIALIZATION] Failed to create bucket "${this.BUCKET_NAME}":`, createError.message);
          throw createError;
        }
        console.info(`[STORAGE_INITIALIZATION] Bucket "${this.BUCKET_NAME}" successfully created and configured!`);
      } else {
        console.info(`[STORAGE_INITIALIZATION] Bucket "${this.BUCKET_NAME}" is active and ready.`);
      }

      this.bucketInitialized = true;
    } catch (err: any) {
      console.error('[STORAGE_INITIALIZATION] Fatal storage initialization error:', err.message);
    }
  }

  /**
   * Phase 5: Hardened Upload with PDF Buffer Validation & Path Standardization
   */
  static async uploadPayslip(params: {
    employeeId: string;
    fileName: string;
    buffer: Buffer;
  }): Promise<string> {
    const { employeeId, fileName, buffer } = params;

    // Validate PDF buffer exists & is populated
    if (!buffer || buffer.length === 0) {
      throw new Error('Invalid PDF buffer: Buffer is empty or undefined');
    }

    // Ensure bucket is auto-created and initialized
    await this.ensureBucketExists();

    // Phase 4: Deterministic Paths: payroll/<year>/<month>/<employeeCode>/<payslipNumber>.pdf
    let year = new Date().getFullYear().toString();
    let monthName = new Date().toLocaleString('en-US', { month: 'long' }).toLowerCase();

    const payslipNumber = fileName.replace('.pdf', '');
    const dateMatch = payslipNumber.match(/PAY-(\d{4})(\d{2})/);
    if (dateMatch) {
      year = dateMatch[1];
      const monthNum = parseInt(dateMatch[2]);
      const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
      if (monthNum >= 1 && monthNum <= 12) {
        monthName = months[monthNum - 1];
      }
    }

    // Fetch employee_code dynamically
    const { data: employee } = await supabaseAdmin
      .from('employees')
      .select('employee_code')
      .eq('id', employeeId)
      .maybeSingle();

    const employeeCode = employee?.employee_code || employeeId;

    // Standardized deterministic path
    const filePath = `payroll/${year}/${monthName}/${employeeCode}/${payslipNumber}.pdf`;

    console.info(`[STORAGE_UPLOAD_START] Target Path: ${filePath}, Bucket: ${this.BUCKET_NAME}`);

    const { data, error } = await supabaseAdmin.storage
      .from(this.BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (error) {
      console.error(`[STORAGE_UPLOAD_FAILURE] Error uploading file to ${filePath}:`, error.message);
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    if (!data || !data.path) {
      throw new Error('Storage upload failed: Empty response data from storage service');
    }

    console.info(`[PDF_UPLOAD_SUCCESS] File uploaded successfully to: ${data.path}`);
    return data.path;
  }

  /**
   * Phase 6: Hardened Signed URL fixed response format
   */
  static async getSignedUrl(filePath: string) {
    // Ensure bucket is initialized
    await this.ensureBucketExists();

    const { data, error } = await supabaseAdmin.storage
      .from(this.BUCKET_NAME)
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) {
      console.error(`[SIGNED_URL_FAILURE] Error generating link for ${filePath}:`, error.message);
      throw error;
    }

    return {
      success: true,
      signedUrl: data.signedUrl
    };
  }
}
