import { format } from 'date-fns';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Employee } from '@/types';
import type { TicketAssignment } from '../types/ticketing.types';

function formatEmployee(employee?: { firstName?: string; lastName?: string; first_name?: string; last_name?: string; email?: string } | null): string {
  const first = employee?.firstName ?? employee?.first_name ?? '';
  const last = employee?.lastName ?? employee?.last_name ?? '';
  const name = `${first} ${last}`.trim();
  return name || employee?.email || 'Unknown';
}

interface TicketAssignmentsProps {
  assignments: TicketAssignment[];
  employees: Employee[];
  canAssign?: boolean;
  onAssign: (assigneeId: string) => void;
  onReassign: (assigneeId: string) => void;
  isSubmitting?: boolean;
}

export function TicketAssignments({
  assignments,
  employees,
  canAssign = false,
  onAssign,
  onReassign,
  isSubmitting,
}: TicketAssignmentsProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const hasActiveAssignment = assignments.some((item) => item.is_active !== false);

  const handleSubmit = () => {
    if (!selectedEmployeeId) return;
    if (hasActiveAssignment) {
      onReassign(selectedEmployeeId);
    } else {
      onAssign(selectedEmployeeId);
    }
    setSelectedEmployeeId('');
  };

  return (
    <div className="space-y-6">
      {canAssign && (
        <div className="rounded-xl border border-border/60 p-4 space-y-3">
          <Label htmlFor="assignee-select">
            {hasActiveAssignment ? 'Reassign ticket' : 'Assign ticket'}
          </Label>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
              <SelectTrigger id="assignee-select" className="flex-1">
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!selectedEmployeeId || isSubmitting}
              aria-busy={isSubmitting}
            >
              {hasActiveAssignment ? 'Reassign' : 'Assign'}
            </Button>
          </div>
        </div>
      )}

      <div>
        <h4 className="text-sm font-semibold mb-3">Assignment History</h4>
        {assignments.length === 0 ? (
          <p className="text-sm text-muted-foreground" role="status">
            No assignments recorded yet.
          </p>
        ) : (
          <ul className="space-y-3" aria-label="Assignment history">
            {assignments.map((assignment) => (
              <li
                key={assignment.id}
                className="rounded-xl border border-border/60 p-3 flex flex-wrap justify-between gap-2"
              >
                <div>
                  <p className="text-sm font-medium">
                    {formatEmployee(assignment.assignee as Employee | null)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {assignment.assignment_type ?? 'MANUAL'}
                    {assignment.is_active !== false ? ' • Active' : ''}
                  </p>
                </div>
                <time className="text-xs text-muted-foreground" dateTime={assignment.created_at}>
                  {format(new Date(assignment.created_at), 'PPp')}
                </time>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
