import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/components/ui/avatar';
import {
  SearchIcon,
  PlusIcon,
  MoreVertical,
  Calendar,
  User,
  CheckCircle2,
  Briefcase,
  LayoutGrid,
  List as ListIcon,
  ChevronRight,
  Target,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { projectsApi, employeesApi } from '@/services/api';
import { Project, Employee } from '@/types';
import ProjectStatusBadge from '@/components/common/ProjectStatusBadge';
import ProjectForm from '@/components/forms/ProjectForm';
import { PageHeader } from '@/components/layout/PageHeader';
import { staggerContainer, slideUpVariants } from '@/animations/motionVariants';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 12;
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsApi.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
      });
      setProjects(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to synchronize projects archive',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const response = await employeesApi.getAll();
      setEmployees(response.data || []);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchProjects();
      fetchEmployees();
    }
  }, [currentPage, searchTerm, authLoading, user]);

  const handleCreateProject = async (data: any) => {
    try {
      await projectsApi.create(data);
      toast({ title: 'Success', description: 'Institutional project deployed successfully' });
      setIsCreateDialogOpen(false);
      fetchProjects();
    } catch (error) {
      toast({ title: 'Error', description: 'Deployment sequence failed', variant: 'destructive' });
    }
  };

  const handleUpdateProject = async (data: any) => {
    if (!editingProject) return;
    try {
      await projectsApi.update(editingProject.id, data);
      toast({ title: 'Success', description: 'Project parameters recalibrated' });
      setIsEditDialogOpen(false);
      setEditingProject(null);
      fetchProjects();
    } catch (error) {
      toast({ title: 'Error', description: 'Recalibration failed', variant: 'destructive' });
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!window.confirm('Commence project decommissioning? This action is irreversible.')) return;
    try {
      await projectsApi.delete(id);
      toast({ title: 'Success', description: 'Project decommissioned' });
      fetchProjects();
    } catch (error) {
      toast({ title: 'Error', description: 'Decommissioning failed', variant: 'destructive' });
    }
  };

  const stats = useMemo(() => ({
    total: projects.length,
    inProgress: projects.filter(p => p.status === 'IN_PROGRESS').length,
    completed: projects.filter(p => p.status === 'COMPLETED').length,
  }), [projects]);

  if (authLoading) return <div className="p-12 flex justify-center"><div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={staggerContainer}
      className="p-6 lg:p-8 space-y-8"
    >
      <motion.div variants={slideUpVariants}>
        <PageHeader
          title="Project Intelligence"
          description="Orchestrate organizational initiatives and track milestone delivery."
          className="bg-header-gradient p-8 rounded-3xl border border-border/30 shadow-premium"
        >
          <div className="flex items-center gap-3">
            <div className="flex bg-muted/30 p-1 rounded-xl border border-border/20 mr-2">
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className={cn("h-8 px-3 rounded-lg text-xs font-bold", viewMode === 'grid' && "shadow-sm")}
              >
                <LayoutGrid size={14} className="mr-1.5" /> GRID
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className={cn("h-8 px-3 rounded-lg text-xs font-bold", viewMode === 'list' && "shadow-sm")}
              >
                <ListIcon size={14} className="mr-1.5" /> LIST
              </Button>
            </div>
            <Button variant="premium" size="sm" onClick={() => setIsCreateDialogOpen(true)} className="shadow-lg shadow-primary/20">
              <PlusIcon size={16} className="mr-2" /> INITIATE PROJECT
            </Button>
          </div>
        </PageHeader>
      </motion.div>

      {/* Analytics Overview */}
      <motion.div variants={slideUpVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border/30 bg-card/60 backdrop-blur-md shadow-premium rounded-3xl overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Initiatives</p>
                <h3 className="text-3xl font-black mt-1">{loading ? '...' : stats.total}</h3>
              </div>
              <div className="p-4 rounded-2xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                <Briefcase size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-card/60 backdrop-blur-md shadow-premium rounded-3xl overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">In Operation</p>
                <h3 className="text-3xl font-black mt-1 text-amber-500">{loading ? '...' : stats.inProgress}</h3>
              </div>
              <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                <Clock size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/30 bg-card/60 backdrop-blur-md shadow-premium rounded-3xl overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Successful Delivery</p>
                <h3 className="text-3xl font-black mt-1 text-emerald-500">{loading ? '...' : stats.completed}</h3>
              </div>
              <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                <CheckCircle2 size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search & Filtering */}
      <motion.div variants={slideUpVariants} className="max-w-md">
        <div className="relative group">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Filter projects by signature..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-12 bg-background/50 backdrop-blur-sm border-border/30 focus:border-primary/40 rounded-xl transition-all"
          />
        </div>
      </motion.div>

      {/* Project Display */}
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center h-64 gap-4"
          >
            <div className="animate-spin h-10 w-10 border-[3px] border-primary border-t-transparent rounded-full" />
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest italic">Synchronizing Core Archive...</p>
          </motion.div>
        ) : viewMode === 'grid' ? (
          <motion.div
            key="grid"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {projects.map((project, idx) => {
              const tasks = project.project_tasks || [];
              const doneTasks = tasks.filter(t => t.status === 'DONE').length;
              const progress = tasks.length > 0 ? (doneTasks / tasks.length) * 100 : 0;

              return (
                <motion.div
                  key={project.id}
                  variants={slideUpVariants}
                  whileHover={{ y: -8 }}
                  className="group cursor-pointer"
                  onClick={() => navigate(`/app/projects/${project.id}`)}
                >
                  <Card className="h-full border-border/30 bg-card/60 backdrop-blur-sm shadow-premium group-hover:shadow-2xl group-hover:border-primary/20 rounded-3xl overflow-hidden transition-all duration-300">
                    <CardHeader className="pb-4 relative">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter bg-primary/5 border-primary/10 text-primary px-2 py-0.5">
                          {project.project_type.replace('_', ' ')}
                        </Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
                              <MoreVertical size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl glass-panel-dark border-white/10 p-1">
                            <DropdownMenuItem className="rounded-lg gap-2 font-bold focus:bg-primary/20" onClick={(e) => { e.stopPropagation(); setEditingProject(project); setIsEditDialogOpen(true); }}>
                              <Target size={14} className="text-primary" /> Recalibrate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-white/10" />
                            <DropdownMenuItem className="rounded-lg gap-2 font-bold text-rose-400 focus:bg-rose-500/10 focus:text-rose-500" onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }}>
                              <PlusIcon className="rotate-45" size={14} /> Decommission
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardTitle className="text-lg font-black tracking-tight group-hover:text-primary transition-colors leading-tight">{project.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium italic">
                        <User size={12} className="opacity-50" />
                        <span>Manager: </span>
                        <span className="text-foreground font-bold not-italic">{project.manager?.firstName} {project.manager?.lastName}</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          <span>Progress</span>
                          <span className="text-primary">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5 bg-muted/40" />
                      </div>

                      <div className="flex items-center justify-between pt-2">
                        <ProjectStatusBadge status={project.status} />
                        <div className="flex -space-x-2">
                          {project.project_members?.slice(0, 3).map((member, i) => (
                            <Avatar key={i} className="h-7 w-7 border-2 border-background ring-1 ring-border shadow-sm">
                              <AvatarImage src={member.employee?.profile_image} />
                              <AvatarFallback className="text-[8px] bg-primary/10 text-primary font-black">{member.employee?.firstName?.[0]}{member.employee?.lastName?.[0]}</AvatarFallback>
                            </Avatar>
                          ))}
                          {project.project_members?.length > 3 && (
                            <div className="h-7 w-7 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[8px] font-black text-muted-foreground">
                              +{project.project_members.length - 3}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {projects.map((project, idx) => {
              const tasks = project.project_tasks || [];
              const doneTasks = tasks.filter(t => t.status === 'DONE').length;
              const progress = tasks.length > 0 ? (doneTasks / tasks.length) * 100 : 0;

              return (
                <Card
                  key={project.id}
                  className="group hover:bg-muted/30 transition-all border-border/30 bg-card/40 backdrop-blur-sm rounded-2xl overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/app/projects/${project.id}`)}
                >
                  <div className="flex items-center p-4">
                    <div className="p-3 rounded-xl bg-primary/10 text-primary mr-4 group-hover:scale-110 transition-transform">
                      <Briefcase size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-sm tracking-tight">{project.name}</h4>
                      <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">{project.project_type.replace('_', ' ')}</p>
                    </div>
                    <div className="flex-1 px-8 hidden lg:block">
                      <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                        <span>Completion Rate</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-1 bg-muted/30" />
                    </div>
                    <div className="flex-1 hidden md:block px-6">
                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1 opacity-50">Lead Strategist</p>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={project.manager?.profile_image} />
                          <AvatarFallback className="text-[6px] bg-primary/5 text-primary">{project.manager?.firstName?.[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-bold">{project.manager?.firstName} {project.manager?.lastName}</span>
                      </div>
                    </div>
                    <div className="w-32 flex justify-center">
                      <ProjectStatusBadge status={project.status} />
                    </div>
                    <div className="pl-4">
                      <ChevronRight size={18} className="text-muted-foreground/30 group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center pt-8 gap-3">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            className="rounded-xl px-6 h-11 font-black uppercase tracking-widest text-[10px] border-border/40"
          >
            Retrieve Previous
          </Button>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            className="rounded-xl px-6 h-11 font-black uppercase tracking-widest text-[10px] border-border/40"
          >
            Load Next Archive
          </Button>
        </div>
      )}

      {/* Project Form Dialogs */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl glass-panel-dark border-white/10 rounded-[2.5rem] p-0 overflow-hidden">
          <DialogHeader className="p-8 pb-0">
            <DialogTitle className="text-2xl font-black uppercase tracking-widest text-primary flex items-center gap-3">
              <PlusIcon /> Initiative Deployment
            </DialogTitle>
          </DialogHeader>
          <div className="p-8">
            <ProjectForm
              employees={employees}
              onSubmit={handleCreateProject}
              onCancel={() => setIsCreateDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl glass-panel-dark border-white/10 rounded-[3rem] p-0 overflow-hidden">
          <DialogHeader className="p-10 pb-4">
            <DialogTitle className="text-2xl font-black uppercase tracking-[0.2em] text-primary flex items-center gap-4">
              <ArrowUpRight size={28} /> Parameter Calibration
            </DialogTitle>
          </DialogHeader>
          <div className="px-10 pb-10">
            {editingProject && (
              <ProjectForm
                initialData={editingProject}
                employees={employees}
                onSubmit={handleUpdateProject}
                onCancel={() => { setIsEditDialogOpen(false); setEditingProject(null); }}
              />
            )}

          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};

export default ProjectsPage;