import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  FileText, 
  Download, 
  Eye, 
  ArrowLeft,
  Search,
  CheckCircle2,
  XCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  EnterpriseHeader, 
  EnterpriseCard,
  EnterpriseStatCard
} from '@/components/payroll/EnterpriseComponents';
import { BulkUploadService } from '../services/bulkUploadService';
import { Badge } from '@/components/ui/badge';
import { formatCurrency, cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from 'sonner';

const CommitmentDetailsPage = () => {
  const { commitmentId } = useParams<{ commitmentId: string }>();
  const navigate = useNavigate();

  const { data: records = [], isLoading } = useQuery({
    queryKey: ['commitment-records', commitmentId],
    queryFn: async () => {
      // Fetch records for this commitment
      // For now, we fetch all payroll records and filter (or use a dedicated endpoint)
      const response = await BulkUploadService.getCommitments(); // Mocking fetch for individual records
      return []; // Placeholder until dedicated endpoint
    },
    enabled: !!commitmentId
  });

  const handleDownload = async (recordId: string, employeeName: string) => {
    try {
      const url = await BulkUploadService.getAdminPayslipDownloadUrl(recordId);
      window.open(url, '_blank');
      toast.success(`Opening payslip for ${employeeName}`);
    } catch (error) {
      toast.error('Payslip not generated or access denied');
    }
  };

  return (
    <div className="space-y-10 pb-20 px-8">
      <EnterpriseHeader 
        title="Commitment Batch Resolution"
        description={`Audit and retrieval for Commitment: #${commitmentId?.substring(0, 8)}`}
        badge="Post-Commitment Audit"
        actions={
          <Button onClick={() => navigate(-1)} variant="outline" className="rounded-2xl h-12 px-6 border-slate-200 font-black uppercase tracking-widest flex items-center gap-2">
            <ArrowLeft size={16} /> Back to Ledger
          </Button>
        }
      />

      <div className="p-20 text-center space-y-4 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-white/5 bg-slate-50/30">
          <div className="w-16 h-16 rounded-[2rem] bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto text-slate-300">
              <Search size={32} />
          </div>
          <div className="space-y-1">
              <p className="text-sm font-black text-slate-400 uppercase tracking-widest text-center">Batch Document Ledger In-Progress</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase text-center">Individual record auditing is being synchronized with the immutable ledger.</p>
          </div>
      </div>
    </div>
  );
};

export default CommitmentDetailsPage;
