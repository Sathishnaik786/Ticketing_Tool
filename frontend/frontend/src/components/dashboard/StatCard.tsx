import { cn } from '@/lib/utils';
import { LucideIcon, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-primary',
  className
}: StatCardProps) {
  const isPositive = changeType === 'positive';
  const isNegative = changeType === 'negative';

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.01 }}
      className={cn(
        "enterprise-card p-8 relative overflow-hidden group border-white/5",
        className
      )}
    >
      {/* Dynamic Background Glow */}
      <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-[60px] group-hover:bg-primary/20 transition-all duration-700 opacity-0 group-hover:opacity-100" />
      
      {/* Glass Shine Effect */}
      <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/[0.03] to-transparent skew-x-[-25deg] group-hover:left-[150%] transition-all duration-1000" />

      <div className="flex items-start justify-between relative z-10">
        <div className="space-y-6">
          <p className="enterprise-subheading text-slate-600 dark:text-slate-300 group-hover:text-primary transition-colors duration-300">{title}</p>
          <div className="flex items-baseline gap-3">
            <h3 className="enterprise-heading text-5xl font-black tracking-[-0.05em] text-foreground">{value}</h3>
          </div>

          {change && (
            <div className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ring-1 ring-inset transition-all duration-300 group-hover:shadow-sm",
              isPositive && "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white",
              isNegative && "bg-rose-500/10 text-rose-500 ring-rose-500/20 group-hover:bg-rose-500 group-hover:text-white",
              !isPositive && !isNegative && "bg-slate-500/10 text-slate-500 ring-slate-500/20 group-hover:bg-slate-500 group-hover:text-white"
            )}>
              {isPositive && <TrendingUp size={14} className="group-hover:scale-110 transition-transform" />}
              {isNegative && <TrendingDown size={14} className="group-hover:scale-110 transition-transform" />}
              {!isPositive && !isNegative && <Minus size={14} className="group-hover:scale-110 transition-transform" />}
              <span>{change}</span>
            </div>
          )}
        </div>

        <div className={cn(
          "h-16 w-16 rounded-[1.25rem] flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-2xl group-hover:shadow-primary/30 relative overflow-hidden",
          "bg-gradient-to-br from-slate-50 to-slate-100 dark:from-white/5 dark:to-white/[0.02]",
          "border border-white/10",
          iconColor
        )}>
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Icon className="h-8 w-8 relative z-10" />
        </div>
      </div>

      {/* Decorative progress indicator */}
      <div className="absolute bottom-0 left-0 w-full h-[4px] bg-muted/10">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "100%" }}
          transition={{ duration: 2, ease: "circOut", delay: 0.2 }}
          className={cn(
            "h-full transition-colors duration-500",
            isPositive ? "bg-emerald-500/60" : isNegative ? "bg-rose-500/60" : "bg-primary/40"
          )}
        />
      </div>
    </motion.div>
  );
}
