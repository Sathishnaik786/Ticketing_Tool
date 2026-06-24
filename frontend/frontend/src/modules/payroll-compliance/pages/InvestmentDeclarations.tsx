import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  Save, 
  Upload, 
  Calculator,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { EnterpriseHeader } from '@/components/ui/EnterpriseHeader';
import { EnterpriseCard } from '@/components/ui/EnterpriseCard';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

const InvestmentDeclarations = () => {
  const [formData, setFormData] = useState({
    section_80c: 0,
    section_80d: 0,
    hra_paid: 0,
    nps_contribution: 0
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: Number(value) || 0 }));
  };

  const submitMutation = useMutation({
    mutationFn: async (data: any) => {
        // Mock API call for Phase 3
        toast.success('Investment Declarations Submitted for Review');
    }
  });

  const totalDeductions = Math.min(formData.section_80c, 150000) + Math.min(formData.section_80d, 25000) + formData.nps_contribution;

  return (
    <div className="space-y-10 pb-20 px-8">
      <EnterpriseHeader 
        title="Tax Savings & Investment Declarations"
        description="Declare your investments under Section 80C, 80D, and HRA to optimize your tax liability."
        badge="FY 2024-25"
        actions={
          <div className="flex items-center gap-4">
             <Button 
                variant="outline"
                className="rounded-2xl h-12 px-6 border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
             >
                <Calculator size={14} />
                Tax Projection
             </Button>
             <Button 
                onClick={() => submitMutation.mutate(formData)}
                className="rounded-2xl h-12 px-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-slate-500/10"
             >
                <Save size={16} />
                Submit Declarations
             </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <EnterpriseCard title="Section 80C Deductions" description="Investments in PPF, ELSS, LIC, and School Fees (Max: 1,50,000 INR)">
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Investment Amount</label>
                            <Input 
                                type="number" 
                                placeholder="0.00" 
                                className="rounded-xl h-12 border-slate-100 font-black"
                                onChange={(e) => handleInputChange('section_80c', e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                <ShieldCheck size={18} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase text-slate-400">Calculated Benefit</p>
                                <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(Math.min(formData.section_80c, 150000))}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </EnterpriseCard>

            <EnterpriseCard title="Section 80D: Medical Insurance" description="Premium paid for self, spouse, and children (Max: 25,000 INR)">
                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Premium Amount</label>
                            <Input 
                                type="number" 
                                placeholder="0.00" 
                                className="rounded-xl h-12 border-slate-100 font-black"
                                onChange={(e) => handleInputChange('section_80d', e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                                <FileText size={18} />
                            </div>
                            <div>
                                <p className="text-[9px] font-black uppercase text-slate-400">Calculated Benefit</p>
                                <p className="text-sm font-black text-slate-900 dark:text-white">{formatCurrency(Math.min(formData.section_80d, 25000))}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </EnterpriseCard>
        </div>

        <div className="space-y-8">
            <EnterpriseCard title="Declaration Summary" description="Yearly tax saving projection.">
                <div className="space-y-6 py-4">
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/20">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Deductions</p>
                            <p className="text-xl font-black">{formatCurrency(totalDeductions)}</p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                            <Calculator size={24} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-2">
                            <span className="text-[10px] font-black uppercase text-slate-400">Status</span>
                            <Badge className="bg-amber-500/10 text-amber-600 border-none rounded-lg text-[9px] font-black uppercase">Pending Submission</Badge>
                        </div>
                        <div className="flex items-center justify-between px-2">
                            <span className="text-[10px] font-black uppercase text-slate-400">Verification</span>
                            <Badge className="bg-slate-100 text-slate-500 border-none rounded-lg text-[9px] font-black uppercase">Unverified</Badge>
                        </div>
                    </div>

                    <div className="p-5 rounded-[2rem] bg-amber-500/5 border border-amber-500/10 space-y-3">
                        <div className="flex items-center gap-3">
                            <AlertCircle size={16} className="text-amber-600" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600">Proof Required</p>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                            Once submitted, you must upload supporting documents (LIC receipts, Rent receipts) for HR verification.
                        </p>
                    </div>
                </div>
            </EnterpriseCard>

            <EnterpriseCard title="Compliance Status" description="Your legal readiness.">
                <div className="space-y-4 py-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <CheckCircle2 size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400">PAN Linked</p>
                            <p className="text-xs font-black text-slate-900 dark:text-white">VERIFIED</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <CheckCircle2 size={20} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase text-slate-400">UAN Assigned</p>
                            <p className="text-xs font-black text-slate-900 dark:text-white">VERIFIED</p>
                        </div>
                    </div>
                </div>
            </EnterpriseCard>
        </div>
      </div>
    </div>
  );
};

export default InvestmentDeclarations;
