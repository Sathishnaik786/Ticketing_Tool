import * as React from 'react';
import { Search, Filter, Calendar, X, Tag, Eye } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import type { Department, Employee } from '@/types';
import type { TicketStatus, TicketPriority } from '../types/ticketing.types';

const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: 'OPEN', label: 'Open' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'PENDING_USER', label: 'Pending User' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'REOPENED', label: 'Reopened' },
  { value: 'ESCALATED', label: 'Escalated' },
];

const PRIORITY_OPTIONS: { value: TicketPriority; label: string }[] = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

const SLA_STATUS_OPTIONS = [
  { value: 'breached', label: 'SLA Breached' },
  { value: 'warning', label: 'SLA Near Breach' },
  { value: 'compliant', label: 'SLA Compliant' },
];

export interface MultiSelectFilters {
  statuses: TicketStatus[];
  priorities: TicketPriority[];
  departments: string[];
  assignees: string[];
  categories: string[];
  slaStatus: string[];
  tags: string[];
  watchers: string[];
  dateRange: { start: string; end: string } | null;
}

interface TicketFilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  filters: MultiSelectFilters;
  onFiltersChange: (newFilters: MultiSelectFilters) => void;
  departmentsList: Department[];
  employeesList: Employee[];
  categoriesList: any[];
  sortBy: string;
  onSortByChange: (val: string) => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (val: 'asc' | 'desc') => void;
}

