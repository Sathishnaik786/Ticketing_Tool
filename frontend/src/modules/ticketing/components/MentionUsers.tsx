import * as React from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/utils/queryKeys';
import { employeesApi } from '@/services/api';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

export interface MentionUsersProps {
  searchQuery: string;
  onSelect: (userName: string) => void;
  onClose: () => void;
  targetRef?: React.RefObject<HTMLElement>;
}

export function MentionUsers({ searchQuery, onSelect, onClose, targetRef }: MentionUsersProps) {
  const { data: employeesResponse } = useQuery({
    queryKey: queryKeys.employees({ limit: 100 }),
    queryFn: () => employeesApi.getAll({ limit: 100 }),
  });
  const employees = employeesResponse?.data || [];

  const filteredEmployees = React.useMemo(() => {
    if (!searchQuery) return employees.slice(0, 5);
    const q = searchQuery.toLowerCase();
    return employees.filter(
      (emp: any) =>
        emp.first_name.toLowerCase().includes(q) ||
        emp.last_name?.toLowerCase().includes(q) ||
        emp.email.toLowerCase().includes(q)
    ).slice(0, 5);
  }, [searchQuery, employees]);

  React.useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (targetRef?.current && !targetRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose, targetRef]);

  if (filteredEmployees.length === 0) return null;

  return (
    <div
      className="absolute z-[100] w-64 bg-card rounded-xl border border-border shadow-2xl overflow-hidden mt-1 max-h-48 flex flex-col"
      role="listbox"
      aria-label="User mention options"
    >
      <div className="px-3 py-1.5 bg-muted/30 border-b border-border/20 text-[9px] font-black uppercase tracking-wider text-muted-foreground">
        Mention coworker...
      </div>
      <ScrollArea className="flex-1">
        <div className="p-1 space-y-0.5">
          {filteredEmployees.map((emp: any) => {
            const fullName = `${emp.first_name}_${emp.last_name || ''}`.replace(/_+$/, '');
            return (
              <button
                key={emp.id}
                onClick={() => onSelect(fullName)}
                role="option"
                className="w-full flex items-center gap-2 p-2 text-xs rounded-lg hover:bg-primary hover:text-white text-left transition-colors font-medium group"
              >
                {emp.profile_image ? (
                  <img
                    src={emp.profile_image}
                    alt={`${emp.first_name} avatar`}
                    className="h-5 w-5 rounded-full object-cover border"
                  />
                ) : (
                  <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[9px] group-hover:bg-white/20 group-hover:text-white">
                    {emp.first_name[0]}{emp.last_name?.[0] || ''}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-bold truncate text-foreground group-hover:text-white">
                    {emp.first_name} {emp.last_name}
                  </div>
                  <div className="text-[9px] text-muted-foreground group-hover:text-white/80 truncate">
                    @{fullName.toLowerCase()}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
export default MentionUsers;
