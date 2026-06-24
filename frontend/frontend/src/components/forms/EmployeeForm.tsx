import { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import { employeesApi, departmentsApi } from '@/services/api';
import { Employee, Department, EmployeeFormData, Role } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { EmployeeStatus } from '@/types';
import {
  UserCircle,
  Briefcase,
  Calendar,
  Database,
  ShieldCheck,
  Mail,
  Phone,
  DollarSign
} from 'lucide-react';

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (data: EmployeeFormData) => void;
  onCancel: () => void;
}

export function EmployeeForm({ employee, onSubmit, onCancel }: EmployeeFormProps) {
  const { user, hasRole } = useAuth();
  const { toast } = useToast();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [managers, setManagers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<EmployeeFormData>({
    defaultValues: {
      firstName: employee?.firstName || '',
      lastName: employee?.lastName || '',
      email: employee?.email || '',
      phone: employee?.phone || '',
      departmentId: employee?.departmentId || '',
      position: employee?.position || '',
      salary: employee?.salary || 0,
      dateOfBirth: employee?.dateOfBirth || '',
      dateOfJoining: employee?.dateOfJoining || '',
      address: employee?.address || '',
      city: employee?.city || '',
      state: employee?.state || '',
      country: employee?.country || '',
      zipCode: employee?.zipCode || '',
      emergencyContact: employee?.emergencyContact || '',
      emergencyPhone: employee?.emergencyPhone || '',
      status: employee?.status || 'ACTIVE',
      payroll_status: employee?.payroll_status || 'INCOMPLETE',
      salary_structure_type: employee?.salary_structure_type || 'AUTO_DERIVED',
      monthly_gross_salary: employee?.monthly_gross_salary || 0,
      annual_ctc: employee?.annual_ctc || 0,
      basic_salary_component: employee?.basic_salary_component || 0,
      hra_component: employee?.hra_component || 0,
      special_allowance_component: employee?.special_allowance_component || 0,
      pf_employee_component: employee?.pf_employee_component || 0,
      pf_employer_component: employee?.pf_employer_component || 0,
      gratuity_component: employee?.gratuity_component || 0,
      variable_pay_component: employee?.variable_pay_component || 0,
      pf_eligible: employee?.pf_eligible ?? true,
      pt_applicable: employee?.pt_applicable ?? true,
      tax_regime: employee?.tax_regime || 'NEW',
      pan_number: employee?.pan_number || '',
      uan_number: employee?.uan_number || '',
      bank_name: employee?.bank_name || '',
      bank_account_number: employee?.bank_account_number || '',
      bank_ifsc_code: employee?.bank_ifsc_code || '',
      managerId: employee?.managerId || '',
    },
  });

  // Reset form when employee data is loaded or changed
  useEffect(() => {
    if (employee) {
      form.reset({
        firstName: employee.firstName || '',
        lastName: employee.lastName || '',
        email: employee.email || '',
        phone: employee.phone || '',
        departmentId: employee.departmentId || '',
        position: employee.position || '',
        salary: employee.salary || 0,
        dateOfBirth: employee.dateOfBirth || '',
        dateOfJoining: employee.dateOfJoining || '',
        address: employee.address || '',
        city: employee.city || '',
        state: employee.state || '',
        country: employee.country || '',
        zipCode: employee.zipCode || '',
        emergencyContact: employee.emergencyContact || '',
        emergencyPhone: employee.emergencyPhone || '',
        status: employee?.status || 'ACTIVE',
        payroll_status: employee?.payroll_status || 'INCOMPLETE',
        salary_structure_type: employee?.salary_structure_type || 'AUTO_DERIVED',
        monthly_gross_salary: employee?.monthly_gross_salary || 0,
        annual_ctc: employee?.annual_ctc || 0,
        basic_salary_component: employee?.basic_salary_component || 0,
        hra_component: employee?.hra_component || 0,
        special_allowance_component: employee?.special_allowance_component || 0,
        pf_employee_component: employee?.pf_employee_component || 0,
        pf_employer_component: employee?.pf_employer_component || 0,
        gratuity_component: employee?.gratuity_component || 0,
        variable_pay_component: employee?.variable_pay_component || 0,
        pf_eligible: employee?.pf_eligible ?? true,
        pt_applicable: employee?.pt_applicable ?? true,
        tax_regime: employee?.tax_regime || 'NEW',
        pan_number: employee?.pan_number || '',
        uan_number: employee?.uan_number || '',
        bank_name: employee?.bank_name || '',
        bank_account_number: employee?.bank_account_number || '',
        bank_ifsc_code: employee?.bank_ifsc_code || '',
        managerId: employee?.managerId || '',
      });
    }
  }, [employee, form]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Only fetch all employees if the user has a privileged role (ADMIN, HR, MANAGER)
        // Regular employees don't have permission to see everyone and can't change their manager anyway
        const empsPromise = hasRole(['ADMIN', 'HR', 'MANAGER'])
          ? employeesApi.getAll({})
          : Promise.resolve({ data: [] });

        const [depts, emps] = await Promise.all([
          departmentsApi.getAll(),
          empsPromise,
        ]);
        setDepartments(depts);
        setManagers(emps.data || []);
      } catch (error) {
        // Log error but don't show toast for 403s on employee list as it's often irrelevant for regular users
        if ((error as any).status !== 403) {
          toast({
            title: 'Error',
            description: 'Failed to load configuration data',
            variant: 'destructive',
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleSubmit: SubmitHandler<EmployeeFormData> = async (data) => {
    console.log('EmployeeForm: Submission started with data:', data);
    try {
      setLoading(true);
      await onSubmit(data);
      console.log('EmployeeForm: onSubmit callback completed');
      toast({
        title: 'Success',
        description: employee ? 'Employee updated successfully' : 'Employee created successfully',
      });
    } catch (error: any) {
      console.error('EmployeeForm: Submission failed:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save employee',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const onInvalid = (errors: any) => {
    console.error('EmployeeForm: Validation failed:', errors);
    toast({
      title: 'Validation Error',
      description: 'Please check the form for missing or invalid data.',
      variant: 'destructive',
    });
  };

  // Determine which fields should be disabled based on user role
  const isFieldDisabled = (fieldName: keyof EmployeeFormData): boolean => {
    // Everything is now editable as per user request
    return false;
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit, onInvalid)} className="space-y-10">
        {/* Section: Core Identity */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border/40 pb-3">
            <div className="p-2 rounded-lg bg-primary/5 text-primary">
              <UserCircle size={18} />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-[0.15em] text-foreground/80">Core Identity</h4>
              <p className="text-[10px] text-muted-foreground font-medium">Primary identification and communication protocols.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">First Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isFieldDisabled('firstName')} placeholder="e.g. Alexander" className="h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">Last Name</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isFieldDisabled('lastName')} placeholder="e.g. Pierce" className="h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">Email Address</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" disabled={isFieldDisabled('email')} placeholder="alx.pierce@yvi.enterprise" className="h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">Phone Network</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isFieldDisabled('phone')} placeholder="+1 (555) 000-0000" className="h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Section: Organization Context */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border/40 pb-3">
            <div className="p-2 rounded-lg bg-indigo-500/5 text-indigo-500">
              <Briefcase size={18} />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-[0.15em] text-foreground/80">Organization Context</h4>
              <p className="text-[10px] text-muted-foreground font-medium">Placement within the enterprise hierarchy and structure.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">Division / Department</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isFieldDisabled('departmentId')}>
                    <FormControl>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id} className="rounded-lg">
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">Functional Title</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isFieldDisabled('position')} placeholder="e.g. Senior Architecture Lead" className="h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="managerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">Reporting Authority</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isFieldDisabled('managerId')}>
                    <FormControl>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="Select manager" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      {managers.map((manager) => (
                        <SelectItem key={manager.id} value={manager.id} className="rounded-lg">
                          {manager.firstName} {manager.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">Deployment Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isFieldDisabled('status')}>
                    <FormControl>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="ACTIVE" className="rounded-lg">Active</SelectItem>
                      <SelectItem value="INACTIVE" className="rounded-lg">Inactive</SelectItem>
                      <SelectItem value="ON_LEAVE" className="rounded-lg">On Leave</SelectItem>
                      <SelectItem value="TERMINATED" className="rounded-lg">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Section: Personal Archive */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border/40 pb-3">
            <div className="p-2 rounded-lg bg-emerald-500/5 text-emerald-500">
              <Calendar size={18} />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-[0.15em] text-foreground/80">Personal Archive</h4>
              <p className="text-[10px] text-muted-foreground font-medium">Critical dates and compensation parameters.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">Date of Birth</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" disabled={isFieldDisabled('dateOfBirth')} className="h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateOfJoining"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">Date of Onboarding</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" disabled={isFieldDisabled('dateOfJoining')} className="h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="salary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">Annual CTC</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">$</span>
                      <Input
                        {...field}
                        type="number"
                        className="pl-8 h-11"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={isFieldDisabled('salary')}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Section: Geographic Intelligence */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border/40 pb-3">
            <div className="p-2 rounded-lg bg-amber-500/5 text-amber-500">
              <Database size={18} />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-[0.15em] text-foreground/80">Geographic Intelligence</h4>
              <p className="text-[10px] text-muted-foreground font-medium">Physical residency and contact triangulation data.</p>
            </div>
          </div>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">Residency Address</FormLabel>
                  <FormControl>
                    <Textarea {...field} disabled={isFieldDisabled('address')} placeholder="Full physical address..." className="min-h-[100px] rounded-xl" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">City</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isFieldDisabled('city')} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">State / Province</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isFieldDisabled('state')} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">Nation</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isFieldDisabled('country')} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">Postal Code</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isFieldDisabled('zipCode')} className="h-11" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>

        {/* Section: Security Protocols */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 border-b border-border/40 pb-3">
            <div className="p-2 rounded-lg bg-rose-500/5 text-rose-500">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h4 className="text-sm font-black uppercase tracking-[0.15em] text-foreground/80">Security Protocols</h4>
              <p className="text-[10px] text-muted-foreground font-medium">Emergency contact redundancy and safety data.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="emergencyContact"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">Emergency Guardian</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isFieldDisabled('emergencyContact')} placeholder="Full name of contact" className="h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="emergencyPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">Emergency Network</FormLabel>
                  <FormControl>
                    <Input {...field} disabled={isFieldDisabled('emergencyPhone')} placeholder="+1 (555) 000-0000" className="h-11" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Section: Enterprise Payroll Master */}
        <div className="space-y-8 bg-slate-50/50 dark:bg-white/[0.02] p-8 rounded-[2.5rem] border border-white/10 shadow-inner relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <DollarSign size={120} />
          </div>
          
          <div className="flex items-center gap-4 border-b border-border/40 pb-4 relative z-10">
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-600 shadow-xl shadow-emerald-500/10">
              <DollarSign size={20} />
            </div>
            <div>
              <h4 className="text-lg font-black uppercase tracking-tight text-foreground/90">Institutional Payroll Master</h4>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-70">Deterministic Compensation & Statutory Governance</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
            <FormField
              control={form.control}
              name="salary_structure_type"
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2">
                  <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">Structure Protocol</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || 'AUTO_DERIVED'}>
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-xl border-2 border-primary/10 focus:border-primary transition-all">
                        <SelectValue placeholder="Select protocol" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="AUTO_DERIVED" className="rounded-lg font-bold">AUTO_DERIVED (Institutional Default)</SelectItem>
                      <SelectItem value="CUSTOM_ENTERPRISE" className="rounded-lg font-bold">CUSTOM_ENTERPRISE (Manual Override)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription className="text-[10px] font-medium">Auto-derived uses the 50/20/30 standard. Custom allows exact component entry.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payroll_status"
              render={({ field }) => (
                <FormItem className="col-span-1 md:col-span-2">
                  <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">Readiness Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || 'INCOMPLETE'}>
                    <FormControl>
                      <SelectTrigger className="h-12 rounded-xl border-2 border-primary/10 focus:border-primary transition-all">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="READY" className="rounded-lg font-bold text-emerald-600">READY (Approved for Payroll)</SelectItem>
                      <SelectItem value="INCOMPLETE" className="rounded-lg font-bold text-amber-600">INCOMPLETE (Draft)</SelectItem>
                      <SelectItem value="REVIEW_REQUIRED" className="rounded-lg font-bold text-rose-600">REVIEW_REQUIRED (Action Needed)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 col-span-4 bg-background/50 p-6 rounded-[2rem] border border-white/5">
                <FormField
                    control={form.control}
                    name="annual_ctc"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">Annual CTC</FormLabel>
                        <FormControl>
                            <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-600 text-sm font-black">₹</span>
                            <Input
                                {...field}
                                type="number"
                                className="pl-10 h-14 text-lg font-black rounded-2xl border-2 border-emerald-500/10 focus:border-emerald-500 transition-all"
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    field.onChange(val);
                                    const monthly = val / 12;
                                    form.setValue('monthly_gross_salary', monthly);
                                    if (form.getValues('salary_structure_type') === 'AUTO_DERIVED') {
                                        form.setValue('basic_salary_component', monthly * 0.5);
                                        form.setValue('hra_component', monthly * 0.2);
                                        form.setValue('special_allowance_component', monthly * 0.3);
                                    }
                                }}
                            />
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="monthly_gross_salary"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">Monthly Gross Salary</FormLabel>
                        <FormControl>
                            <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-black">₹</span>
                            <Input
                                {...field}
                                type="number"
                                className="pl-10 h-14 text-lg font-black rounded-2xl border-2 border-slate-200/50 dark:border-slate-800 focus:border-primary transition-all"
                                onChange={(e) => {
                                    const val = Number(e.target.value);
                                    field.onChange(val);
                                    form.setValue('annual_ctc', val * 12);
                                    if (form.getValues('salary_structure_type') === 'AUTO_DERIVED') {
                                        form.setValue('basic_salary_component', val * 0.5);
                                        form.setValue('hra_component', val * 0.2);
                                        form.setValue('special_allowance_component', val * 0.3);
                                    }
                                }}
                            />
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="col-span-4 grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                    control={form.control}
                    name="basic_salary_component"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">Basic Component (50%)</FormLabel>
                        <FormControl>
                            <Input
                                {...field}
                                type="number"
                                disabled={form.getValues('salary_structure_type') === 'AUTO_DERIVED'}
                                className="h-12 font-bold rounded-xl bg-muted/20"
                                onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="hra_component"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">HRA Component (20%)</FormLabel>
                        <FormControl>
                            <Input
                                {...field}
                                type="number"
                                disabled={form.getValues('salary_structure_type') === 'AUTO_DERIVED'}
                                className="h-12 font-bold rounded-xl bg-muted/20"
                                onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="special_allowance_component"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">Special Allowance (30%)</FormLabel>
                        <FormControl>
                            <Input
                                {...field}
                                type="number"
                                disabled={form.getValues('salary_structure_type') === 'AUTO_DERIVED'}
                                className="h-12 font-bold rounded-xl bg-muted/20"
                                onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="pf_employee_component"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">PF Employee Contribution</FormLabel>
                        <FormControl>
                            <Input {...field} type="number" className="h-11 rounded-xl" onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="pf_employer_component"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">PF Employer Contribution</FormLabel>
                        <FormControl>
                            <Input {...field} type="number" className="h-11 rounded-xl" onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="variable_pay_component"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">Variable Pay (Annual)</FormLabel>
                        <FormControl>
                            <Input {...field} type="number" className="h-11 rounded-xl" onChange={(e) => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="col-span-4 bg-slate-900/5 dark:bg-white/5 p-6 rounded-[2rem] border border-white/5 grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                    control={form.control}
                    name="pan_number"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">PAN Identity</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder="ABCDE1234F" className="h-11 rounded-xl uppercase" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="uan_number"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">UAN Identity</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder="100000000000" className="h-11 rounded-xl" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="bank_account_number"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">Bank Account</FormLabel>
                        <FormControl>
                            <Input {...field} placeholder="Disbursement Account Number" className="h-11 rounded-xl" />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <FormField
              control={form.control}
              name="tax_regime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">Tax Regime</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value || 'NEW'}>
                    <FormControl>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="Select regime" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="OLD" className="rounded-lg">Old Regime</SelectItem>
                      <SelectItem value="NEW" className="rounded-lg">New Regime (Default)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pf_eligible"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">PF Eligibility</FormLabel>
                  <Select onValueChange={(val) => field.onChange(val === 'true')} defaultValue={field.value ? 'true' : 'false'}>
                    <FormControl>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="PF Status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="true" className="rounded-lg">Eligible</SelectItem>
                      <SelectItem value="false" className="rounded-lg">Not Eligible</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pt_applicable"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[11px] font-black uppercase tracking-wider text-muted-foreground/80">PT Applicability</FormLabel>
                  <Select onValueChange={(val) => field.onChange(val === 'true')} defaultValue={field.value ? 'true' : 'false'}>
                    <FormControl>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="PT Status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="true" className="rounded-lg">Applicable</SelectItem>
                      <SelectItem value="false" className="rounded-lg">Exempt</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : employee ? 'Update Employee' : 'Create Employee'}
          </Button>
        </div>
      </form>
    </Form>
  );
}