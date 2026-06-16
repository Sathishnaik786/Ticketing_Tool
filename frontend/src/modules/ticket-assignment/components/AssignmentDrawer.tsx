import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { isTicketAssignmentsEnabled } from '@/config/features';
import { useAuth } from '@/contexts/AuthContext';
import { employeesApi } from '@/services/api';
import { queryKeys } from '@/utils/queryKeys';
import { useAssignTicketMutation, useReassignTicketMutation } from '../hooks/useTicketAssignment';
import type { Ticket } from '@/modules/ticketing/types/ticketing.types';

interface AssignmentDrawerProps {
  ticket: Ticket;
}

function canManageAssignment(role?: string): boolean {
  return role === 'ADMIN' || role === 'HR' || role === 'MANAGER';
}

export function AssignmentDrawer({ ticket }: AssignmentDrawerProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [assigneeId, setAssigneeId] = useState('');
  const [reason, setReason] = useState('');

  const assignMutation = useAssignTicketMutation();
  const reassignMutation = useReassignTicketMutation(ticket.id);

  const { data: employeesResponse } = useQuery({
    queryKey: queryKeys.employees({ limit: 200 }),
    queryFn: () => employeesApi.getAll({ limit: 200 }),
    enabled: open && isTicketAssignmentsEnabled,
  });

  if (!isTicketAssignmentsEnabled || !canManageAssignment(user?.role)) {
    return null;
  }

  const employees = employeesResponse?.data ?? [];
  const isAssigned = Boolean(ticket.assignee_id);
  const isSubmitting = assignMutation.isPending || reassignMutation.isPending;

  const handleSubmit = async () => {
    if (!assigneeId) return;
    if (isAssigned) {
      await reassignMutation.mutateAsync({
        assigned_to: assigneeId,
        assignment_type: 'REASSIGNED',
        reason: reason.trim() || undefined,
      });
    } else {
      await assignMutation.mutateAsync({
        ticket_id: ticket.id,
        assigned_to: assigneeId,
        assignment_type: 'MANUAL',
        reason: reason.trim() || undefined,
      });
    }
    setOpen(false);
    setAssigneeId('');
    setReason('');
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          {isAssigned ? 'Reassign' : 'Assign'}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isAssigned ? 'Reassign Ticket' : 'Assign Ticket'}</SheetTitle>
          <SheetDescription>
            {ticket.ticket_number} — {ticket.title}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="assignment-agent">Assign to</Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger id="assignment-agent">
                <SelectValue placeholder="Select agent" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((employee) => (
                  <SelectItem key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="assignment-reason">Reason (optional)</Label>
            <Textarea
              id="assignment-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={1000}
              rows={3}
              placeholder="Reason for assignment change..."
            />
          </div>
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={!assigneeId || isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : isAssigned ? 'Reassign Ticket' : 'Assign Ticket'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
