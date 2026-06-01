import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Download, Eye, RefreshCw, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { BulkUploadService } from '@/modules/payroll-bulk-processing/services/bulkUploadService';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';

export default function MyPayslips() {
  const { toast } = useToast();
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPayslips();
  }, []);

  const fetchPayslips = async () => {
    try {
      setLoading(true);
      const data = await BulkUploadService.getMyPayslips();
      setPayslips(data || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch payslips',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (payslipId: string) => {
    try {
      setActionLoadingId(payslipId);
      const url = await BulkUploadService.getPayslipViewUrl(payslipId);
      if (url) {
        window.open(url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to view payslip',
        variant: 'destructive',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDownload = async (payslipId: string) => {
    try {
      setActionLoadingId(payslipId);
      const url = await BulkUploadService.getPayslipDownloadUrl(payslipId);
      if (url) {
        window.open(url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to download payslip',
        variant: 'destructive',
      });
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <>
      <PageHeader title="My Payslips" description="View and download your official published payslips." />
      
      {loading ? (
        <Card>
          <CardContent className="py-12 text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Loading your payslips...</p>
          </CardContent>
        </Card>
      ) : payslips.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground font-medium text-lg">No Payslips Available</p>
            <p className="text-sm text-slate-400 mt-2">Your payslips will appear here once published by HR.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {payslips.map((payslip) => (
            <Card key={payslip.id} className="relative overflow-hidden group border-slate-200 dark:border-white/10 hover:border-blue-500/50 transition-colors">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full -mr-10 -mt-10 transition-transform group-hover:scale-110" />
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
                      <FileText size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">
                        {payslip.payroll_records?.period_start_date ? format(new Date(payslip.payroll_records.period_start_date), 'MMMM yyyy') : 'Unknown Period'}
                      </h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">#{payslip.payslip_number}</p>
                    </div>
                  </div>
                  <BadgeCheck className="text-emerald-500" size={24} />
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-end border-b border-slate-100 dark:border-white/5 pb-4">
                    <span className="text-sm text-slate-500 uppercase tracking-widest font-semibold">Net Pay</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {formatCurrency(payslip.payroll_records?.net_payable || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Published: {format(new Date(payslip.published_at), 'dd MMM yyyy')}</span>
                    <span>Downloads: {payslip.download_count || 0}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => handleView(payslip.id)}
                    disabled={actionLoadingId === payslip.id}
                  >
                    {actionLoadingId === payslip.id ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Eye className="mr-2 h-4 w-4" />}
                    View
                  </Button>
                  <Button 
                    variant="default" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleDownload(payslip.id)}
                    disabled={actionLoadingId === payslip.id}
                  >
                    {actionLoadingId === payslip.id ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
