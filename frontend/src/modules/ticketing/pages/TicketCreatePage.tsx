import * as React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { departmentsApi, employeesApi } from '@/services/api';
import { queryKeys } from '@/utils/queryKeys';
import { createTicketSchema, type CreateTicketFormValues } from '../schemas/ticket.schema';
import { useCreateTicket, useTicketCategories } from '../hooks/useTicketing';
import { KnowledgeSuggestionsPanel } from '@/modules/knowledge-management/components/KnowledgeSuggestionsPanel';
import { AlertTriangle, BookOpen, UserPlus, X, HelpCircle } from 'lucide-react';
import { toast } from 'sonner';

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
] as const;

const TEMPLATE_OPTIONS = [
  {
    id: 'access',
    name: 'Access Authorization Request',
    title: 'Access Request - [System Name]',
    priority: 'HIGH' as const,
    description: 'Please grant access to the following system:\nSystem name: \nJustification: \nManager Approver: ',
    departmentKeyword: 'IT',
  },
  {
    id: 'hardware',
    name: 'Report Hardware Fault',
    title: 'Hardware Issue - [Device Name]',
    priority: 'MEDIUM' as const,
    description: 'Describe the hardware problem:\nAsset tag/serial:\nDetailed symptoms:\nLocation of device:',
    departmentKeyword: 'IT',
  },
  {
    id: 'onboard',
    name: 'Employee Onboarding Request',
    title: 'Onboarding - [Employee Name]',
    priority: 'HIGH' as const,
    description: 'Onboarding details:\nEmployee Name:\nDepartment:\nStart Date:\nHardware required (Laptop/Monitor):',
    departmentKeyword: 'HR',
  },
];

