import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface UploadDropzoneProps {
  onUpload: (file: File, name: string) => void;
  isUploading: boolean;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({ onUpload, isUploading }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      if (!uploadName) {
        setUploadName(acceptedFiles[0].name.replace(/\.[^/.]+$/, ""));
      }
    }
  }, [uploadName]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    multiple: false
  });

  const handleUpload = () => {
    if (file && uploadName) {
      onUpload(file, uploadName);
      setFile(null);
      setUploadName('');
    }
  };

  return (
    <div className="space-y-6">
      <div 
        {...getRootProps()} 
        className={cn(
          "relative group cursor-pointer rounded-[2.5rem] border-2 border-dashed transition-all duration-500 overflow-hidden",
          isDragActive ? "border-primary bg-primary/5 scale-[0.99]" : "border-slate-200 dark:border-white/10 hover:border-primary/50 hover:bg-slate-50/50 dark:hover:bg-white/[0.02]",
          file ? "border-emerald-500/50 bg-emerald-500/[0.02]" : ""
        )}
      >
        <input {...getInputProps()} />
        <div className="p-12 flex flex-col items-center text-center space-y-4">
          <div className={cn(
            "w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500",
            file ? "bg-emerald-500 text-white rotate-0" : "bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:rotate-12 group-hover:bg-primary/10 group-hover:text-primary"
          )}>
            {file ? <CheckCircle2 size={40} /> : <Upload size={40} />}
          </div>
          
          <div className="space-y-1">
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {file ? file.name : "Drop Payroll Master"}
            </h3>
            <p className="text-sm text-slate-500 font-medium max-w-xs mx-auto">
              {file ? `${(file.size / 1024).toFixed(1)} KB • Ready for validation` : "Drag and drop your Excel payroll file or click to browse local storage."}
            </p>
          </div>

          {file && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="rounded-xl text-rose-500 hover:bg-rose-500/10"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
              }}
            >
              <X className="mr-2 h-4 w-4" /> Remove File
            </Button>
          )}
        </div>
      </div>

      {file && (
        <div className="p-8 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-xl space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Batch Identifier</label>
            <Input 
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
              placeholder="e.g., April 2024 Final Payroll"
              className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-white/10 font-bold"
            />
          </div>
          
          <Button 
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary-hover text-white font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all disabled:opacity-50"
            disabled={!uploadName || isUploading}
            onClick={handleUpload}
          >
            {isUploading ? (
              <><Loader2 className="mr-3 h-5 w-5 animate-spin" /> Analyzing Data...</>
            ) : (
              <><FileText className="mr-3 h-5 w-5" /> Start Validation Engine</>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
