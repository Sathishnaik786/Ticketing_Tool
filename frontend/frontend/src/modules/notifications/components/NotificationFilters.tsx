import * as React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

export interface NotificationFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  priority: string;
  onPriorityChange: (val: string) => void;
  module: string;
  onModuleChange: (val: string) => void;
  onReset: () => void;
}

export function NotificationFilters({
  search,
  onSearchChange,
  priority,
  onPriorityChange,
  module,
  onModuleChange,
  onReset,
}: NotificationFiltersProps) {
  const hasActiveFilters = search || priority || module;

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center bg-muted/20 p-4 rounded-xl border border-border/40">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
        <Input
          placeholder="Search notifications..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 pr-8 h-9 text-xs rounded-xl"
          aria-label="Search notifications"
        />
        {search && (
          <button
            onClick={() => onSearchChange('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted text-muted-foreground"
            aria-label="Clear search"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Priority Filter */}
      <div className="w-full sm:w-36">
        <Select value={priority || 'all'} onValueChange={(val) => onPriorityChange(val === 'all' ? '' : val)}>
          <SelectTrigger className="h-9 text-xs rounded-xl" aria-label="Filter by priority">
            <SelectValue placeholder="All Priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="CRITICAL">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Module Filter */}
      <div className="w-full sm:w-40">
        <Select value={module || 'all'} onValueChange={(val) => onModuleChange(val === 'all' ? '' : val)}>
          <SelectTrigger className="h-9 text-xs rounded-xl" aria-label="Filter by module">
            <SelectValue placeholder="All Modules" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modules</SelectItem>
            <SelectItem value="ticketing">Ticketing</SelectItem>
            <SelectItem value="approval">Approvals</SelectItem>
            <SelectItem value="system">System</SelectItem>
            <SelectItem value="announcement">Announcements</SelectItem>
            <SelectItem value="payroll">Payroll</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-9 text-xs px-3 rounded-xl text-muted-foreground hover:text-foreground"
        >
          <X className="h-3.5 w-3.5 mr-1" />
          Clear Filters
        </Button>
      )}
    </div>
  );
}
export default NotificationFilters;
