import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface AnalyticsStatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  status?: 'good' | 'warning' | 'critical';
  className?: string;
}

export function AnalyticsStatCard({
  title,
  value,
  icon: Icon,
  change,
  changeType = 'neutral',
  status,
  className
}: AnalyticsStatCardProps) {
  const statusColors = {
    good: 'border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-400',
    warning: 'border-amber-500/20 bg-amber-500/5 text-amber-700 dark:text-amber-400',
    critical: 'border-rose-500/20 bg-rose-500/5 text-rose-700 dark:text-rose-400'
  };

  const changeColors = {
    positive: 'text-emerald-600 dark:text-emerald-400',
    negative: 'text-rose-600 dark:text-rose-400',
    neutral: 'text-muted-foreground'
  };

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      className="h-full"
    >
      <Card className={cn(
        'enterprise-card h-full relative overflow-hidden group',
        status && statusColors[status],
        className
      )}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
          <CardTitle className="enterprise-subheading group-hover:text-primary transition-colors">
            {title}
          </CardTitle>
          <div className="h-10 w-10 rounded-xl bg-muted/50 group-hover:bg-primary/10 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-sm">
            <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </div>
        </CardHeader>
        <CardContent className="relative z-10 space-y-3">
          <div className="text-4xl font-black tracking-tight text-foreground">{value}</div>
          {change && (
            <div className={cn(
              'inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all group-hover:shadow-soft group-hover:bg-background',
              changeColors[changeType] === 'text-muted-foreground' ? 'bg-muted/30' : 'bg-background/50 ring-1 ring-inset ring-current/10',
              changeColors[changeType]
            )}>
              {change}
            </div>
          )}
        </CardContent>

        {/* Executive Shine Effect */}
        <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent skew-x-[-25deg] group-hover:left-[150%] transition-all duration-1000" />
        
        {/* Decorative corner glow */}
        <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all duration-700" />
      </Card>
    </motion.div>
  );
}