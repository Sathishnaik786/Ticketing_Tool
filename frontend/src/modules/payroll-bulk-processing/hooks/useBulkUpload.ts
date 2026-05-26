import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BulkUploadService } from '../services/bulkUploadService';
import { toast } from 'sonner';

export const useBulkUploads = () => {
  return useQuery({
    queryKey: ['payroll-bulk-uploads'],
    queryFn: BulkUploadService.getUploads,
  });
};

export const useBulkUploadDetail = (id: string) => {
  return useQuery({
    queryKey: ['payroll-bulk-upload', id],
    queryFn: () => BulkUploadService.getUploadById(id),
    enabled: !!id,
  });
};

export const useBulkUploadRows = (id: string) => {
  return useQuery({
    queryKey: ['payroll-bulk-upload-rows', id],
    queryFn: () => BulkUploadService.getUploadRows(id),
    enabled: !!id,
  });
};

export const useUploadPayroll = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, name }: { file: File; name: string }) =>
      BulkUploadService.uploadFile(file, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-bulk-uploads'] });
      toast.success('File uploaded and validated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to upload file');
    },
  });
};

export const useBulkMappings = (uploadId: string) => {
  return useQuery({
    queryKey: ['payroll-bulk-mappings', uploadId],
    queryFn: () => BulkUploadService.getMappings(uploadId),
    enabled: !!uploadId,
  });
};

export const useBulkPreview = (uploadId: string) => {
  return useQuery({
    queryKey: ['payroll-bulk-preview', uploadId],
    queryFn: () => BulkUploadService.getPreview(uploadId),
    enabled: !!uploadId,
  });
};

export const useMapEmployees = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uploadId: string) => BulkUploadService.mapEmployees(uploadId),
    retry: false,
    onSuccess: (_, uploadId) => {
      queryClient.invalidateQueries({ queryKey: ['payroll-bulk-mappings', uploadId] });
      queryClient.invalidateQueries({ queryKey: ['payroll-bulk-preview', uploadId] });
      toast.success('Employee mapping triggered successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to map employees');
    },
  });
};

export const useUpdateMapping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uploadId, rowId, employeeId, notes }: { uploadId: string; rowId: string; employeeId: string; notes?: string }) =>
      BulkUploadService.updateMapping(uploadId, rowId, employeeId, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payroll-bulk-mappings', variables.uploadId] });
      queryClient.invalidateQueries({ queryKey: ['payroll-bulk-preview', variables.uploadId] });
      toast.success('Mapping updated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update mapping');
    },
  });
};

export const useCommitUpload = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uploadId: string) => BulkUploadService.commitUpload(uploadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-bulk-commitments'] });
      toast.success('Payroll commitment triggered successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to commit payroll');
    },
  });
};

export const useBulkCommitments = () => {
  return useQuery({
    queryKey: ['payroll-bulk-commitments'],
    queryFn: () => BulkUploadService.getCommitments(),
  });
};

export const useRetryCommitmentDocs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commitmentId: string) => {
        console.info("[PAYSLIP_RETRY_STARTED]", commitmentId);
        return BulkUploadService.retryCommitmentDocs(commitmentId);
    },
    onSuccess: (_, commitmentId) => {
      console.info("[PAYSLIP_RETRY_SUCCESS]", commitmentId);
      queryClient.invalidateQueries({ queryKey: ['payroll-bulk-commitments'] });
      toast.success('Payslip regeneration triggered successfully');
    },
    onError: (error: any, commitmentId) => {
      console.error("[PAYSLIP_RETRY_FAILED]", commitmentId, error);
      toast.error(error.response?.data?.message || 'Failed to retry payslip generation');
    },
  });
};

export const useMyPayslips = () => {
  return useQuery({
    queryKey: ['my-payslips'],
    queryFn: () => BulkUploadService.getMyPayslips(),
  });
};


