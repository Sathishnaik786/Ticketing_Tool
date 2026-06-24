import React from 'react';
import { ShieldCheck } from 'lucide-react';

export default function TrustBadge() {
  return (
    <div className="flex items-center justify-center gap-1.5 pt-5 mt-1 border-t border-slate-200/50 dark:border-white/10 w-full select-none text-[10px] font-bold text-slate-450 dark:text-slate-500 tracking-wider uppercase font-sans transition-colors duration-500">
      <ShieldCheck size={12} className="text-orange-550 dark:text-orange-500" />
      <span>SOC2 Certified • AES 256 • 99.9% SLA</span>
    </div>
  );
}
