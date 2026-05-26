import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const EnterpriseCard = ({ children, className, title, description, headerActions, variant = 'default' }: { 
  children: React.ReactNode; 
  className?: string;
  title?: string;
  description?: string;
  headerActions?: React.ReactNode;
  variant?: 'default' | 'teal' | 'glass';
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, ease: [0.2, 0, 0, 1] }}
    className={cn(
      "enterprise-card group/card relative overflow-hidden font-sans", 
      variant === 'teal' && "glass-panel-teal",
      variant === 'glass' && "bg-white/5 backdrop-blur-3xl border-white/10",
      className
    )}
  >
    {/* Intelligent Shine Effect */}
    <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent skew-x-[-25deg] group-hover/card:left-[150%] transition-all duration-1000 ease-in-out" />

    {(title || description || headerActions) && (
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-8 pb-4 relative z-10">
        <div className="space-y-1">
          {title && <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 group-hover/card:text-teal-400 transition-colors">{title}</CardTitle>}
          {description && <CardDescription className="text-xs text-slate-400 dark:text-slate-300 font-bold leading-relaxed">{description}</CardDescription>}
        </div>
        {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
      </CardHeader>
    )}
    <CardContent className="p-8 pt-4 relative z-10">{children}</CardContent>
  </motion.div>
);

export const EnterpriseStatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendType = 'neutral',
  className,
  color = 'primary'
}: { 
  title: string; 
  value: string | number; 
  icon: LucideIcon; 
  trend?: string;
  trendType?: 'success' | 'danger' | 'warning' | 'neutral';
  className?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'payroll' | 'pf' | 'finance' | 'teal';
}) => {
  const colorMap = {
    primary: 'bg-primary/10 text-primary ring-primary/20',
    success: 'bg-emerald-500/10 text-emerald-500 ring-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-500 ring-amber-500/20',
    danger: 'bg-rose-500/10 text-rose-500 ring-rose-500/20',
    payroll: 'bg-indigo-500/10 text-indigo-500 ring-indigo-500/20',
    pf: 'bg-emerald-500/10 text-emerald-500 ring-emerald-500/20',
    finance: 'bg-purple-500/10 text-purple-500 ring-purple-500/20',
    teal: 'bg-teal-500/10 text-teal-400 ring-teal-500/20',
  };

  const trendColors = {
    success: 'bg-emerald-500/10 text-emerald-500',
    danger: 'bg-rose-500/10 text-rose-500',
    warning: 'bg-amber-500/10 text-amber-500',
    neutral: 'bg-slate-100 dark:bg-slate-800 text-slate-500',
  };

  return (
    <EnterpriseCard className={cn("p-0 group/stat border-none shadow-none bg-transparent font-sans", className)}>
      <div className="flex items-center justify-between mb-8">
        <div className={cn(
          "h-16 w-16 rounded-[2rem] flex items-center justify-center ring-8 ring-white/5 transition-all duration-700 group-hover/stat:scale-110 group-hover/stat:rotate-6 shadow-2xl", 
          colorMap[color]
        )}>
          <Icon size={30} />
        </div>
        {trend && (
          <span className={cn("text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-2xl shadow-sm", trendColors[trendType])}>
            {trend}
          </span>
        )}
      </div>
      <div className="space-y-2">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500 group-hover/stat:text-teal-400 transition-colors">{title}</p>
        <h3 className="font-display font-black tracking-tighter text-slate-900 dark:text-white group-hover/stat:scale-[1.02] transition-transform origin-left leading-none" style={{ fontSize: 'var(--font-size-kpi)' }}>{value}</h3>
      </div>
    </EnterpriseCard>
  );
};

export const EnterpriseHeader = ({ 
  title, 
  description, 
  badge, 
  actions,
  isCinematic = false
}: { 
  title: string; 
  description?: string; 
  badge?: string; 
  actions?: React.ReactNode;
  isCinematic?: boolean;
}) => (
  <div className="flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20 font-sans">
    <div className="space-y-6">
      {badge && (
        <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-teal-500/10 text-teal-400 text-[10px] font-black uppercase tracking-[0.4em] border border-teal-500/20 shadow-sm shadow-teal-500/10">
          <div className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
          {badge}
        </div>
      )}
      <div className="space-y-2">
        <h1 className={cn(
          "font-display font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-[0.85]",
          isCinematic ? "enterprise-heading" : "text-7xl"
        )}>
          {isCinematic ? <span className="text-gradient-teal">{title}</span> : title}
        </h1>
        {description && <p className="text-slate-600 dark:text-slate-400 font-bold max-w-2xl text-xl tracking-tight leading-relaxed">{description}</p>}
      </div>
    </div>
    {actions && <div className="flex items-center gap-4 pt-6 md:pt-0">{actions}</div>}
  </div>
);

export const EnterpriseEmptyState = ({ 
  title, 
  description, 
  icon: Icon, 
  action 
}: { 
  title: string; 
  description: string; 
  icon: LucideIcon;
  action?: React.ReactNode;
}) => (
  <div className="flex flex-col items-center justify-center text-center py-32 px-6 space-y-8 font-sans">
    <div className="w-32 h-32 rounded-[3.5rem] bg-slate-50 dark:bg-white/5 flex items-center justify-center text-slate-300 border border-slate-200 dark:border-white/10 shadow-2xl">
      <Icon size={56} className="opacity-40" />
    </div>
    <div className="space-y-3">
      <h3 className="font-display text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{title}</h3>
      <p className="text-slate-500 font-bold max-w-sm mx-auto text-sm">{description}</p>
    </div>
    {action && <div className="pt-6">{action}</div>}
  </div>
);

export const EnterpriseErrorState = ({ 
  title = "Nexus Connectivity Failure", 
  description = "A critical synchronization error occurred in the operational layer. Verify your authentication credentials and network integrity.", 
  onRetry 
}: { 
  title?: string; 
  description?: string; 
  onRetry?: () => void;
}) => (
  <EnterpriseCard className="p-16 text-center flex flex-col items-center gap-8 border-rose-500/20 bg-rose-500/5 backdrop-blur-3xl font-sans">
    <div className="w-24 h-24 rounded-[3rem] bg-rose-500/10 text-rose-500 flex items-center justify-center shadow-2xl border border-rose-500/20">
      <ShieldAlert size={48} />
    </div>
    <div className="space-y-3">
      <h3 className="font-display text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">{title}</h3>
      <p className="text-slate-500 font-bold max-w-md mx-auto">{description}</p>
    </div>
    {onRetry && (
      <Button onClick={onRetry} className="h-16 px-12 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-rose-500/40">
        Retry Operational Sync
      </Button>
    )}
  </EnterpriseCard>
);
