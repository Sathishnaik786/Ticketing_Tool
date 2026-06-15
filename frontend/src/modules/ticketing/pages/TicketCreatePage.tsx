import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { departmentsApi } from '@/services/api';
import { queryKeys } from '@/utils/queryKeys';
import { createTicketSchema, type CreateTicketFormValues } from '../schemas/ticket.schema';
import { useCreateTicket, useTicketCategories } from '../hooks/useTicketing';

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
] as const;

export default function TicketCreatePage() {
  const navigate = useNavigate();
  const createTicket = useCreateTicket();

  const { data: departments = [], isLoading: departmentsLoading } = useQuery({
    queryKey: queryKeys.departments,
    queryFn: departmentsApi.getAll,
  });

  const { data: categories = [], isLoading: categoriesLoading } = useTicketCategories();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateTicketFormValues>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'MEDIUM',
      category_id: '',
      department_id: '',
    },
  });

  const priority = watch('priority');
  const categoryId = watch('category_id');
  const departmentId = watch('department_id');

  const onSubmit = async (values: CreateTicketFormValues) => {
    const response = await createTicket.mutateAsync({
      title: values.title,
      description: values.description,
      department_id: values.department_id,
      category_id: values.category_id,
      priority: values.priority,
    });

    navigate(`/app/tickets/${response.data.id}`);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-3xl">
      <PageHeader
        title="Create Ticket"
        description="Submit a new service request for your team to resolve."
        className="enterprise-panel mb-0"
      />

      <div aria-live="polite" className="sr-only">
        {createTicket.isError ? 'Ticket creation failed. Please review the form and try again.' : ''}
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="enterprise-panel space-y-6"
        aria-label="Create ticket form"
        noValidate
      >
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? 'title-error' : undefined}
            {...register('title')}
          />
          {errors.title && (
            <p id="title-error" className="text-sm text-destructive" role="alert">
              {errors.title.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            rows={6}
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? 'description-error' : undefined}
            {...register('description')}
          />
          {errors.description && (
            <p id="description-error" className="text-sm text-destructive" role="alert">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(value) => setValue('priority', value as CreateTicketFormValues['priority'])}>
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                {PRIORITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={categoryId}
              onValueChange={(value) => setValue('category_id', value, { shouldValidate: true })}
              disabled={categoriesLoading}
            >
              <SelectTrigger
                id="category"
                aria-invalid={!!errors.category_id}
                aria-describedby={errors.category_id ? 'category-error' : undefined}
              >
                <SelectValue placeholder={categoriesLoading ? 'Loading categories...' : 'Select category'} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category_id && (
              <p id="category-error" className="text-sm text-destructive" role="alert">
                {errors.category_id.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Select
            value={departmentId}
            onValueChange={(value) => setValue('department_id', value, { shouldValidate: true })}
            disabled={departmentsLoading}
          >
            <SelectTrigger
              id="department"
              aria-invalid={!!errors.department_id}
              aria-describedby={errors.department_id ? 'department-error' : undefined}
            >
              <SelectValue placeholder={departmentsLoading ? 'Loading...' : 'Select department'} />
            </SelectTrigger>
            <SelectContent>
              {departments.map((department) => (
                <SelectItem key={department.id} value={department.id}>
                  {department.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.department_id && (
            <p id="department-error" className="text-sm text-destructive" role="alert">
              {errors.department_id.message}
            </p>
          )}
        </div>

        <div className="flex gap-3">
          <Button type="submit" disabled={isSubmitting || createTicket.isPending} aria-busy={isSubmitting || createTicket.isPending}>
            {isSubmitting || createTicket.isPending ? 'Creating...' : 'Create Ticket'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/app/tickets')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
