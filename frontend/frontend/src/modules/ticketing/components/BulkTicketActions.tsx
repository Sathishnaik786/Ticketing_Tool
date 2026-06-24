import * as React from 'react';
import { Shield, UserPlus, AlertCircle, Building2, CheckCircle2, XCircle, FileSpreadsheet, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ActionToolbar } from '@/components/design-system';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Department, Employee } from '@/types';
import type { TicketPriority, TicketStatus } from '../types/ticketing.types';

interface BulkTicketActionsProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBulkAssign: (employeeId: string) => void;
  onBulkPriority: (priority: TicketPriority) => void;
  onBulkDepartment: (deptId: string) => void;
  onBulkStatus: (status: TicketStatus) => void;
  onBulkDelete: () => void;
  onBulkExport: (format: 'csv' | 'excel' | 'pdf') => void;
  departments: Department[];
  employees: Employee[];
  userRole?: string;
}

export function BulkTicketActions({
  selectedCount,
  onClearSelection,
  onBulkAssign,
  onBulkPriority,
  onBulkDepartment,
  onBulkStatus,
  onBulkDelete,
  onBulkExport,
  departments,
  employees,
  userRole,
}: BulkTicketActionsProps) {
  const isAgentOrAbove = userRole === 'ADMIN' || userRole === 'MANAGER' || userRole === 'AGENT';
  const isAdmin = userRole === 'ADMIN';

  if (selectedCount === 0 || !isAgentOrAbove) return null;

  return (
    <ActionToolbar
      align="between"
      className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex flex-wrap gap-4 items-center animate-in slide-in-from-bottom-2"
    >
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-primary animate-pulse" />
        <span className="text-sm font-semibold text-primary">
          {selectedCount} ticket{selectedCount > 1 ? 's' : ''} selected
        </span>
        <Button variant="ghost" size="sm" onClick={onClearSelection} className="h-8 text-xs">
          Deselect all
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Assign Option */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <UserPlus className="mr-1.5 h-3.5 w-3.5" />
              Assign
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="max-h-60 overflow-y-auto">
            {employees.map((emp) => (
              <DropdownMenuItem key={emp.id} onClick={() => onBulkAssign(emp.id)}>
                {emp.firstName} {emp.lastName}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Priority Option */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <AlertCircle className="mr-1.5 h-3.5 w-3.5" />
              Priority
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as TicketPriority[]).map((p) => (
              <DropdownMenuItem key={p} onClick={() => onBulkPriority(p)}>
                {p}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Department Option */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <Building2 className="mr-1.5 h-3.5 w-3.5" />
              Department
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {departments.map((dept) => (
              <DropdownMenuItem key={dept.id} onClick={() => onBulkDepartment(dept.id)}>
                {dept.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Status Actions */}
        <Button variant="outline" size="sm" onClick={() => onBulkStatus('RESOLVED')} className="h-8 text-xs text-green-600 hover:text-green-700">
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
          Resolve
        </Button>
        
        <Button variant="outline" size="sm" onClick={() => onBulkStatus('CLOSED')} className="h-8 text-xs text-muted-foreground hover:text-foreground">
          <XCircle className="mr-1.5 h-3.5 w-3.5" />
          Close
        </Button>

        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs">
              <FileSpreadsheet className="mr-1.5 h-3.5 w-3.5" />
              Export
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onBulkExport('csv')}>Export CSV</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBulkExport('excel')}>Export Excel</DropdownMenuItem>
            <DropdownMenuItem onClick={() => onBulkExport('pdf')}>Export PDF (Print)</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Delete (Admin only) */}
        {isAdmin && (
          <Button
            variant="destructive"
            size="sm"
            onClick={onBulkDelete}
            className="h-8 text-xs font-semibold"
          >
            <Trash2 className="mr-1.5 h-3.5 w-3.5" />
            Delete
          </Button>
        )}
      </div>
    </ActionToolbar>
  );
}
