import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { documentsApi, employeesApi } from '@/services/api';
import { Document, DocumentType, Employee } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';

interface DocumentFormProps {
  document?: Document;
  employeeId?: string;
  onSubmit: (data: { file: File; type: DocumentType; employeeId: string }) => void;
  onCancel: () => void;
}

export function DocumentForm({ document, employeeId: initialEmployeeId, onSubmit, onCancel }: DocumentFormProps) {
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<{
    type: DocumentType;
    employeeId: string;
  }>({
    defaultValues: {
      type: 'OTHER',
      employeeId: initialEmployeeId || user?.employeeId || '',
    },
  });

  // Fetch employees for HR/Admin to select
  const fetchEmployees = async () => {
    if (hasRole(['HR', 'ADMIN']) && employees.length === 0) {
      try {
        setLoading(true);
        const response = await employeesApi.getAll({});
        setEmployees(response.data || []);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load employees',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit: SubmitHandler<{ type: DocumentType; employeeId: string }> = async (data) => {
    if (!file) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'destructive',
      });
      return;
    }

    // Validate employee selection for HR/Admin
    if (hasRole(['HR', 'ADMIN']) && !data.employeeId) {
      toast({
        title: 'Error',
        description: 'Please select an employee',
        variant: 'destructive',
      });
      return;
    }

    // For employees, they can only upload for themselves
    const targetEmployeeId = hasRole(['EMPLOYEE']) ? user?.employeeId : data.employeeId;

    if (!targetEmployeeId) {
      toast({
        title: 'Error',
        description: 'Employee ID is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      await onSubmit({ file, type: data.type, employeeId: targetEmployeeId });
      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
      });
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload document',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Determine if employee selection should be shown
  const showEmployeeSelection = hasRole(['HR', 'ADMIN']) && !initialEmployeeId;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Document Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="ID_PROOF">ID Proof</SelectItem>
                  <SelectItem value="ADDRESS_PROOF">Address Proof</SelectItem>
                  <SelectItem value="EDUCATION">Education</SelectItem>
                  <SelectItem value="EXPERIENCE">Experience</SelectItem>
                  <SelectItem value="CONTRACT">Contract</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {showEmployeeSelection && (
          <FormField
            control={form.control}
            name="employeeId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Employee</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} onOpenChange={(open) => open && fetchEmployees()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormItem>
          <FormLabel>File</FormLabel>
          <FormControl>
            <Input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" />
          </FormControl>
          <FormMessage />
        </FormItem>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !file}>
            {loading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>
      </form>
    </Form>
  );
}