export function TicketFilterBar({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  departmentsList,
  employeesList,
  categoriesList,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
}: TicketFilterBarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleFilter = <T extends keyof MultiSelectFilters>(
    key: T,
    value: MultiSelectFilters[T] extends (infer U)[] ? U : never
  ) => {
    const list = filters[key];
    if (Array.isArray(list)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nextList = (list as any[]).includes(value)
        ? (list as any[]).filter((item) => item !== value)
        : [...(list as any[]), value];
      onFiltersChange({ ...filters, [key]: nextList });
    }
  };

  const clearAllFilters = () => {
    onFiltersChange({
      statuses: [],
      priorities: [],
      departments: [],
      assignees: [],
      categories: [],
      slaStatus: [],
      tags: [],
      watchers: [],
      dateRange: null,
    });
  };

  const activeFiltersCount =
    filters.statuses.length +
    filters.priorities.length +
    filters.departments.length +
    filters.assignees.length +
    filters.categories.length +
    filters.slaStatus.length +
    filters.tags.length +
    filters.watchers.length +
    (filters.dateRange ? 1 : 0);

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Label htmlFor="advanced-search" className="sr-only">
            Search tickets
          </Label>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="advanced-search"
            placeholder="Search tickets by number, subject, or description..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 h-10 border-input"
          />
        </div>
        <div className="flex gap-2">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="h-10 relative">
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge variant="default" className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground">
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[320px] md:w-[480px] p-4 space-y-4 max-h-[80vh] overflow-y-auto" align="end">
              <div className="flex justify-between items-center pb-2 border-b border-border">
                <h3 className="font-semibold text-sm">Advanced Filters</h3>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs h-8">
                    Clear all
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status Filter */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase">Statuses</h4>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {STATUS_OPTIONS.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                        <Checkbox
                          checked={filters.statuses.includes(opt.value)}
                          onCheckedChange={() => toggleFilter('statuses', opt.value)}
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Priority Filter */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase">Priorities</h4>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {PRIORITY_OPTIONS.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                        <Checkbox
                          checked={filters.priorities.includes(opt.value)}
                          onCheckedChange={() => toggleFilter('priorities', opt.value)}
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Department Filter */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase">Departments</h4>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {departmentsList.map((dept) => (
                      <label key={dept.id} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                        <Checkbox
                          checked={filters.departments.includes(dept.id)}
                          onCheckedChange={() => toggleFilter('departments', dept.id)}
                        />
                        <span className="truncate">{dept.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Assignee Filter */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase">Assignees</h4>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {employeesList.map((emp) => (
                      <label key={emp.id} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                        <Checkbox
                          checked={filters.assignees.includes(emp.id)}
                          onCheckedChange={() => toggleFilter('assignees', emp.id)}
                        />
                        <span className="truncate">{emp.firstName} {emp.lastName}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase">Categories</h4>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {categoriesList.map((cat) => (
                      <label key={cat.id} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                        <Checkbox
                          checked={filters.categories.includes(cat.id)}
                          onCheckedChange={() => toggleFilter('categories', cat.id)}
                        />
                        <span className="truncate">{cat.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* SLA Status Filter */}
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase">SLA Status</h4>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                    {SLA_STATUS_OPTIONS.map((opt) => (
                      <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                        <Checkbox
                          checked={filters.slaStatus.includes(opt.value)}
                          onCheckedChange={() => toggleFilter('slaStatus', opt.value)}
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Date Range Fields */}
              <div className="space-y-2 pt-2 border-t border-border">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase">Created Date Range</h4>
                <div className="flex gap-2 items-center">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={filters.dateRange?.start ?? ''}
                    onChange={(e) => {
                      const start = e.target.value;
                      const end = filters.dateRange?.end ?? '';
                      onFiltersChange({
                        ...filters,
                        dateRange: start || end ? { start, end } : null,
                      });
                    }}
                    className="h-9 text-xs"
                    aria-label="Start date"
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <Input
                    type="date"
                    value={filters.dateRange?.end ?? ''}
                    onChange={(e) => {
                      const start = filters.dateRange?.start ?? '';
                      const end = e.target.value;
                      onFiltersChange({
                        ...filters,
                        dateRange: start || end ? { start, end } : null,
                      });
                    }}
                    className="h-9 text-xs"
                    aria-label="End date"
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Sort Menu */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split('-');
              onSortByChange(field);
              onSortOrderChange(order as 'asc' | 'desc');
            }}
            className="rounded-md border border-input bg-background px-3 h-10 text-sm focus:outline-none"
            aria-label="Sort tickets by"
          >
            <option value="created_at-desc">Created (Newest First)</option>
            <option value="created_at-asc">Created (Oldest First)</option>
            <option value="priority-desc">Priority (High to Low)</option>
            <option value="priority-asc">Priority (Low to High)</option>
            <option value="status-asc">Status (A-Z)</option>
            <option value="status-desc">Status (Z-A)</option>
          </select>
        </div>
      </div>

      {/* Render Chips for Active Filters */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 items-center">
          <span className="text-xs text-muted-foreground font-medium">Active:</span>
          {filters.statuses.map((s) => (
            <Badge key={s} variant="secondary" className="text-xs gap-1 py-0.5 px-2">
              Status: {s}
              <X className="h-3 w-3 cursor-pointer" onClick={() => toggleFilter('statuses', s)} />
            </Badge>
          ))}
          {filters.priorities.map((p) => (
            <Badge key={p} variant="secondary" className="text-xs gap-1 py-0.5 px-2">
              Priority: {p}
              <X className="h-3 w-3 cursor-pointer" onClick={() => toggleFilter('priorities', p)} />
            </Badge>
          ))}
          {filters.departments.map((d) => {
            const name = departmentsList.find((dept) => dept.id === d)?.name ?? d;
            return (
              <Badge key={d} variant="secondary" className="text-xs gap-1 py-0.5 px-2">
                Dept: {name}
                <X className="h-3 w-3 cursor-pointer" onClick={() => toggleFilter('departments', d)} />
              </Badge>
            );
          })}
          {filters.assignees.map((a) => {
            const emp = employeesList.find((e) => e.id === a);
            const name = emp ? `${emp.firstName} ${emp.lastName}` : a;
            return (
              <Badge key={a} variant="secondary" className="text-xs gap-1 py-0.5 px-2">
                Assigned: {name}
                <X className="h-3 w-3 cursor-pointer" onClick={() => toggleFilter('assignees', a)} />
              </Badge>
            );
          })}
          {filters.categories.map((c) => {
            const name = categoriesList.find((cat) => cat.id === c)?.name ?? c;
            return (
              <Badge key={c} variant="secondary" className="text-xs gap-1 py-0.5 px-2">
                Category: {name}
                <X className="h-3 w-3 cursor-pointer" onClick={() => toggleFilter('categories', c)} />
              </Badge>
            );
          })}
          {filters.slaStatus.map((sla) => (
            <Badge key={sla} variant="secondary" className="text-xs gap-1 py-0.5 px-2">
              SLA: {sla}
              <X className="h-3 w-3 cursor-pointer" onClick={() => toggleFilter('slaStatus', sla)} />
            </Badge>
          ))}
          {filters.dateRange && (
            <Badge variant="secondary" className="text-xs gap-1 py-0.5 px-2">
              Date: {filters.dateRange.start || '—'} to {filters.dateRange.end || '—'}
              <X
                className="h-3 w-3 cursor-pointer"
                onClick={() => onFiltersChange({ ...filters, dateRange: null })}
              />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs h-6 px-2 text-muted-foreground ml-auto">
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
