import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  ShieldCheck,
  UserPlus,
  Info,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  EnterpriseHeader, 
  EnterpriseCard 
} from '@/components/payroll/EnterpriseComponents';
import { Input } from '@/components/ui/input';
import { useUpdateMapping } from '../hooks/useBulkUpload';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { employeesApi } from '@/services/api';
import { cn } from '@/lib/utils';

const PayrollMappingReview = () => {
  const { uploadId, rowId } = useParams<{ uploadId: string, rowId: string }>();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const updateMutation = useUpdateMapping();

  useEffect(() => {
    if (search.length > 2) {
      const fetchEmployees = async () => {
        setLoading(true);
        try {
          const response = await employeesApi.getAll({ search, limit: 5 });
          setEmployees(response.data || []);
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchEmployees();
    }
  }, [search]);

  const handleUpdate = async () => {
    if (uploadId && rowId && selectedEmployee) {
      await updateMutation.mutateAsync({
        uploadId,
        rowId,
        employeeId: selectedEmployee.id,
        notes
      });
      navigate(`/app/payroll/bulk/preview/${uploadId}`);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      <EnterpriseHeader 
        title="Identity Resolution Hub"
        description="Manually override or resolve ambiguous employee mappings for structural consistency."
        badge="Manual Review"
        actions={
          <Button 
            variant="ghost" 
            className="font-bold text-slate-500 hover:text-primary" 
            onClick={() => navigate(`/app/payroll/bulk/preview/${uploadId}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Cancel Review
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <EnterpriseCard title="Employee Discovery" description="Search the global entity directory for identity matching.">
            <div className="space-y-6">
              <div className="relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-primary transition-colors">
                  <Search size={20} />
                </div>
                <Input 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by Employee Code, Name, or Email..."
                  className="h-16 pl-14 rounded-[1.5rem] border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-950 font-bold text-base shadow-sm focus:ring-4 focus:ring-primary/10 transition-all"
                />
              </div>

              <div className="space-y-3">
                {employees.map((emp) => (
                  <motion.div 
                    key={emp.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedEmployee(emp)}
                    className={cn(
                        "p-6 rounded-[2rem] border transition-all cursor-pointer group flex items-center justify-between",
                        selectedEmployee?.id === emp.id 
                            ? "bg-primary/5 border-primary shadow-xl shadow-primary/5" 
                            : "bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 hover:border-primary/50"
                    )}
                  >
                    <div className="flex items-center gap-5">
                        <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl transition-all",
                            selectedEmployee?.id === emp.id ? "bg-primary text-white" : "bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:bg-primary/10 group-hover:text-primary"
                        )}>
                            {emp.first_name[0]}{emp.last_name[0]}
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">{emp.first_name} {emp.last_name}</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                <ShieldCheck size={12} className="text-primary" /> {emp.employee_id} • {emp.department?.name || 'General Org'}
                            </p>
                        </div>
                    </div>
                    {selectedEmployee?.id === emp.id && (
                        <CheckCircle2 className="text-primary" size={24} />
                    )}
                  </motion.div>
                ))}

                {search.length > 2 && employees.length === 0 && !loading && (
                    <div className="py-12 text-center text-slate-400 font-black uppercase tracking-widest text-[10px]">
                        No matching entities found in the directory
                    </div>
                )}
              </div>
            </div>
          </EnterpriseCard>

          {selectedEmployee && (
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
            >
                <EnterpriseCard title="Identity Finalization" description="Provide administrative context for this manual override.">
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reviewer Notes</label>
                            <Input 
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="e.g., Confirmed identity via Aadhaar verification..."
                                className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-white/10 font-bold"
                            />
                        </div>
                        <Button 
                            className="w-full h-16 rounded-[1.5rem] bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all"
                            onClick={handleUpdate}
                            disabled={updateMutation.isPending}
                        >
                            {updateMutation.isPending ? <RefreshCw className="mr-2 h-5 w-5 animate-spin" /> : <UserPlus className="mr-2 h-5 w-5" />}
                            Confirm & Map Identity
                        </Button>
                    </div>
                </EnterpriseCard>
            </motion.div>
          )}
        </div>

        <div className="space-y-10">
          <EnterpriseCard title="Mapping Protocol" description="Structural compliance check.">
             <div className="space-y-6 py-4">
                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-2">
                   <div className="flex items-center gap-2 text-blue-600">
                      <Info size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Confidence Metrics</span>
                   </div>
                   <p className="text-[11px] text-blue-700 dark:text-blue-400 font-medium leading-relaxed">
                     Manual resolution sets confidence to <span className="font-bold">100%</span> and marks the record as verified.
                   </p>
                </div>
                <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 space-y-2">
                   <div className="flex items-center gap-2 text-amber-600">
                      <ShieldCheck size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest">Audit Trail</span>
                   </div>
                   <p className="text-[11px] text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                     Every manual override is logged with the reviewer's ID and timestamp for enterprise audit compliance.
                   </p>
                </div>
             </div>
          </EnterpriseCard>
        </div>
      </div>
    </div>
  );
};

export default PayrollMappingReview;
