import { cn } from '@/lib/utils';
import {
  AttendanceStatus,
  EmployeeStatus,
  LeaveStatus
} from '@/types';
import { CheckCircle2, XCircle, Clock, AlertCircle, Info, MinusCircle, UserCheck } from 'lucide-react';
import React from 'react';

interface StatusBadgeProps {
  status: AttendanceStatus | EmployeeStatus | LeaveStatus | string;
  className?: string;
  showIcon?: boolean;
}

const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
  // Attendance statuses
  PRESENT: { label: 'Present', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: <UserCheck size={12} /> },
  ABSENT: { label: 'Absent', className: 'bg-rose-500/10 text-rose-600 border-rose-500/20', icon: <XCircle size={12} /> },
  HALF_DAY: { label: 'Half Day', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: <Clock size={12} /> },
  LATE: { label: 'Late', className: 'bg-orange-500/10 text-orange-600 border-orange-500/20', icon: <AlertCircle size={12} /> },
  ON_LEAVE: { label: 'On Leave', className: 'bg-sky-500/10 text-sky-600 border-sky-500/20', icon: <Info size={12} /> },

  // Employee statuses
  ACTIVE: { label: 'Active', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: <CheckCircle2 size={12} /> },
  INACTIVE: { label: 'Inactive', className: 'bg-slate-500/10 text-slate-600 border-slate-500/20', icon: <MinusCircle size={12} /> },
  TERMINATED: { label: 'Terminated', className: 'bg-rose-500/10 text-rose-600 border-rose-500/20', icon: <XCircle size={12} /> },

  // Leave statuses
  PENDING: { label: 'Pending', className: 'bg-amber-500/10 text-amber-600 border-amber-500/20', icon: <Clock size={12} /> },
  APPROVED: { label: 'Approved', className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', icon: <CheckCircle2 size={12} /> },
  REJECTED: { label: 'Rejected', className: 'bg-rose-500/10 text-rose-600 border-rose-500/20', icon: <XCircle size={12} /> },
  CANCELLED: { label: 'Cancelled', className: 'bg-slate-500/10 text-slate-600 border-slate-500/20', icon: <MinusCircle size={12} /> },
};

export function StatusBadge({ status, className, showIcon = true }: StatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
    icon: <Info size={12} />
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border transition-all duration-300',
      config.className,
      className
    )}>
      {showIcon && config.icon}
      {config.label}
    </span>
  );
}
