import React, { useState, useRef } from 'react';
import { Upload, FileText, X, CheckCircle2, AlertCircle, ShieldCheck, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';

interface UploadDropzoneProps {
  onUpload: (file: File, name: string) => void;
  isUploading: boolean;
}

export const UploadDropzone = ({ onUpload, isUploading }: UploadDropzoneProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    const isExcel = selectedFile.name.match(/\.(xlsx|xls|csv)$/);
    if (!isExcel) {
      alert("Invalid file type. Please upload an Excel or CSV file.");
      return;
    }
    setFile(selectedFile);
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = () => {
    if (file) {
      // Simulate progress for premium feel
      setUploadProgress(0);
      const interval = setInterval(() => {
          setUploadProgress(prev => {
              if (prev >= 90) {
                  clearInterval(interval);
                  return 90;
              }
              return prev + 10;
          });
      }, 200);
      
      onUpload(file, file.name);
    }
  };

  const clearFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setUploadProgress(0);
  };

  return (
    <div className="space-y-6">
      <div 
        className={cn(
          "relative group cursor-pointer rounded-[2rem] border-2 border-dashed transition-all duration-500 min-h-[300px] flex flex-col items-center justify-center p-10 overflow-hidden",
          dragActive ? "border-primary bg-primary/5 scale-[0.99]" : "border-slate-200 dark:border-white/10 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-white/[0.02]",
          file && "border-emerald-500/50 bg-emerald-500/5"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!file ? onButtonClick : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".xlsx,.xls,.csv"
          onChange={handleChange}
        />
        
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="absolute top-10 right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
            <div className="absolute bottom-10 left-10 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl" />
        </div>

        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div 
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-center space-y-6 relative z-10"
            >
              <div className="w-20 h-20 rounded-3xl bg-slate-100 dark:bg-white/5 flex items-center justify-center mx-auto group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                <Upload className="text-slate-400 group-hover:text-primary transition-colors" size={32} />
              </div>
              <div>
                <p className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Drop Payroll Master</p>
                <p className="text-sm text-slate-500 font-medium mt-2">XLSX, XLS or CSV files up to 10MB</p>
              </div>
              <Button variant="outline" className="rounded-xl border-slate-200 dark:border-white/10 font-bold h-11 px-8" onClick={onButtonClick}>
                Browse Files
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              key="selected"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6 relative z-10 w-full max-w-sm"
            >
              <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto relative group/file">
                <FileText size={32} />
                <button 
                    onClick={clearFile}
                    className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white dark:bg-slate-900 shadow-lg border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 hover:text-rose-500 transition-colors"
                >
                    <X size={16} />
                </button>
              </div>
              <div>
                <p className="text-lg font-black text-slate-900 dark:text-white truncate px-4">{file.name}</p>
                <p className="text-[10px] text-emerald-600 font-black uppercase tracking-widest mt-1">Ready for Ingestion</p>
              </div>
              
              {isUploading ? (
                <div className="space-y-3">
                    <Progress value={uploadProgress} className="h-1.5 bg-emerald-500/10" indicatorClassName="bg-emerald-500" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Encrypting & Uploading...</p>
                </div>
              ) : (
                <Button 
                    className="w-full h-14 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleUpload();
                    }}
                >
                    Process Batch <CheckCircle2 className="ml-2 h-4 w-4" />
                </Button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-4 px-6">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <ShieldCheck size={14} className="text-emerald-500" /> End-to-End Encrypted
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <AlertCircle size={14} className="text-blue-500" /> Auto-Validation Active
          </div>
      </div>
    </div>
  );
};


