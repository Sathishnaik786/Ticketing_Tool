import { useEffect, useState, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PageHeader } from '@/components/layout/PageHeader';
import { StatusBadge } from '@/components/common/StatusBadge';
import { DataTableSkeleton } from '@/components/common/Skeletons';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { EnterpriseEmptyState } from '@/components/common/EnterpriseEmptyState';
import { employeesApi } from '@/services/api';
import { Employee, EmployeeFormData, PaginationMeta } from '@/types';
import {
  Plus,
  Search,
  Mail,
  Phone,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Filter,
  Users,
  Briefcase,
  Download,
  MoreVertical,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ClipboardList
} from 'lucide-react';
import { EmployeeForm } from '@/components/forms/EmployeeForm';
import { CrudModal } from '@/components/modals/CrudModal';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { canChat } from '@/utils/canChat';
import ChatDrawer from '@/components/common/ChatDrawer';
import { staggerContainer, slideUpVariants } from '@/animations/motionVariants';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Employees = () => {
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [roleFilter, setRoleFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const [chatTargetUser, setChatTargetUser] = useState<Employee | null>(null);
  const chatDrawerRef = useRef<any>(null);

  useEffect(() => {
    fetchAllEmployees();
  }, []);

  const fetchAllEmployees = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await employeesApi.getAll({
        page: 1,
        limit: 1000,
        sortBy,
        sortOrder
      });

      setEmployees(response.data || []);
      setMeta(response.meta);
    } catch (error: any) {
      console.error('Error fetching employees:', error);
      const errorMessage = error.message || 'Failed to fetch employees';
      setError(errorMessage);
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter]);

  const handleCreateEmployee = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleDeleteEmployee = async (employeeId: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeesApi.delete(employeeId);
        toast({
          title: 'Success',
          description: 'Employee deleted successfully',
        });
        fetchAllEmployees();
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to delete employee',
          variant: 'destructive',
        });
      }
    }
  };

  const handleFormSubmit = async (data: EmployeeFormData) => {
    try {
      if (editingEmployee) {
        await employeesApi.update(editingEmployee.id, data);
        toast({
          title: 'Success',
          description: 'Employee updated successfully',
        });
      } else {
        await employeesApi.create(data);
        toast({
          title: 'Success',
          description: 'Employee created successfully',
        });
      }
      setIsModalOpen(false);
      setEditingEmployee(null);
      fetchAllEmployees();
    } catch (error: any) {
      throw error;
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const openChatWithUser = (employee: Employee) => {
    if (user && canChat(user.role, employee.role)) {
      setChatDrawerOpen(true);
      setTimeout(() => {
        if (chatDrawerRef.current && chatDrawerRef.current.openChatWithUser) {
          chatDrawerRef.current.openChatWithUser({
            id: employee.userId || employee.id,
            name: `${employee.firstName} ${employee.lastName}`,
            role: employee.role
          });
        }
      }, 100);
    }
  };

  const filteredEmployees = useMemo(() => {
    let result = [...employees];

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(emp =>
        (emp.firstName && emp.firstName.toLowerCase().includes(s)) ||
        (emp.lastName && emp.lastName.toLowerCase().includes(s)) ||
        (emp.email && emp.email.toLowerCase().includes(s)) ||
        (emp.department?.name && emp.department.name.toLowerCase().includes(s)) ||
        (emp.position && emp.position.toLowerCase().includes(s))
      );
    }

    if (roleFilter && roleFilter !== 'all') {
      result = result.filter(emp => emp.role === roleFilter);
    }

    if (departmentFilter && departmentFilter !== 'all') {
      result = result.filter(emp =>
        emp.department?.name?.toLowerCase().includes(departmentFilter.toLowerCase())
      );
    }

    result.sort((a, b) => {
      let aValue, bValue;
      switch (sortBy) {
        case 'first_name': aValue = a.firstName; bValue = b.firstName; break;
        case 'last_name': aValue = a.lastName; bValue = b.lastName; break;
        case 'department': aValue = a.department?.name || ''; bValue = b.department?.name || ''; break;
        case 'position': aValue = a.position || ''; bValue = b.position || ''; break;
        case 'status': aValue = a.status; bValue = b.status; break;
        default: aValue = (a as any)[sortBy] || ''; bValue = (b as any)[sortBy] || '';
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return sortOrder === 'asc' ? ((aValue as any) > (bValue as any) ? 1 : -1) : ((aValue as any) < (bValue as any) ? 1 : -1);
    });

    return result;
  }, [employees, search, roleFilter, departmentFilter, sortBy, sortOrder]);

  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * 8;
    return filteredEmployees.slice(startIndex, startIndex + 8);
  }, [filteredEmployees, currentPage]);

  const totalPages = Math.ceil(filteredEmployees.length / 8);

  const stats = useMemo(() => ({
    total: employees.length,
    active: employees.filter(e => e.status === 'ACTIVE').length,
    onLeave: employees.filter(e => e.status === 'ON_LEAVE').length,
  }), [employees]);

  if (authLoading) return <div className="p-8 flex justify-center"><DataTableSkeleton /></div>;
  if (!user) return <div className="p-8 text-center text-rose-500 font-bold">Unauthorized Access</div>;

  if (user.role !== 'ADMIN' && user.role !== 'HR' && user.role !== 'MANAGER') {
    return (
      <div className="p-12 text-center h-[60vh] flex flex-col justify-center items-center">
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mb-6 text-rose-500 shadow-xl shadow-rose-500/5">
          <Trash2 size={40} />
        </div>
        <h2 className="text-3xl font-bold tracking-tight mb-3">Access Denied</h2>
        <p className="text-muted-foreground text-lg mb-8 max-w-md">Your current account role does not have the permissions required to access the team directory.</p>
        <Link to="/app/dashboard">
          <Button variant="outlinePremium" size="lg">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="p-6 lg:p-8 space-y-8"
    >
      <motion.div variants={slideUpVariants}>
        <PageHeader
          title="Team Directory"
          description="Manage and monitor your organization's talent pool."
          className="enterprise-panel mb-0"
        >
          <div className="flex items-center gap-3">
            <Button variant="outlinePremium" size="sm" className="hidden sm:flex">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            <Button variant="premium" size="sm" onClick={handleCreateEmployee}>
              <Plus className="mr-2 h-4 w-4" />
              Add Member
            </Button>
          </div>
        </PageHeader>
      </motion.div>

      {/* Quick Stats Grid */}
      <motion.div
        variants={slideUpVariants}
        className="grid grid-cols-1 sm:grid-cols-3 gap-6"
      >
        <Card className="enterprise-card group overflow-hidden relative">
          <CardContent className="p-6 flex items-center gap-4 relative z-10">
            <div className="p-4 rounded-2xl bg-primary/10 text-primary shadow-soft group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <Users size={24} />
            </div>
            <div>
              <p className="enterprise-subheading">Total Personnel</p>
              <h3 className="text-3xl font-black mt-1">{loading ? '...' : stats.total}</h3>
            </div>
          </CardContent>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
        </Card>
        <Card className="enterprise-card group overflow-hidden relative">
          <CardContent className="p-6 flex items-center gap-4 relative z-10">
            <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-600 shadow-soft group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <Users size={24} />
            </div>
            <div>
              <p className="enterprise-subheading">Active Now</p>
              <h3 className="text-3xl font-black mt-1">{loading ? '...' : stats.active}</h3>
            </div>
          </CardContent>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
        </Card>
        <Card className="enterprise-card group overflow-hidden relative">
          <CardContent className="p-6 flex items-center gap-4 relative z-10">
            <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-600 shadow-soft group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <Users size={24} />
            </div>
            <div>
              <p className="enterprise-subheading">On Leave</p>
              <h3 className="text-3xl font-black mt-1">{loading ? '...' : stats.onLeave}</h3>
            </div>
          </CardContent>
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-colors" />
        </Card>
      </motion.div>

      {/* Advanced Filter Bar */}
      <motion.div variants={slideUpVariants}>
        <div className="enterprise-toolbar py-5 px-6">
          <div className="flex flex-col lg:flex-row gap-4 w-full">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search by name, email, or position..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-11 h-12 bg-background/50 border-white/10 focus:border-primary/50 transition-all rounded-xl"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px] h-12 bg-background/50 rounded-xl border-white/10 font-bold text-xs uppercase tracking-widest">
                  <Filter className="mr-2 h-4 w-4 opacity-50" />
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MANAGER">Manager</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="EMPLOYEE">Employee</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center gap-1 p-1 bg-muted/30 rounded-xl border border-white/10">
                <Button
                  variant={sortOrder === 'asc' ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn("h-10 px-4 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all", sortOrder === 'asc' && "bg-white shadow-soft dark:bg-slate-800")}
                  onClick={() => setSortOrder('asc')}
                >
                  ASC
                </Button>
                <Button
                  variant={sortOrder === 'desc' ? 'secondary' : 'ghost'}
                  size="sm"
                  className={cn("h-10 px-4 rounded-lg text-[10px] font-black tracking-widest uppercase transition-all", sortOrder === 'desc' && "bg-white shadow-soft dark:bg-slate-800")}
                  onClick={() => setSortOrder('desc')}
                >
                  DESC
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Enterprise Data Grid */}
      <motion.div variants={slideUpVariants} className="relative">
        {loading ? (
          <div className="rounded-[2rem] border border-white/5 overflow-hidden">
            <DataTableSkeleton />
          </div>
        ) : filteredEmployees.length > 0 ? (
          <div className="space-y-6">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[300px]" onClick={() => handleSort('first_name')}>
                    <div className="flex items-center gap-2 cursor-pointer group">
                      Employee
                      <span className={cn("transition-all opacity-0 group-hover:opacity-100", sortBy === 'first_name' && "opacity-100")}>
                        {sortBy === 'first_name' && (sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                      </span>
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort('position')}>
                    <div className="flex items-center gap-2 cursor-pointer group">
                      Role & Title
                      <span className={cn("transition-all opacity-0 group-hover:opacity-100", sortBy === 'position' && "opacity-100")}>
                        {sortBy === 'position' && (sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                      </span>
                    </div>
                  </TableHead>
                  <TableHead onClick={() => handleSort('department')}>
                    <div className="flex items-center gap-2 cursor-pointer group">
                      Division
                      <span className={cn("transition-all opacity-0 group-hover:opacity-100", sortBy === 'department' && "opacity-100")}>
                        {sortBy === 'department' && (sortOrder === 'asc' ? <ArrowUp size={12} /> : <ArrowDown size={12} />)}
                      </span>
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {paginatedEmployees.map((employee, idx) => (
                    <motion.tr
                      key={employee.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.04 }}
                      component={TableRow}
                      className="group"
                    >
                      <TableCell>
                        <div className="flex items-center gap-4">
                          <div className="relative h-12 w-12 rounded-2xl overflow-hidden bg-muted/80 border border-white/10 group-hover:scale-105 transition-transform shadow-sm">
                            {employee.profile_image ? (
                              <img src={employee.profile_image} alt="" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-transparent text-primary text-base font-black">
                                {employee.firstName[0]}{employee.lastName[0]}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                              {employee.firstName} {employee.lastName}
                            </p>
                            <p className="text-[11px] text-slate-500 font-bold flex items-center gap-1.5 mt-0.5">
                              <Mail size={10} />
                              {employee.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2">
                            <Briefcase size={12} className="text-primary/60" />
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{employee.position || 'Strategic Partner'}</span>
                          </div>
                          <Badge variant="outline" className="text-[9px] h-4 font-black uppercase tracking-[0.15em] bg-primary/5 border-primary/10 text-primary/70">
                            {employee.role}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 text-[10px] font-black tracking-widest text-slate-500 uppercase border border-white/5 group-hover:border-primary/20 transition-all">
                          {employee.department?.name || 'Central Div'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={employee.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary transition-all"
                                  onClick={() => openChatWithUser(employee)}
                                >
                                  <MessageCircle size={16} />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="font-bold">Initiate Chat</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-muted transition-all">
                                <MoreVertical size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-2xl p-2 border-white/10 glass-panel-dark">
                              <DropdownMenuItem className="rounded-xl flex items-center gap-3 p-3 font-bold" onClick={() => handleEditEmployee(employee)}>
                                <Edit size={16} className="text-primary" /> Edit Credentials
                              </DropdownMenuItem>
                              <DropdownMenuItem className="rounded-xl flex items-center gap-3 p-3 font-bold">
                                <UserCircle size={16} className="text-indigo-500" /> Member Insights
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="my-2 bg-white/5" />
                              <DropdownMenuItem
                                className="rounded-xl text-rose-500 flex items-center gap-3 p-3 font-bold focus:bg-rose-500/10 focus:text-rose-600"
                                onClick={() => handleDeleteEmployee(employee.id)}
                              >
                                <Trash2 size={16} /> Decommission
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </TableBody>
            </Table>

            {/* Pagination Workspace Footer */}
            <div className="enterprise-toolbar py-4 px-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 w-full">
                <div className="flex items-center gap-4 text-slate-500">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-primary/60" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Coverage: <span className="text-primary">{filteredEmployees.length}</span> / {employees.length}
                    </p>
                  </div>
                  <div className="h-4 w-[1px] bg-white/10" />
                  <div className="flex items-center gap-2">
                    <ClipboardList size={14} className="text-primary/60" />
                    <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Workspace: <span className="text-primary">{currentPage}</span> / {totalPages || 1}
                    </p>
                  </div>
                </div>
                
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            isActive={currentPage === pageNum}
                            onClick={() => handlePageChange(pageNum)}
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    {totalPages > 5 && <PaginationItem><PaginationEllipsis /></PaginationItem>}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className={cn((currentPage === totalPages || totalPages === 0) && "pointer-events-none opacity-50")}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </div>
          </div>
        ) : (
          <Card className="enterprise-card border-dashed border-2 border-white/5 bg-white/5">
            <EnterpriseEmptyState
              title="No Intelligence Found"
              description="Your search parameters did not return any personnel records. Try adjusting your filters or search keywords."
              icon={ShieldAlert}
              action={{
                label: "Reset Directories",
                onClick: () => { setSearch(''); setRoleFilter('all'); setDepartmentFilter('all'); },
                icon: Filter
              }}
            />
          </Card>
        )}
      </motion.div>

      {/* Modals */}
      <CrudModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={editingEmployee ? 'Update Member Profile' : 'Onboard New Member'}
        size="xl"
      >
        <EmployeeForm
          employee={editingEmployee || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </CrudModal>

      <ChatDrawer
        ref={chatDrawerRef}
        isOpen={chatDrawerOpen}
        onClose={() => setChatDrawerOpen(false)}
      />
    </motion.div>
  );
};

export default Employees;