export default function TicketCreatePage() {
  const navigate = useNavigate();
  const createTicket = useCreateTicket();

  const [selectedTemplate, setSelectedTemplate] = React.useState('');
  const [ccUsers, setCcUsers] = React.useState<string[]>([]);
  const [tags, setTags] = React.useState<string[]>([]);
  const [tagInput, setTagInput] = React.useState('');

  const { data: departments = [], isLoading: departmentsLoading } = useQuery({
    queryKey: queryKeys.departments,
    queryFn: departmentsApi.getAll,
  });

  const { data: categories = [], isLoading: categoriesLoading } = useTicketCategories();

  const { data: employeesResponse } = useQuery({
    queryKey: queryKeys.employees({ limit: 100 }),
    queryFn: () => employeesApi.getAll({ limit: 100 }),
  });
  const employees = employeesResponse?.data ?? [];

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
  const title = watch('title');
  const description = watch('description');
  const suggestionQuery = `${title} ${description}`.trim();

  // Similar ticket detection logic (Mocked for high quality UX demo)
  const similarTicket = React.useMemo(() => {
    const queryLower = title.toLowerCase();
    if (queryLower.includes('access') || queryLower.includes('intellij')) {
      return { id: 't-mock-1', title: 'TKT-1040: IntelliJ license authorization', status: 'OPEN' };
    }
    if (queryLower.includes('hardware') || queryLower.includes('monitor') || queryLower.includes('screen')) {
      return { id: 't-mock-2', title: 'TKT-1025: Dual screen setup request', status: 'RESOLVED' };
    }
    return null;
  }, [title]);

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    if (!templateId) return;

    const template = TEMPLATE_OPTIONS.find((t) => t.id === templateId);
    if (template) {
      setValue('title', template.title);
      setValue('description', template.description);
      setValue('priority', template.priority);
      
      // Auto-match department if possible
      const matchedDept = departments.find((d) => d.name.toUpperCase().includes(template.departmentKeyword.toUpperCase()));
      if (matchedDept) {
        setValue('department_id', matchedDept.id, { shouldValidate: true });
      }
      toast.success(`Template "${template.name}" loaded`);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!tagInput.trim()) return;
      const tag = tagInput.toLowerCase().trim().replace(/ /g, '-');
      if (!tags.includes(tag)) {
        setTags([...tags, tag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const toggleCcUser = (empId: string) => {
    if (ccUsers.includes(empId)) {
      setCcUsers(ccUsers.filter((id) => id !== empId));
    } else {
      setCcUsers([...ccUsers, empId]);
    }
  };

  const onSubmit = async (values: CreateTicketFormValues) => {
    const response = await createTicket.mutateAsync({
      title: values.title,
      description: values.description,
      department_id: values.department_id,
      category_id: values.category_id,
      priority: values.priority,
    });

    // Save mock CC/Tags to localStorage for detail persistence
    localStorage.setItem(`ticket_meta_${response.data.id}`, JSON.stringify({ tags, ccUsers }));
    toast.success('Ticket created successfully');
    navigate(`/app/tickets/${response.data.id}`);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-5xl">
      <PageHeader
        title="Create Service Ticket"
        description="Submit organizational service requests. The ETMS routing engine will automatically assign priority SLAs."
        className="enterprise-panel mb-0"
      />

      {/* JSM Templates Quick Access */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-2">
        <Label htmlFor="template-select" className="text-xs font-semibold text-muted-foreground uppercase">Load Ticket Template</Label>
        <Select value={selectedTemplate} onValueChange={handleTemplateChange}>
          <SelectTrigger id="template-select" className="h-10">
            <SelectValue placeholder="Choose a standard JSM template..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Template (Blank Ticket)</SelectItem>
            {TEMPLATE_OPTIONS.map((opt) => (
              <SelectItem key={opt.id} value={opt.id}>
                {opt.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Duplicate ticket prevention banner */}
      {similarTicket && (
        <Alert variant="default" className="border-amber-200 bg-amber-500/5 text-amber-900 dark:text-amber-100 animate-in fade-in-50">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="font-semibold text-xs text-amber-800 dark:text-amber-400">Potential Duplicate Detected</AlertTitle>
          <AlertDescription className="text-xs mt-1">
            We found a similar ticket currently logged:{" "}
            <Link to={`/app/tickets/${similarTicket.id}`} className="font-semibold underline hover:text-amber-700">
              {similarTicket.title} ({similarTicket.status})
            </Link>
            . Please check this ticket to ensure you are not creating a redundant service desk request.
          </AlertDescription>
        </Alert>
      )}

      {/* Knowledge Suggestions Panel */}
      <KnowledgeSuggestionsPanel searchQuery={suggestionQuery} />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-xl border border-border bg-card p-6 space-y-6"
        aria-label="Create ticket form"
        noValidate
      >
        <div className="space-y-2">
          <Label htmlFor="title" className="text-sm font-semibold">Subject / Title</Label>
          <Input
            id="title"
            placeholder="Summarize the request or problem..."
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? 'title-error' : undefined}
            {...register('title')}
            className="h-10"
          />
          {errors.title && (
            <p id="title-error" className="text-xs text-destructive" role="alert">
              {errors.title.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-semibold">Detailed Description</Label>
          <Textarea
            id="description"
            placeholder="Provide context, details, error codes, and steps to reproduce..."
            rows={5}
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? 'description-error' : undefined}
            {...register('description')}
            className="resize-none"
          />
          {errors.description && (
            <p id="description-error" className="text-xs text-destructive" role="alert">
              {errors.description.message}
            </p>
          )}
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="priority" className="text-sm font-semibold">SLA Priority</Label>
            <Select value={priority} onValueChange={(value) => setValue('priority', value as any)}>
              <SelectTrigger id="priority" className="h-10">
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
            <Label htmlFor="category" className="text-sm font-semibold">Service Category</Label>
            <Select
              value={categoryId}
              onValueChange={(value) => setValue('category_id', value, { shouldValidate: true })}
              disabled={categoriesLoading}
            >
              <SelectTrigger
                id="category"
                className="h-10"
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
              <p id="category-error" className="text-xs text-destructive" role="alert">
                {errors.category_id.message}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="department" className="text-sm font-semibold">Assigned Department</Label>
          <Select
            value={departmentId}
            onValueChange={(value) => setValue('department_id', value, { shouldValidate: true })}
            disabled={departmentsLoading}
          >
            <SelectTrigger
              id="department"
              className="h-10"
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
            <p id="department-error" className="text-xs text-destructive" role="alert">
              {errors.department_id.message}
            </p>
          )}
        </div>

        {/* CC Users Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold flex items-center gap-1.5">
            <UserPlus className="h-4 w-4 text-muted-foreground" />
            CC Users / Watchers
          </Label>
          <div className="border border-border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2 bg-muted/10">
            {employees.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No users found.</p>
            ) : (
              employees.map((emp) => (
                <label key={emp.id} className="flex items-center gap-2 text-xs cursor-pointer select-none">
                  <Checkbox checked={ccUsers.includes(emp.id)} onCheckedChange={() => toggleCcUser(emp.id)} />
                  <span>{emp.firstName} {emp.lastName} ({emp.email})</span>
                </label>
              ))
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags" className="text-sm font-semibold">Labels & Tags</Label>
          <Input
            id="tags"
            placeholder="Type tag and press Enter..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            className="h-10"
          />
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-[10px] gap-1 py-0.5 px-2">
                  {tag}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={isSubmitting || createTicket.isPending} aria-busy={isSubmitting || createTicket.isPending}>
            {isSubmitting || createTicket.isPending ? 'Submitting request...' : 'Submit Request'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/app/tickets')}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
