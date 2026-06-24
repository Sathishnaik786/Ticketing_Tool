import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/utils/queryKeys';
import { employeesApi } from '@/services/api';
import { Users, User, Circle } from 'lucide-react';
import { PresenceIndicator } from './PresenceIndicator';
import { cn } from '@/lib/utils';

export function OnlineUsersPanel() {
  const { data: employeesResponse } = useQuery({
    queryKey: queryKeys.employees({ limit: 100 }),
    queryFn: () => employeesApi.getAll({ limit: 100 }),
  });
  const employees = employeesResponse?.data || [];

  // Categorize online/offline for demonstration
  const onlineEmployees = React.useMemo(() => {
    return employees.map((emp: any) => {
      // Alternate online status for demo
      const numCode = emp.first_name.charCodeAt(0) + (emp.last_name?.charCodeAt(0) || 0);
      return {
        ...emp,
        online: numCode % 2 === 0
      };
    });
  }, [employees]);

  const activeCount = onlineEmployees.filter((e) => e.online).length;

  return (
    <div className="rounded-xl border border-border/60 bg-card p-4 space-y-4">
      <div className="flex items-center justify-between border-b pb-2">
        <h3 className="text-xs font-black uppercase tracking-[0.1em] flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
          <Users className="h-4 w-4 text-primary" />
          Active Coworkers ({activeCount})
        </h3>
        <Circle className="h-2 w-2 text-emerald-500 fill-emerald-500 animate-pulse" />
      </div>

      <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
        {onlineEmployees.slice(0, 10).map((emp: any) => (
          <div key={emp.id} className="flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative shrink-0">
                {emp.profile_image ? (
                  <img
                    src={emp.profile_image}
                    alt={`${emp.first_name} avatar`}
                    className="h-6 w-6 rounded-full object-cover border"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                    {emp.first_name[0]}{emp.last_name?.[0] || ''}
                  </div>
                )}
                <PresenceIndicator
                  userId={emp.id}
                  isOnline={emp.online}
                  className="absolute -bottom-0.5 -right-0.5 border border-card h-2 w-2"
                />
              </div>
              <div className="min-w-0">
                <p className="font-bold truncate text-slate-700 dark:text-slate-300">
                  {emp.first_name} {emp.last_name}
                </p>
                <p className="text-[9px] text-muted-foreground truncate leading-none mt-0.5">
                  {emp.position || 'Support Agent'}
                </p>
              </div>
            </div>
            
            <span className={cn(
              "text-[9px] font-semibold px-1.5 py-0.2 rounded",
              emp.online ? "text-emerald-600 bg-emerald-500/10" : "text-muted-foreground bg-muted"
            )}>
              {emp.online ? 'Active' : 'Offline'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
export default OnlineUsersPanel;
