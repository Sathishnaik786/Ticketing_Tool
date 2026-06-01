export interface ExcelRowData {
  employeeCode: string;
  employeeName: string;
  department: string;
  designation: string;
  month: number;
  year: number;
  totalWorkingDays: number;
  basic: number;
  hra: number;
  specialAllowance: number;
  bonus: number;
  pf: number;
  esi: number;
  professionalTax: number;
  incomeTax: number;
  grossSalary: number;
  netSalary: number;
  bankName: string;
  bankAccount: string;
  uan: string;
  pan: string;
  [key: string]: any;
}

export interface ValidationResult {
  validRows: any[];
  invalidRows: any[];
  duplicateRows: any[];
  summary: {
    total: number;
    valid: number;
    invalid: number;
    duplicates: number;
  };
}

export enum UploadStatus {
  UPLOADED = 'UPLOADED',
  VALIDATING = 'VALIDATING',
  VALIDATED = 'VALIDATED',
  FAILED = 'FAILED'
}

export enum RowStatus {
  PENDING = 'PENDING',
  VALID = 'VALID',
  INVALID = 'INVALID',
  DUPLICATE = 'DUPLICATE',
  FAILED = 'FAILED'
}

export enum MappingStatus {
  MATCHED = 'MATCHED',
  PARTIAL_MATCH = 'PARTIAL_MATCH',
  AMBIGUOUS = 'AMBIGUOUS',
  NOT_FOUND = 'NOT_FOUND',
  DUPLICATE_PAYROLL = 'DUPLICATE_PAYROLL',
  INVALID = 'INVALID'
}

export enum MatchedBy {
  EMPLOYEE_CODE = 'EMPLOYEE_CODE',
  EMPLOYEE_NAME = 'EMPLOYEE_NAME',
  MANUAL_REVIEW = 'MANUAL_REVIEW'
}

export interface MappingResult {
  employeeId?: string;
  status: MappingStatus;
  confidence: number;
  notes?: string;
  matchedBy?: MatchedBy;
}

export interface PreviewSummary {
  totalRows: number;
  matchedRows: number;
  unmatchedRows: number;
  duplicateRows: number;
  invalidRows: number;
  grossTotal: number;
  netTotal: number;
  status: 'READY' | 'REVIEW_REQUIRED' | 'BLOCKED';
}

