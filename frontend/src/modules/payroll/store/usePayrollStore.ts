import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { 
  SalaryComponent, 
  SalaryStructure, 
  EmployeeSalaryAssignment, 
  PayrollSetting,
  PayrollCycle,
  PayrollRecord
} from '../types/payroll';

interface PayrollState {
  // Data
  components: SalaryComponent[];
  structures: SalaryStructure[];
  assignments: EmployeeSalaryAssignment[];
  settings: PayrollSetting[];
  activeCycles: PayrollCycle[];
  selectedRecord: PayrollRecord | null;
  
  // UI State
  loading: boolean;
  error: string | null;

  // Actions
  setComponents: (components: SalaryComponent[]) => void;
  setStructures: (structures: SalaryStructure[]) => void;
  setAssignments: (assignments: EmployeeSalaryAssignment[]) => void;
  setSettings: (settings: PayrollSetting[]) => void;
  setActiveCycles: (cycles: PayrollCycle[]) => void;
  setSelectedRecord: (record: PayrollRecord | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  components: [],
  structures: [],
  assignments: [],
  settings: [],
  activeCycles: [],
  selectedRecord: null,
  loading: false,
  error: null,
};

export const usePayrollStore = create<PayrollState>()(
  devtools(
    (set) => ({
      ...initialState,

      setComponents: (components) => set({ components }, false, 'payroll/setComponents'),
      setStructures: (structures) => set({ structures }, false, 'payroll/setStructures'),
      setAssignments: (assignments) => set({ assignments }, false, 'payroll/setAssignments'),
      setSettings: (settings) => set({ settings }, false, 'payroll/setSettings'),
      setActiveCycles: (cycles) => set({ activeCycles: cycles }, false, 'payroll/setActiveCycles'),
      setSelectedRecord: (record) => set({ selectedRecord: record }, false, 'payroll/setSelectedRecord'),
      setLoading: (loading) => set({ loading }, false, 'payroll/setLoading'),
      setError: (error) => set({ error }, false, 'payroll/setError'),
      reset: () => set(initialState, false, 'payroll/reset'),
    }),
    { name: 'PayrollStore' }
  )
);

export default usePayrollStore;
