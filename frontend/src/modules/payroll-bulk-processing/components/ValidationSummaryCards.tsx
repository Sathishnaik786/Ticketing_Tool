import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Copy, BarChart3, AlertCircle } from 'lucide-react';
import { EnterpriseStatCard } from '@/components/payroll/EnterpriseComponents';

interface ValidationSummaryCardsProps {
  summary: {
    total: number;
    valid: number;
    invalid: number;
    duplicates: number;
  };
}

export const ValidationSummaryCards: React.FC<ValidationSummaryCardsProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <EnterpriseStatCard 
        title="Total Parsed"
        value={summary.total}
        icon={BarChart3}
        color="primary"
      />
      <EnterpriseStatCard 
        title="Valid Rows"
        value={summary.valid}
        icon={CheckCircle2}
        color="success"
        trend={`${((summary.valid / summary.total) * 100).toFixed(0)}% Integrity`}
        trendType="success"
      />
      <EnterpriseStatCard 
        title="Invalid Data"
        value={summary.invalid}
        icon={XCircle}
        color="danger"
        trend={summary.invalid > 0 ? "Requires Fix" : "Clean"}
        trendType={summary.invalid > 0 ? "danger" : "success"}
      />
      <EnterpriseStatCard 
        title="Duplicate IDs"
        value={summary.duplicates}
        icon={Copy}
        color="warning"
        trend={summary.duplicates > 0 ? "Conflict" : "Unique"}
        trendType={summary.duplicates > 0 ? "danger" : "neutral"}
      />
    </div>
  );
};
