import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { payrollApi } from '../services/payrollService';
import { usePayrollStore } from '../store/usePayrollStore';
import { toast } from 'sonner';

export const usePayrollComponents = () => {
  const setComponents = usePayrollStore((state) => state.setComponents);
  const query = useQuery({
    queryKey: ['payroll', 'components'],
    queryFn: payrollApi.getComponents,
  });

  React.useEffect(() => {
    if (query.data) setComponents(query.data);
  }, [query.data, setComponents]);

  return query;
};

export const usePayrollStructures = () => {
  const setStructures = usePayrollStore((state) => state.setStructures);
  const query = useQuery({
    queryKey: ['payroll', 'structures'],
    queryFn: payrollApi.getStructures,
  });

  React.useEffect(() => {
    if (query.data) setStructures(query.data);
  }, [query.data, setStructures]);

  return query;
};

export const usePayrollAssignments = () => {
  const setAssignments = usePayrollStore((state) => state.setAssignments);
  const query = useQuery({
    queryKey: ['payroll', 'assignments'],
    queryFn: payrollApi.getAssignments,
  });

  React.useEffect(() => {
    if (query.data) setAssignments(query.data);
  }, [query.data, setAssignments]);

  return query;
};

export const usePayrollSettings = () => {
  const setSettings = usePayrollStore((state) => state.setSettings);
  const query = useQuery({
    queryKey: ['payroll', 'settings'],
    queryFn: payrollApi.getSettings,
  });

  React.useEffect(() => {
    if (query.data) setSettings(query.data);
  }, [query.data, setSettings]);

  return query;
};

// Mutations
export const useCreateComponent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: payrollApi.createComponent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll', 'components'] });
      toast.success('Salary component created successfully');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create component');
    },
  });
};

export const useUpdateComponent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => payrollApi.updateComponent(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll', 'components'] });
      toast.success('Salary component updated successfully');
    },
  });
};

export const useCreateStructure = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: payrollApi.createStructure,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll', 'structures'] });
      toast.success('Salary structure created successfully');
    },
  });
};

export const useAssignSalary = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: payrollApi.createAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll', 'assignments'] });
      toast.success('Salary assigned successfully');
    },
  });
};

// Phase 2 Hooks
export const usePayrollCycles = () => {
  return useQuery({
    queryKey: ['payroll', 'cycles'],
    queryFn: payrollApi.getCycles,
  });
};

export const usePayrollCycle = (id: string) => {
  return useQuery({
    queryKey: ['payroll', 'cycles', id],
    queryFn: () => payrollApi.getCycleById(id),
    enabled: !!id,
  });
};

export const usePayrollRecords = () => {
  return useQuery({
    queryKey: ['payroll', 'records'],
    queryFn: payrollApi.getRecords,
  });
};

export const usePayrollRecord = (id: string) => {
  return useQuery({
    queryKey: ['payroll', 'records', id],
    queryFn: () => payrollApi.getRecordById(id),
    enabled: !!id,
  });
};

export const useProcessingLogs = (cycleId: string) => {
  return useQuery({
    queryKey: ['payroll', 'logs', cycleId],
    queryFn: () => payrollApi.getLogs(cycleId),
    enabled: !!cycleId,
    refetchInterval: (query) => {
        // Poll if cycle is processing
        const logs = query.state.data;
        if (logs && logs.some(l => l.message.includes('Starting'))) return 3000;
        return false;
    }
  });
};

export const useCreateCycle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: payrollApi.createCycle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll', 'cycles'] });
      toast.success('Payroll cycle created successfully');
    },
  });
};

export const useProcessPayroll = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: payrollApi.processPayroll,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['payroll', 'cycles'] });
      queryClient.invalidateQueries({ queryKey: ['payroll', 'cycles', variables.cycleId] });
      queryClient.invalidateQueries({ queryKey: ['payroll', 'logs', variables.cycleId] });
      toast.success('Payroll processing started');
    },
  });
};

export const useLockCycle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => payrollApi.lockCycle(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['payroll', 'cycles'] });
      queryClient.invalidateQueries({ queryKey: ['payroll', 'cycles', id] });
      toast.success('Payroll cycle locked successfully');
    },
  });
};

// Phase 3 Hooks
export const useComplianceRules = () => {
  return useQuery({
    queryKey: ['payroll', 'compliance-rules'],
    queryFn: payrollApi.getComplianceRules,
  });
};

export const useTaxSlabs = () => {
  return useQuery({
    queryKey: ['payroll', 'tax-slabs'],
    queryFn: payrollApi.getTaxSlabs,
  });
};

export const useEmployeePayslips = (employeeId: string) => {
  return useQuery({
    queryKey: ['payroll', 'payslips', employeeId],
    queryFn: () => payrollApi.getPayslips(employeeId),
    enabled: !!employeeId,
  });
};

export const useGeneratePayslip = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => payrollApi.generatePayslip(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['payroll', 'payslips'] });
      toast.success('Payslip generated successfully');
    },
  });
};

// Phase 4 Hooks
export const usePayrollWorkflows = () => {
  return useQuery({
    queryKey: ['payroll', 'workflows'],
    queryFn: payrollApi.getWorkflows,
  });
};

export const usePendingApprovals = () => {
  return useQuery({
    queryKey: ['payroll', 'approvals', 'pending'],
    queryFn: payrollApi.getPendingApprovals,
  });
};

export const useApproveStep = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comments }: { id: string; comments?: string }) => 
      payrollApi.approveStep(id, comments),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll', 'approvals'] });
      toast.success('Approved successfully');
    },
  });
};

export const usePayrollVariances = () => {
  return useQuery({
    queryKey: ['payroll', 'variances'],
    queryFn: payrollApi.getVariances,
  });
};

export const usePayrollNotifications = () => {
  return useQuery({
    queryKey: ['payroll', 'notifications'],
    queryFn: payrollApi.getNotifications,
    refetchInterval: 60000, // Poll every minute
  });
};

// Phase 5 Hooks
export const usePayrollLedgers = () => {
  return useQuery({
    queryKey: ['payroll', 'ledgers'],
    queryFn: payrollApi.getLedgers,
  });
};

export const usePayrollJournals = () => {
  return useQuery({
    queryKey: ['payroll', 'journals'],
    queryFn: payrollApi.getJournals,
  });
};

export const usePostJournal = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (cycleId: string) => payrollApi.postJournal(cycleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll', 'journals'] });
      toast.success('Journal entries posted successfully');
    },
  });
};

export const usePayrollDisbursements = () => {
  return useQuery({
    queryKey: ['payroll', 'disbursements'],
    queryFn: payrollApi.getDisbursements,
  });
};

export const useProcessDisbursementBatch = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => payrollApi.processDisbursementBatch(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll', 'disbursements'] });
      toast.success('Disbursement batch processed');
    },
  });
};
