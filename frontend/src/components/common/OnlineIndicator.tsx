import React from 'react';
import { useOnlineStatus } from '@/contexts/OnlineStatusContext';
import { cn } from '@/lib/utils';

interface OnlineIndicatorProps {
  firstName: string;
  lastName: string;
  email: string;
  position?: string;
  role?: string;
  profileImage?: string;
  className?: string;
}

export function OnlineIndicator({ firstName, lastName, email, profileImage, position, role, className = '' }: OnlineIndicatorProps) {
  const initials = `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  const { isOnline } = useOnlineStatus();
  
  return (
    <div className={cn("flex items-center gap-3 p-1.5 pr-5 rounded-full cursor-pointer group", className || "liquid-capsule")}>
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-white/30 dark:ring-cyan-500/25 group-hover:ring-cyan-500/55 group-hover:scale-105 transition-all duration-500 shadow-[0_4px_12px_rgba(0,0,0,0.10)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.35)]">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="eager"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-600/20 to-teal-700/5 text-cyan-600 dark:text-cyan-300 group-hover:text-cyan-500 transition-colors">
              <span className="text-sm font-black tracking-tight">{initials}</span>
            </div>
          )}
        </div>
        <div 
          className={cn(
            "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-950 transition-all duration-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]",
            isOnline ? "bg-emerald-500 scale-105 shadow-[0_0_10px_rgba(16,185,129,0.6)]" : "bg-slate-400"
          )}
        />
      </div>
      <div className="hidden sm:block text-left min-w-0">
        <p className="text-sm font-bold text-slate-800 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors truncate tracking-tight">
          {firstName} {lastName}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <p className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest truncate">
            {role}
          </p>
          <span className="h-1 w-1 rounded-full bg-slate-300 dark:bg-slate-700" />
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
            {position || 'Verified'}
          </p>
        </div>
      </div>
    </div>
  );
}