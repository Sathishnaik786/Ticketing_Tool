import { apiCall } from '@/services/api';
import { BulkUpload, BulkUploadRow, UploadResponse } from '../types';

export const BulkUploadService = {
  uploadFile: async (file: File, name: string): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('uploadName', name);

    return apiCall('/payroll-bulk/upload', 'POST', formData);
  },

  getUploads: async (): Promise<BulkUpload[]> => {
    const response = await apiCall('/payroll-bulk/uploads', 'GET');
    return response.data || response;
  },

  getUploadById: async (id: string): Promise<BulkUpload> => {
    const response = await apiCall(`/payroll-bulk/uploads/${id}`, 'GET');
    return response.data || response;
  },

  getUploadRows: async (id: string): Promise<BulkUploadRow[]> => {
    const response = await apiCall(`/payroll-bulk/uploads/${id}/rows`, 'GET');
    return response.data || response;
  },

  mapEmployees: async (uploadId: string): Promise<any> => {
    const response = await apiCall(`/payroll-bulk/${uploadId}/map-employees`, 'POST');
    return response.data || response;
  },

  getMappings: async (uploadId: string): Promise<any[]> => {
    const response = await apiCall(`/payroll-bulk/${uploadId}/mappings`, 'GET');
    return response.data || response;
  },

  getPreview: async (uploadId: string): Promise<any> => {
    const response = await apiCall(`/payroll-bulk/${uploadId}/preview`, 'GET');
    return response.data || response;
  },

  updateMapping: async (uploadId: string, rowId: string, employeeId: string, notes?: string): Promise<any> => {
    const response = await apiCall(`/payroll-bulk/${uploadId}/review/${rowId}`, 'POST', { employeeId, notes });
    return response.data || response;
  },

  commitUpload: async (uploadId: string): Promise<any> => {
    const response = await apiCall(`/payroll-bulk/${uploadId}/commit`, 'POST');
    return response.data || response;
  },

  getCommitments: async (): Promise<any[]> => {
    const response = await apiCall('/payroll-bulk/commitments', 'GET');
    return response.data || response;
  },

  retryCommitmentDocs: async (commitmentId: string): Promise<any> => {
    return apiCall(`/payroll-bulk/commitments/${commitmentId}/retry-docs`, 'POST');
  },

  getMyPayslips: async (): Promise<any[]> => {
    const response = await apiCall('/my-payslips/my/payslips', 'GET');
    return response.data || response;
  },

  getPayslipDownloadUrl: async (payslipId: string): Promise<string> => {
    const response = await apiCall(`/my-payslips/my/payslips/download/${payslipId}`, 'GET');
    return (response.data || response).url;
  },

  getAdminPayslipDownloadUrl: async (recordId: string): Promise<string> => {
    const response = await apiCall(`/payroll-bulk/payslips/${recordId}/download`, 'GET');
    return (response.data || response).url;
  },

  getIdentityReadiness: async (): Promise<any> => {
    const response = await apiCall('/payroll-bulk/identity/readiness', 'GET');
    return response.data || response;
  },

  normalizeEmployeeIdentity: async (employeeId: string): Promise<any> => {
    const response = await apiCall(`/payroll-bulk/identity/${employeeId}/normalize`, 'POST');
    return response.data || response;
  },

  backfillCodes: async (): Promise<any> => {
    const response = await apiCall('/payroll-bulk/identity/backfill-codes', 'POST');
    return response.data || response;
  },

  repairIdentityData: async (): Promise<any> => {
    const response = await apiCall('/payroll-bulk/identity/repair', 'POST');
    return response.data || response;
  },

  validateIdentityIntegrity: async (): Promise<any> => {
    const response = await apiCall('/payroll-bulk/identity/validate-integrity', 'GET');
    return response.data || response;
  },

  // ==========================================
  // PAYSLIP TEMPLATE GOVERNANCE API METHODS
  // ==========================================
  getTemplates: async (): Promise<any[]> => {
    const response = await apiCall('/payroll-bulk/templates', 'GET');
    return response.data || response;
  },

  getActiveTemplate: async (): Promise<any> => {
    const response = await apiCall('/payroll-bulk/templates/active', 'GET');
    return response.data || response;
  },

  createTemplate: async (templateData: any): Promise<any> => {
    const response = await apiCall('/payroll-bulk/templates', 'POST', templateData);
    return response.data || response;
  },

  updateTemplate: async (id: string, templateData: any): Promise<any> => {
    const response = await apiCall(`/payroll-bulk/templates/${id}`, 'PUT', templateData);
    return response.data || response;
  },

  activateTemplate: async (id: string): Promise<any> => {
    const response = await apiCall(`/payroll-bulk/templates/${id}/activate`, 'POST');
    return response.data || response;
  },

  getPayslipVersions: async (recordId: string): Promise<any[]> => {
    const response = await apiCall(`/payroll-bulk/payslips/${recordId}/versions`, 'GET');
    return response.data || response;
  },

  regeneratePayslip: async (recordId: string, reason: string): Promise<any> => {
    const response = await apiCall(`/payroll-bulk/payslips/${recordId}/regenerate`, 'POST', { reason });
    return response.data || response;
  },
};




