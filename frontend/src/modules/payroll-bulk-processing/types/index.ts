export type UploadStatus = 'UPLOADED' | 'VALIDATING' | 'VALIDATED' | 'FAILED';
export type RowStatus = 'PENDING' | 'VALID' | 'INVALID' | 'DUPLICATE' | 'FAILED';

export interface BulkUpload {
  id: string;
  organization_id?: string;
  upload_name: string;
  uploaded_by: string;
  upload_status: UploadStatus;
  total_rows: number;
  successful_rows: number;
  failed_rows: number;
  original_file_name: string;
  original_file_url?: string;
  validation_summary: {
    total: number;
    valid: number;
    invalid: number;
    duplicates: number;
    error?: string;
  };
  processing_started_at?: string;
  processing_completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface BulkUploadRow {
  id: string;
  upload_id: string;
  row_number: number;
  employee_code: string;
  employee_name: string;
  department: string;
  designation: string;
  payroll_month: number;
  payroll_year: number;
  gross_salary: number;
  net_salary: number;
  upload_status: RowStatus;
  validation_errors: Array<{ path: string; message: string }>;
  raw_data: any;
  created_at: string;
}

export type MappingStatus = 'MATCHED' | 'PARTIAL_MATCH' | 'AMBIGUOUS' | 'NOT_FOUND' | 'DUPLICATE_PAYROLL' | 'INVALID';

export interface BulkUploadMapping {
  id: string;
  upload_row_id: string;
  employee_id?: string;
  mapping_status: MappingStatus;
  mapping_confidence: number;
  mapping_notes?: string;
  matched_by?: 'EMPLOYEE_CODE' | 'EMPLOYEE_NAME' | 'MANUAL_REVIEW';
  row: BulkUploadRow;
  employee?: {
    id: string;
    first_name: string;
    last_name: string;
    employee_id: string;
  };
}

export interface PreviewSummary {
  id: string;
  upload_id: string;
  total_rows: number;
  matched_rows: number;
  unmatched_rows: number;
  duplicate_rows: number;
  invalid_rows: number;
  gross_total: number;
  net_total: number;
  preview_status: 'READY' | 'REVIEW_REQUIRED' | 'BLOCKED';
}

export interface BulkCommitment {
  id: string;
  upload_id: string;
  commitment_status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'PARTIAL_FAILURE' | 'FAILED';
  total_committed: number;
  total_failed: number;
  gross_total: number;
  net_total: number;
  committed_by: string;
  committed_at: string;
  created_at: string;
  upload?: { upload_name: string };
}

export interface EmployeePayslip {
  id: string;
  employee_id: string;
  payroll_record_id: string;
  payslip_number: string;
  pdf_url: string;
  pdf_hash: string;
  verification_token: string;
  generated_at: string;
}

export interface UploadResponse {
  uploadId: string;
  summary: {
    total: number;
    valid: number;
    invalid: number;
    duplicates: number;
  };
}


