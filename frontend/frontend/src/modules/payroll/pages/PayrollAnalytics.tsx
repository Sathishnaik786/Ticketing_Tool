import React from 'react';
import { EnterpriseHeader, EnterpriseCard, EnterpriseStatCard } from '@/components/payroll/EnterpriseComponents';
import { BarChart3, TrendingUp, PieChart, ArrowUpRight } from 'lucide-react';
import { PayrollDashboardSkeleton } from '@/components/payroll/PayrollSkeletons';

const PayrollAnalytics = () => {
  return (
    <div className="space-y-10">
      <EnterpriseHeader 
        title="Payroll Analytics"
        description="Deep intelligence on workforce compensation trends, budget utilization, and historical growth."
        badge="Intelligence Hub"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EnterpriseStatCard title="Budget Utilization" value="94.2%" icon={PieChart} color="primary" trend="+2.1%" trendType="success" />
        <EnterpriseStatCard title="YOY Growth" value="+12.4%" icon={TrendingUp} color="success" />
        <EnterpriseStatCard title="Headcount Impact" value="₹2.4M" icon={BarChart3} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <EnterpriseCard title="Compensation Trends" description="Monthly gross vs net distribution across all departments.">
          <div className="h-80 flex items-center justify-center border-2 border-dashed border-border-soft rounded-[2rem] text-slate-400 font-bold uppercase tracking-widest bg-white/[0.02]">
            Trend Analysis Visualization
          </div>
        </EnterpriseCard>
        <EnterpriseCard title="Departmental Breakdown" description="Budget allocation by cost center.">
          <div className="h-80 flex items-center justify-center border-2 border-dashed border-border-soft rounded-[2rem] text-slate-400 font-bold uppercase tracking-widest bg-white/[0.02]">
            Allocation Heatmap
          </div>
        </EnterpriseCard>
      </div>
    </div>
  );
};

export default PayrollAnalytics;
