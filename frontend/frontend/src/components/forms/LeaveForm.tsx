import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { leavesApi, employeesApi } from '@/services/api';
import { LeaveRequest, LeaveType, Employee, LeaveFormData, PaginationMeta } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';

interface LeaveFormProps {
  leave?: LeaveRequest;
  employeeId?: string;
  onSubmit: (data: LeaveFormData) => void;
  onCancel: () => void;
}

export function LeaveForm({ leave, employeeId, onSubmit, onCancel }: LeaveFormProps) {
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<LeaveFormData>({
    defaultValues: {
      leaveTypeId: leave?.leaveTypeId || '',
      startDate: leave?.startDate || '',
      endDate: leave?.endDate || '',
      reason: leave?.reason || '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [types, empResponse] = await Promise.all([
          leavesApi.getTypes(),
          employeesApi.getAll({}),
        ]);
        setLeaveTypes(types);
        setEmployees(empResponse.data);
        setMeta(empResponse.meta);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load leave types and employees',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleSubmit: SubmitHandler<LeaveFormData> = async (data) => {
    try {
      setLoading(true);
      await onSubmit(data);
      toast({
        title: 'Success',
        description: leave ? 'Leave request updated successfully' : 'Leave request submitted successfully',
      });
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to submit leave request',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Determine if we're in approval mode (Manager/HR/Admin)
  const isApprovalMode = hasRole(['MANAGER', 'HR', 'ADMIN']) && leave && leave.status === 'PENDING';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {!isApprovalMode ? (
          // Employee applying for leave
          <>
            <FormField
              control={form.control}
              name="leaveTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leave Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!!leave}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select leave type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leaveTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" disabled={!!leave} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" disabled={!!leave} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter reason for leave" disabled={!!leave} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        ) : (
          // Manager/HR/Admin approving/rejecting leave
          <>
            <div className="space-y-2">
              <h3 className="font-medium">Leave Request Details</h3>
              <p className="text-sm text-muted-foreground">
                {leave?.employee?.firstName} {leave?.employee?.lastName} is requesting {leave?.leaveType?.name} from{' '}
                {leave?.startDate} to {leave?.endDate} ({leave?.totalDays} days)
              </p>
              <p className="text-sm">{leave?.reason}</p>
            </div>

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Comments</FormLabel>
                  <FormControl>
                    <Textarea {...field} placeholder="Enter comments for approval/rejection" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          
          {isApprovalMode ? (
            <>
              <Button 
                type="submit" 
                variant="destructive" 
                disabled={loading}
                onClick={() => {
                  // This would be handled by the parent component
                  // For rejection, we would pass a special flag
                }}
              >
                {loading ? 'Rejecting...' : 'Reject'}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Approving...' : 'Approve'}
              </Button>
            </>
          ) : (
            <Button type="submit" disabled={loading || !!leave}>
              {loading ? 'Submitting...' : 'Submit Leave Request'}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}