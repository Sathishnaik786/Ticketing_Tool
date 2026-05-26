import React from 'react';
import { EnterpriseHeader, EnterpriseCard, EnterpriseStatCard } from '@/components/payroll/EnterpriseComponents';
import { ShieldCheck, Landmark, FileCheck, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PFCompliance = () => {
  return (
    <div className="space-y-10">
      <EnterpriseHeader 
        title="PF Compliance Center"
        description="Official statutory management for Provident Fund filings, contributions, and regulatory reporting."
        badge="Statutory Compliance"
      />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <EnterpriseStatCard title="Total Contribution" value="₹1.2Cr" icon={Landmark} color="primary" />
        <EnterpriseStatCard title="Active Members" value="1,240" icon={ShieldCheck} color="success" />
        <EnterpriseStatCard title="Filings Pending" value="02" icon={FileCheck} color="warning" />
        <EnterpriseStatCard title="Compliance Rate" value="100%" icon={ShieldCheck} color="success" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <EnterpriseCard className="lg:col-span-2" title="Provident Fund Ledger" description="Real-time tracking of employer and employee contributions.">
          <div className="h-96 flex items-center justify-center border-2 border-dashed border-border-soft rounded-[2rem] text-slate-400 font-bold uppercase tracking-widest bg-white/[0.02]">
            Contribution Ledger Data Grid
          </div>
        </EnterpriseCard>
        <div className="space-y-6">
           <EnterpriseCard title="Action Center" description="Critical compliance tasks.">
              <div className="space-y-3">
                 <Button variant="outline" className="w-full justify-between h-14 rounded-2xl bg-white dark:bg-slate-950 border-border-soft hover:border-primary/50 group">
                    <span className="flex items-center gap-3 font-bold text-xs uppercase tracking-tight">
                       <FileCheck size={18} className="text-primary" />
                       Generate ECR File
                    </span>
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                 </Button>
                 <Button variant="outline" className="w-full justify-between h-14 rounded-2xl bg-white dark:bg-slate-950 border-border-soft hover:border-primary/50 group">
                    <span className="flex items-center gap-3 font-bold text-xs uppercase tracking-tight">
                       <Landmark size={18} className="text-emerald-500" />
                       Payment Confirmation
                    </span>
                    <ArrowRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                 </Button>
              </div>
           </EnterpriseCard>
        </div>
      </div>
    </div>
  );
};

export default PFCompliance;
