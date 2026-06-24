import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const DownloadPayrollTemplateButton = () => {
  const handleDownload = async () => {
    try {
      const response = await fetch('/api/payroll-bulk/template/download');
      if (!response.ok) throw new Error('Failed to download template');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Enterprise_Payroll_Template_${new Date().getFullYear()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Enterprise Payroll Template Downloaded');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Could not download template. Please check server connection.');
    }
  };

  return (
    <Button 
      onClick={handleDownload}
      variant="outline"
      className="rounded-2xl h-12 px-6 border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all"
    >
      <Download size={14} />
      Download Template
    </Button>
  );
};
