import React, { lazy, Suspense } from 'react';
import { RouteObject } from 'react-router-dom';
import { RouteErrorBoundary } from '@/components/common/RouteErrorBoundary';
import { PayrollDashboardSkeleton } from '@/components/payroll/PayrollSkeletons';
import { guardFromMetadata } from '@/config/routeMetadata.utils';

// Core Pages
const PayrollDashboard = lazy(() => import('./pages/PayrollDashboard'));
const SalaryComponents = lazy(() => import('./pages/SalaryComponents'));
const SalaryStructures = lazy(() => import('./pages/SalaryStructures'));
const SalaryAssignments = lazy(() => import('./pages/SalaryAssignments'));
const PayrollSettings = lazy(() => import('./pages/PayrollSettings'));
const PayrollCycles = lazy(() => import('./pages/PayrollCycles'));
const PayrollCycleDetail = lazy(() => import('./pages/PayrollCycleDetail'));
const PayrollRecordDetail = lazy(() => import('./pages/PayrollRecordDetail'));
const ComplianceRules = lazy(() => import('./pages/ComplianceRules'));
const TaxSlabs = lazy(() => import('./pages/TaxSlabs'));
const EmployeePayslips = lazy(() => import('./pages/EmployeePayslips'));

// Governance & Intelligence
const GovernanceDashboard = lazy(() => import('./pages/GovernanceDashboard'));
const ApprovalQueue = lazy(() => import('./pages/ApprovalQueue'));
const VarianceDashboard = lazy(() => import('./pages/VarianceDashboard'));
const PayrollAnalytics = lazy(() => import('./pages/PayrollAnalytics'));
const PayrollVariance = lazy(() => import('./pages/PayrollVariance'));
const PayrollDeductions = lazy(() => import('./pages/PayrollDeductions'));
const PFCompliance = lazy(() => import('./pages/PFCompliance'));

// Finance & Ops
const JournalEntries = lazy(() => import('./pages/JournalEntries'));
const DisbursementDashboard = lazy(() => import('./pages/DisbursementDashboard'));
const ErpExportCenter = lazy(() => import('./pages/ErpExportCenter'));

const SuspenseLoader = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<PayrollDashboardSkeleton />}>
    {children}
  </Suspense>
);

const g = (path: string, node: React.ReactNode) => guardFromMetadata(path, node);

export const payrollRoutes: RouteObject[] = [
  {
    path: 'payroll',
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: g('/app/payroll', <SuspenseLoader><PayrollDashboard /></SuspenseLoader>) },
      { path: 'analytics', element: g('/app/payroll/analytics', <SuspenseLoader><PayrollAnalytics /></SuspenseLoader>) },
      { path: 'variance', element: g('/app/payroll/variance', <SuspenseLoader><PayrollVariance /></SuspenseLoader>) },
      { path: 'deductions', element: g('/app/payroll/deductions', <SuspenseLoader><PayrollDeductions /></SuspenseLoader>) },
      { path: 'components', element: g('/app/payroll/components', <SuspenseLoader><SalaryComponents /></SuspenseLoader>) },
      { path: 'structures', element: g('/app/payroll/structures', <SuspenseLoader><SalaryStructures /></SuspenseLoader>) },
      { path: 'assignments', element: g('/app/payroll/assignments', <SuspenseLoader><SalaryAssignments /></SuspenseLoader>) },
      { path: 'settings', element: g('/app/payroll/settings', <SuspenseLoader><PayrollSettings /></SuspenseLoader>) },
      { path: 'cycles', element: g('/app/payroll/cycles', <SuspenseLoader><PayrollCycles /></SuspenseLoader>) },
      { path: 'cycles/:id', element: g('/app/payroll/cycles/:id', <SuspenseLoader><PayrollCycleDetail /></SuspenseLoader>) },
      { path: 'records/:id', element: g('/app/payroll/records/:id', <SuspenseLoader><PayrollRecordDetail /></SuspenseLoader>) },
      {
        path: 'compliance',
        children: [
          { index: true, element: g('/app/payroll/compliance', <SuspenseLoader><ComplianceRules /></SuspenseLoader>) },
          { path: 'pf', element: g('/app/payroll/compliance/pf', <SuspenseLoader><PFCompliance /></SuspenseLoader>) },
        ],
      },
      { path: 'tax-slabs', element: g('/app/payroll/tax-slabs', <SuspenseLoader><TaxSlabs /></SuspenseLoader>) },
      { path: 'my-payslips', element: g('/app/payroll/my-payslips', <SuspenseLoader><EmployeePayslips /></SuspenseLoader>) },
      {
        path: 'governance',
        children: [
          { index: true, element: g('/app/payroll/governance', <SuspenseLoader><GovernanceDashboard /></SuspenseLoader>) },
          { path: 'approvals', element: g('/app/payroll/governance/approvals', <SuspenseLoader><ApprovalQueue /></SuspenseLoader>) },
          { path: 'variances', element: g('/app/payroll/governance/variances', <SuspenseLoader><VarianceDashboard /></SuspenseLoader>) },
        ],
      },
      {
        path: 'finance',
        children: [
          { path: 'journals', element: g('/app/payroll/finance/journals', <SuspenseLoader><JournalEntries /></SuspenseLoader>) },
          { path: 'disbursements', element: g('/app/payroll/finance/disbursements', <SuspenseLoader><DisbursementDashboard /></SuspenseLoader>) },
          { path: 'erp-export', element: g('/app/payroll/finance/erp-export', <SuspenseLoader><ErpExportCenter /></SuspenseLoader>) },
        ],
      },
    ],
  },
];

