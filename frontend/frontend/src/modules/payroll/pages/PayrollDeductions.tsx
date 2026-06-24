import React from 'react';
import { EnterpriseHeader, EnterpriseCard, EnterpriseStatCard } from '@/components/payroll/EnterpriseComponents';
import { CreditCard, Wallet, ShieldCheck, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

const PayrollDeductions = () => {
  return (
    <div className="space-y-10">
      <EnterpriseHeader 
        title="Deductions Management"
        description="Configure and audit statutory, voluntary, and organizational deductions across the workforce."
        badge="Financial Control"
        actions={
          <Button className="btn-premium">
            <Download className="mr-2 h-4 w-4" /> Export Report
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <EnterpriseStatCard title="Total Deductions" value="₹84.5k" icon={Wallet} color="danger" />
        <EnterpriseStatCard title="Statutory PF" value="₹42.1k" icon={ShieldCheck} color="primary" />
        <EnterpriseStatCard title="Income Tax (TDS)" value="₹38.2k" icon={CreditCard} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <EnterpriseCard title="Deduction Breakdown" description="Distribution of deduction categories.">
           <div className="h-80 flex items-center justify-center border-2 border-dashed border-border-soft rounded-[2rem] text-slate-400 font-bold uppercase tracking-widest bg-white/[0.02]">
             Category Analytics
           </div>
        </EnterpriseCard>
        <EnterpriseCard title="Compliance Health" description="Verification of deduction logic against current labor laws.">
           <div className="h-80 flex items-center justify-center border-2 border-dashed border-border-soft rounded-[2rem] text-slate-400 font-bold uppercase tracking-widest bg-white/[0.02]">
             Compliance Validation Engine
           </div>
        </EnterpriseCard>
      </div>
    </div>
  );
};

export default PayrollDeductions;
