import React from 'react';
import { EnterpriseHeader, EnterpriseCard, EnterpriseStatCard } from '@/components/payroll/EnterpriseComponents';
import { AlertCircle, ShieldAlert, Activity, ArrowRight } from 'lucide-react';

const PayrollVariance = () => {
  return (
    <div className="space-y-10">
      <EnterpriseHeader 
        title="Variance Intelligence"
        description="Monitor and investigate deviations between actual payroll outcomes and structural baselines."
        badge="Quality Assurance"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EnterpriseStatCard title="Flagged Records" value="24" icon={ShieldAlert} color="danger" trend="6 Critical" trendType="danger" />
        <EnterpriseStatCard title="Mean Deviation" value="₹4,250" icon={AlertCircle} color="warning" />
        <EnterpriseStatCard title="Stability Score" value="96.8%" icon={Activity} color="success" />
      </div>

      <EnterpriseCard title="Active Anomaly Grid" description="Detailed investigation into records exceeding standard deviation thresholds.">
        <div className="h-96 flex items-center justify-center border-2 border-dashed border-border-soft rounded-[2rem] text-slate-400 font-bold uppercase tracking-widest bg-white/[0.02]">
          Anomaly Detection Engine Initializing...
        </div>
      </EnterpriseCard>
    </div>
  );
};

export default PayrollVariance;
