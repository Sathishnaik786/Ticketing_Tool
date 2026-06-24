import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EnterpriseEmptyStateProps {
  title: string;
  description: string;
  icon: LucideIcon;
  action?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  className?: string;
  variant?: 'default' | 'compact' | 'ghost';
}

export const EnterpriseEmptyState: React.FC<EnterpriseEmptyStateProps> = ({
  title,
  description,
  icon: Icon,
  action,
  className,
  variant = 'default'
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        variant === 'default' && "py-24 px-8",
        variant === 'compact' && "py-12 px-6",
        variant === 'ghost' && "py-8 px-4",
        className
      )}
    >
      <div className="relative group">
        <div className="absolute inset-0 bg-primary/20 rounded-[2.5rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <div className="relative w-24 h-24 rounded-[2.5rem] bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 flex items-center justify-center text-slate-300 dark:text-slate-700 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
          <Icon size={48} className="group-hover:text-primary transition-colors duration-500" />
        </div>
      </div>

      <div className="mt-8 space-y-2 max-w-sm">
        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
          {title}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
          {description}
        </p>
      </div>

      {action && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-10"
        >
          <Button 
            onClick={action.onClick}
            className="btn-premium group"
          >
            {action.icon && <action.icon className="mr-2 h-4 w-4 group-hover:rotate-12 transition-transform" />}
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};
