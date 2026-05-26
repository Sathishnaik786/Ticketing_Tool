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
    <div className={cn("flex items-center gap-3 p-1.5 pr-4 rounded-2xl transition-all duration-300 hover:bg-white/5 group border border-transparent hover:border-white/5 active:scale-95 cursor-pointer", className)}>
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-xl overflow-hidden ring-2 ring-white/5 group-hover:ring-blue-500/40 transition-all shadow-lg">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="eager"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500/20 to-blue-500/5 text-blue-400">
              <span className="text-sm font-black tracking-tight">{initials}</span>
            </div>
          )}
        </div>
        <div 
          className={cn(
            "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[#0B1020] shadow-glow transition-all duration-300",
            isOnline ? "bg-emerald-500 animate-pulse scale-110" : "bg-slate-500"
          )}
        />
      </div>
      <div className="hidden sm:block text-left min-w-0">
        <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors truncate tracking-tight">
          {firstName} {lastName}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <p className="text-[10px] font-black text-blue-400/80 uppercase tracking-widest truncate">
            {role}
          </p>
          <span className="h-1 w-1 rounded-full bg-slate-700" />
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider truncate">
            {position || 'Verified'}
          </p>
        </div>
      </div>
    </div>
  );
}