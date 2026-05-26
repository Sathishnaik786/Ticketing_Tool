import { ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface CrudModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

export function CrudModal({ open, onOpenChange, title, description, children, size = 'md' }: CrudModalProps) {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-[95vw] h-[90vh]',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        sizeClasses[size], 
        "p-0 overflow-hidden border-0 bg-transparent shadow-none"
      )}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
          className="w-full h-fit max-h-[90vh] bg-white dark:bg-[#141B2D] rounded-[2.5rem] border border-white/10 shadow-2xl flex flex-col relative overflow-hidden"
        >
          {/* Subtle Background Glow */}
          <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
          
          <DialogHeader className="p-8 pb-4 relative z-10">
            <div className="space-y-1">
              <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">
                {title}
              </DialogTitle>
              {description ? (
                <DialogDescription className="text-sm font-medium text-slate-500">
                  {description}
                </DialogDescription>
              ) : (
                <DialogDescription className="sr-only">Modal for {title}</DialogDescription>
              )}
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-8 pb-8 scrollbar-premium relative z-10">
            {children}
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}