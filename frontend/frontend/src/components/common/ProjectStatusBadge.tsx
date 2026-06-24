import React from 'react';
import { cn } from '@/lib/utils';
import { Target, Clock, Pause, CheckCircle2, Archive, Rocket } from 'lucide-react';

interface ProjectStatusBadgeProps {
  status: string;
  className?: string;
  showIcon?: boolean;
}

const ProjectStatusBadge: React.FC<ProjectStatusBadgeProps> = ({
  status,
  className,
  showIcon = true
}) => {
  const getStatusConfig = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CREATED':
        return {
          label: 'Initialization',
          className: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
          icon: <Target size={12} />
        };
      case 'ASSIGNED':
      case 'ACTIVE':
        return {
          label: 'Deployed',
          className: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
          icon: <Rocket size={12} />
        };
      case 'IN_PROGRESS':
        return {
          label: 'Operational',
          className: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
          icon: <Clock size={12} />
        };
      case 'ON_HOLD':
        return {
          label: 'Paused',
          className: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
          icon: <Pause size={12} />
        };
      case 'COMPLETED':
      case 'DONE':
        return {
          label: 'Finalized',
          className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
          icon: <CheckCircle2 size={12} />
        };
      case 'ARCHIVED':
        return {
          label: 'Archived',
          className: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
          icon: <Archive size={12} />
        };
      default:
        return {
          label: status,
          className: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
          icon: <Target size={12} />
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border transition-all duration-300 backdrop-blur-sm',
        config.className,
        className
      )}
    >
      {showIcon && config.icon}
      {config.label}
    </span>
  );
};

export default ProjectStatusBadge;