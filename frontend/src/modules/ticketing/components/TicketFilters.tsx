import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Department } from '@/types';
import type { Employee } from '@/types';
import type { TicketFilters, TicketPriority, TicketStatus } from '../types/ticketing.types';

const STATUS_OPTIONS: { value: TicketStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All Statuses' },
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'PENDING_USER', label: 'Pending' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'REOPENED', label: 'Reopened' },
];

const PRIORITY_OPTIONS: { value: TicketPriority | 'all'; label: string }[] = [
  { value: 'all', label: 'All Priorities' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

interface TicketFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  priority: string;
  onPriorityChange: (value: string) => void;
  departmentId: string;
  onDepartmentChange: (value: string) => void;
  assigneeId: string;
  onAssigneeChange: (value: string) => void;
  departments: Department[];
  employees: Employee[];
}

export function TicketFiltersBar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priority,
  onPriorityChange,
  departmentId,
  onDepartmentChange,
  assigneeId,
  onAssigneeChange,
  departments,
  employees,
}: TicketFiltersProps) {
  return (
    <div
      className="enterprise-toolbar py-5 px-6"
      role="search"
      aria-label="Filter tickets"
    >
      <div className="flex flex-col lg:flex-row gap-4 w-full">
        <div className="relative flex-1 group">
          <Label htmlFor="ticket-search" className="sr-only">
            Search tickets
          </Label>
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            id="ticket-search"
            placeholder="Search tickets by number or title..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-11 h-12 bg-background/50 border-white/10 rounded-xl"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger
              className="w-[170px] h-12 bg-background/50 rounded-xl border-white/10"
              aria-label="Filter by status"
            >
              <Filter className="mr-2 h-4 w-4 opacity-50" aria-hidden="true" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={priority} onValueChange={onPriorityChange}>
            <SelectTrigger
              className="w-[170px] h-12 bg-background/50 rounded-xl border-white/10"
              aria-label="Filter by priority"
            >
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              {PRIORITY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={departmentId} onValueChange={onDepartmentChange}>
            <SelectTrigger
              className="w-[190px] h-12 bg-background/50 rounded-xl border-white/10"
              aria-label="Filter by department"
            >
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={assigneeId} onValueChange={onAssigneeChange}>
            <SelectTrigger
              className="w-[190px] h-12 bg-background/50 rounded-xl border-white/10"
              aria-label="Filter by assignee"
            >
              <SelectValue placeholder="Assignee" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Assignees</SelectItem>
              {employees.map((employee) => (
                <SelectItem key={employee.id} value={employee.id}>
                  {employee.firstName} {employee.lastName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}

export type { TicketFilters };
