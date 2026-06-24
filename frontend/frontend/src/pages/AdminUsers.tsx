import React, { useState, useEffect, useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
import { EnterpriseEmptyState } from '@/components/common/EnterpriseEmptyState';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { departmentsApi, authApi, employeesApi } from '@/services/api';
import { Department, Employee, Role } from '@/types';
import {
  UserPlus,
  ShieldCheck,
  Users,
  MoreVertical,
  Trash2,
  UserCog,
  Mail,
  Activity,
  Search,
  AtSign,
  Loader2,
  ShieldAlert,
  History
} from 'lucide-react';
import { staggerContainer, slideUpVariants } from '@/animations/motionVariants';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CreateUserFormData {
  email: string;
  role: string;
  departmentId?: string;
  managerId?: string;
}

const AdminUsers: React.FC = () => {
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState<CreateUserFormData>({
    email: '',
    role: 'EMPLOYEE',
    departmentId: '',
    managerId: '',
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(true);
  const [showRoleUpdateModal, setShowRoleUpdateModal] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDepartments = async () => {
    try {
      const deptList = await departmentsApi.getAll();
      setDepartments(deptList || []);
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      setUsersLoading(true);
      const response = await employeesApi.getAll({ limit: 100 });
      setEmployees(response.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({ title: 'Error', description: 'Failed to synchronize user directory', variant: 'destructive' });
      setEmployees([]);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDepartments();
      fetchEmployees();
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateRole = async () => {
    if (!selectedEmployeeId || !newRole) return;
    try {
      await employeesApi.update(selectedEmployeeId, { role: newRole as Role });
      toast({ title: 'Success', description: 'Permissions recalibrated successfully' });
      setShowRoleUpdateModal(false);
      fetchEmployees();
    } catch (error) {
      toast({ title: 'Error', description: 'Recalibration failed', variant: 'destructive' });
    }
  };

  const handleToggleStatus = async (employeeId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
      await employeesApi.update(employeeId, { status: newStatus });
      toast({ title: 'Success', description: `User status set to ${newStatus}` });
      fetchEmployees();
    } catch (error) {
      toast({ title: 'Error', description: 'Status update failed', variant: 'destructive' });
    }
  };

  const handleRemove = async (employeeId: string) => {
    if (!window.confirm('Commence user decommissioning? This action is irreversible.')) return;
    try {
      await employeesApi.delete(employeeId);
      toast({ title: 'Success', description: 'Identity record decommissioned' });
      fetchEmployees();
    } catch (error) {
      toast({ title: 'Error', description: 'Decommissioning failed', variant: 'destructive' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authApi.createUser({
        email: formData.email,
        role: formData.role,
        departmentId: formData.departmentId || undefined,
      });
      if (response.success) {
        toast({ title: 'Success', description: `Identity created for ${formData.email}` });
        setFormData({ email: '', role: 'EMPLOYEE', departmentId: '' });
        fetchEmployees();
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Identity creation failed', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return employees;
    const s = searchTerm.toLowerCase();
    return employees.filter(e =>
      `${e.firstName} ${e.lastName}`.toLowerCase().includes(s) ||
      e.email?.toLowerCase().includes(s) ||
      e.position?.toLowerCase().includes(s)
    );
  }, [employees, searchTerm]);

  if (authLoading) return <div className="p-12 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/app/unauthorized" replace />;
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
          title="Executive Administration"
          description="Global user orchestration and security clearance management system."
          className="enterprise-panel"
        >
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-black tracking-[0.2em] px-4 py-1.5 uppercase text-[10px]">Administrative Protocol Active</Badge>
        </PageHeader>
      </motion.div>

      <div className="grid gap-8 grid-cols-1 lg:grid-cols-3 items-start">
        {/* Creation Form */}
        <motion.div variants={slideUpVariants} className="lg:col-span-1">
          <Card className="enterprise-card overflow-hidden sticky top-24">
            <div className="bg-muted/10 border-b border-white/5 px-8 py-6">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <UserPlus size={18} className="text-primary" />
                Initiate Identity
              </h3>
            </div>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label className="enterprise-subheading ml-1">Universal Email</Label>
                  <div className="relative group">
                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="user@enterprise.com"
                      className="pl-12 h-12 bg-background/50 rounded-xl border-white/10 focus:bg-background transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="enterprise-subheading ml-1">Access Tier</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value) => handleSelectChange('role', value)}
                  >
                    <SelectTrigger className="h-12 bg-background/50 rounded-xl border-white/10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="ADMIN" className="font-bold">ADMIN (Full Access)</SelectItem>
                      <SelectItem value="HR" className="font-bold">HR (Management)</SelectItem>
                      <SelectItem value="MANAGER" className="font-bold">MANAGER (Supervisory)</SelectItem>
                      <SelectItem value="EMPLOYEE" className="font-bold">EMPLOYEE (Standard)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="enterprise-subheading ml-1">Deployment Division</Label>
                  <Select
                    value={formData.departmentId}
                    onValueChange={(value) => handleSelectChange('departmentId', value)}
                  >
                    <SelectTrigger className="h-12 bg-background/50 rounded-xl border-white/10">
                      <SelectValue placeholder="Select Division" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {departments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id} className="font-bold">{dept.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={loading} className="w-full h-14 rounded-2xl bg-primary shadow-lg shadow-primary/20 text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">
                  {loading ? <Loader2 className="animate-spin" /> : 'Deploy Identity'}
                </Button>
              </form>

              <div className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/10">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 flex items-center gap-2">
                  <ShieldCheck size={14} /> Security Protocol
                </p>
                <ul className="space-y-2 text-[10px] font-bold text-slate-500 uppercase leading-relaxed">
                  <li>• Identities must be globally unique</li>
                  <li>• Tier assignments grant immediate scope</li>
                  <li>• Removal is documented in audit logs</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* User Data Grid */}
        <motion.div variants={slideUpVariants} className="lg:col-span-2 space-y-6">
          <div className="enterprise-toolbar px-6 py-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] flex items-center gap-2">
                <Users size={18} className="text-primary" />
                Directory Control
              </h2>
              <div className="relative w-full md:w-80 group">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="Locate personnel record..."
                  className="h-11 pl-12 rounded-xl bg-background/50 border-white/10 focus:bg-background transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="relative">
            {usersLoading ? (
              <div className="rounded-[2rem] border border-white/5 overflow-hidden p-12 text-center bg-white/5">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Synchronizing Registry...</p>
              </div>
            ) : filteredUsers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[300px]">Personnel</TableHead>
                    <TableHead>Clearance</TableHead>
                    <TableHead>Division</TableHead>
                    <TableHead className="text-right">Control</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filteredUsers.map((emp, idx) => (
                      <motion.tr
                        key={emp.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: idx * 0.03 }}
                        component={TableRow}
                        className="group"
                      >
                        <TableCell>
                          <div className="flex items-center gap-4">
                            <Avatar className="h-11 w-11 rounded-2xl border border-white/10 shadow-sm group-hover:scale-105 transition-all">
                              <AvatarImage src={emp.profile_image} />
                              <AvatarFallback className="bg-primary/5 text-primary text-xs font-black">
                                {emp.firstName?.[0]}{emp.lastName?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div className="space-y-0.5">
                              <p className="text-sm font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{emp.firstName} {emp.lastName}</p>
                              <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5 uppercase tracking-tighter italic">
                                <Mail size={10} className="opacity-50" /> {emp.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={cn(
                            "font-black text-[9px] tracking-widest rounded-lg px-2.5 py-1 uppercase border-0",
                            emp.role === 'ADMIN' ? "bg-rose-500/10 text-rose-600 shadow-[0_0_10px_rgba(244,63,94,0.1)]" :
                              emp.role === 'HR' ? "bg-blue-500/10 text-blue-600 shadow-[0_0_10px_rgba(59,130,246,0.1)]" :
                                emp.role === 'MANAGER' ? "bg-amber-500/10 text-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.1)]" :
                                  "bg-slate-500/10 text-slate-600 shadow-[0_0_10px_rgba(100,116,139,0.1)]"
                          )}>
                            {emp.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs font-black text-slate-700 dark:text-slate-300">{emp.department?.name || 'CENTRAL'}</span>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest opacity-60 mt-0.5">{emp.position || 'OPERATIVE'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-muted active:scale-95 transition-all">
                                <MoreVertical size={18} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 glass-panel-dark rounded-2xl p-2 shadow-2xl border-white/10">
                              <DropdownMenuItem
                                className="p-3 rounded-xl gap-3 font-bold cursor-pointer"
                                onClick={() => { setSelectedEmployeeId(emp.id); setNewRole(emp.role); setShowRoleUpdateModal(true); }}
                              >
                                <UserCog size={16} className="text-primary" /> Adjust Clearance
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="p-3 rounded-xl gap-3 font-bold cursor-pointer"
                                onClick={() => handleToggleStatus(emp.id, emp.status)}
                              >
                                <Activity size={16} className={emp.status === 'ACTIVE' ? "text-amber-400" : "text-emerald-400"} />
                                {emp.status === 'ACTIVE' ? 'Suspend Identity' : 'Restore Identity'}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-white/10" />
                              <DropdownMenuItem
                                className="p-3 rounded-xl gap-3 font-bold text-rose-500 focus:bg-rose-500/10 focus:text-rose-600 cursor-pointer"
                                onClick={() => handleRemove(emp.id)}
                              >
                                <Trash2 size={16} /> Decommission
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            ) : (
              <Card className="enterprise-card border-dashed border-2 border-white/5 bg-white/5">
                <EnterpriseEmptyState
                  title="No Identity Records"
                  description="The personnel registry is currently empty or your search filters are too restrictive."
                  icon={ShieldAlert}
                  action={{
                    label: "Refresh Registry",
                    onClick: fetchEmployees,
                    icon: History
                  }}
                />
              </Card>
            )}
          </div>
        </motion.div>
      </div>

      <Dialog open={showRoleUpdateModal} onOpenChange={setShowRoleUpdateModal}>
        <DialogContent className="max-w-md glass-panel-dark border-white/10 rounded-[2.5rem] p-0 overflow-hidden shadow-2xl">
          <div className="bg-muted/10 border-b border-white/5 p-8">
            <DialogTitle className="text-xl font-black uppercase tracking-[0.1em] flex items-center gap-3">
              <ShieldCheck className="text-primary" /> Clearance Recalibration
            </DialogTitle>
            <p className="text-xs font-bold text-slate-500 mt-2 uppercase tracking-widest">Adjusting security scope for personnel record</p>
          </div>
          <div className="p-8 space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">New Authorization Tier</label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger className="h-14 bg-background/50 border-white/10 rounded-2xl font-bold">
                  <SelectValue placeholder="Select Identity Level" />
                </SelectTrigger>
                <SelectContent className="glass-panel-dark border-white/10 rounded-2xl">
                  <SelectItem value="ADMIN" className="p-3 font-bold">ADMIN (Global Scope)</SelectItem>
                  <SelectItem value="HR" className="p-3 font-bold">HR (Unit Management)</SelectItem>
                  <SelectItem value="MANAGER" className="p-3 font-bold">MANAGER (Supervisory)</SelectItem>
                  <SelectItem value="EMPLOYEE" className="p-3 font-bold">EMPLOYEE (Operational)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
              <Activity size={18} className="text-amber-500 mt-0.5" />
              <p className="text-[10px] font-bold text-amber-700 dark:text-amber-400 uppercase leading-relaxed tracking-tight">
                Warning: Clearance updates affect immediate resource access and protocol execution permissions.
              </p>
            </div>
          </div>
          <div className="p-8 bg-muted/10 border-t border-white/5 flex gap-3">
            <Button variant="ghost" className="flex-1 rounded-xl font-bold uppercase tracking-widest text-slate-400 hover:text-white" onClick={() => setShowRoleUpdateModal(false)}>Abort</Button>
            <Button className="flex-[2] bg-primary rounded-xl font-black uppercase tracking-widest h-12 shadow-lg shadow-primary/20" onClick={handleUpdateRole}>Confirm Protocol</Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default AdminUsers;