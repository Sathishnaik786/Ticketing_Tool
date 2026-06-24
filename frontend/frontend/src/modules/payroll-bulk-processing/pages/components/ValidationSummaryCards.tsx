import React from 'react';
import { 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  FileText, 
  Zap,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { EnterpriseStatCard } from '@/components/payroll/EnterpriseComponents';

interface ValidationSummary {
  total_rows: number;
  valid_rows: number;
  error_rows: number;
  total_gross?: number;
  total_net?: number;
}

interface ValidationSummaryCardsProps {
  summary: ValidationSummary;
}

export const ValidationSummaryCards = ({ summary }: ValidationSummaryCardsProps) => {
  const errorPercentage = summary.total_rows > 0 
    ? Math.round((summary.error_rows / summary.total_rows) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <EnterpriseStatCard 
        title="Total Records"
        value={summary.total_rows}
        icon={FileText}
        color="primary"
      />
      <EnterpriseStatCard 
        title="Clean Records"
        value={summary.valid_rows}
        icon={CheckCircle2}
        trend={`${Math.round((summary.valid_rows / (summary.total_rows || 1)) * 100)}%`}
        trendType="success"
        color="success"
      />
      <EnterpriseStatCard 
        title="Error Rows"
        value={summary.error_rows}
        icon={XCircle}
        trend={`${errorPercentage}% failure`}
        trendType={summary.error_rows > 0 ? 'danger' : 'neutral'}
        color="danger"
      />
      <EnterpriseStatCard 
        title="Est. Liability"
        value={summary.total_gross ? `₹${(summary.total_gross / 100000).toFixed(1)}L` : 'TBD'}
        icon={TrendingUp}
        color="warning"
      />
    </div>
  );
};
