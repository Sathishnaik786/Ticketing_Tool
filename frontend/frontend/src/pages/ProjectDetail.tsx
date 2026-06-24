import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  PlusIcon, 
  MoreHorizontalIcon,
  CalendarIcon,
  UserIcon,
  UsersIcon,
  FileTextIcon,
  CheckCircleIcon,
  MessageCircleIcon,
  VideoIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { projectsApi } from '@/services/api';
import { Project, ProjectTask, ProjectDocument, ProjectMeeting, ProjectTodo, ProjectUpdate, Employee } from '@/types';
import ProjectStatusBadge from '@/components/common/ProjectStatusBadge';
import { employeesApi } from '@/services/api';

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [isDocumentDialogOpen, setIsDocumentDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'MEMBER' | 'LEAD'>('MEMBER');

  // Fetch project details
  const fetchProject = async () => {
    try {
      setLoading(true);
      if (id) {
        const data = await projectsApi.getById(id);
        setProject(data || null);
      }
    } catch (error) {
      console.error('Error fetching project:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch project details',
        variant: 'destructive',
      });
      navigate('/projects');
    } finally {
      setLoading(false);
    }
  };

  // Fetch employees
  const fetchEmployees = async () => {
    try {
      const response = await employeesApi.getAll();
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch employees',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchProject();
    fetchEmployees();
  }, [id]);

  const handleDeleteProject = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await projectsApi.delete(id);
      toast({
        title: 'Success',
        description: 'Project deleted successfully',
      });
      navigate('/projects');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete project',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    try {
      await projectsApi.updateTask(taskId, { status });
      toast({
        title: 'Success',
        description: 'Task status updated successfully',
      });
      fetchProject(); // Refresh the project data
    } catch (error) {
      console.error('Error updating task status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update task status',
        variant: 'destructive',
      });
    }
  };

  const handleToggleTodo = async (todoId: string, isCompleted: boolean) => {
    try {
      await projectsApi.updateTodo(todoId, { is_completed: !isCompleted });
      toast({
        title: 'Success',
        description: 'Todo updated successfully',
      });
      fetchProject(); // Refresh the project data
    } catch (error) {
      console.error('Error updating todo:', error);
      toast({
        title: 'Error',
        description: 'Failed to update todo',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold">Project not found</h2>
        <Button onClick={() => navigate('/projects')} className="mt-4">
          Go Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
          <div className="flex items-center mt-2 space-x-2">
            <ProjectStatusBadge status={project.status} />
            <Badge variant="secondary">
              {project.project_type.replace('_', ' ')}
            </Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate('/projects')}>
            Back to Projects
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <MoreHorizontalIcon className="h-4 w-4 mr-2" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate(`/app/projects/${project.id}/edit`)}>
                Edit Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteProject} className="text-red-600">
                Delete Project
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="flex h-auto flex-wrap gap-1 border-b p-0 overflow-x-auto w-full max-w-full pb-4">
              <TabsTrigger value="overview" className="px-4 py-2 text-sm whitespace-nowrap border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:font-medium">
                Overview
              </TabsTrigger>
              <TabsTrigger value="tasks" className="px-4 py-2 text-sm whitespace-nowrap border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:font-medium">
                Tasks
              </TabsTrigger>
              <TabsTrigger value="documents" className="px-4 py-2 text-sm whitespace-nowrap border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:font-medium">
                Documents
              </TabsTrigger>
              <TabsTrigger value="meetings" className="px-4 py-2 text-sm whitespace-nowrap border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:font-medium">
                Meetings
              </TabsTrigger>
              <TabsTrigger value="todos" className="px-4 py-2 text-sm whitespace-nowrap border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:font-medium">
                Todos
              </TabsTrigger>
              <TabsTrigger value="updates" className="px-4 py-2 text-sm whitespace-nowrap border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:border-b-2 data-[state=active]:font-medium">
                Updates
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {project.description && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Description</h3>
                      <p className="mt-1 text-gray-900">{project.description}</p>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                      <p className="mt-1 text-gray-900">
                        {project.start_date ? format(new Date(project.start_date), 'PPP') : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">End Date</h3>
                      <p className="mt-1 text-gray-900">
                        {project.end_date ? format(new Date(project.end_date), 'PPP') : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Manager</h3>
                    <div className="mt-1 flex items-center">
                      <UserIcon className="h-4 w-4 mr-2 text-gray-500" />
                      <span>
                        {project.manager?.firstName} {project.manager?.lastName}
                      </span>
                    </div>
                  </div>
                  
                  {project.client && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Client</h3>
                      <p className="mt-1 text-gray-900">{project.client.name}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Project Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">Tasks Completion</span>
                        <span className="text-sm font-medium">
                          {(project.project_tasks || []).filter(t => t.status === 'DONE').length} / {(project.project_tasks || []).length}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full" 
                          style={{ 
                            width: `${(project.project_tasks || []).length > 0 ? ((project.project_tasks || []).filter(t => t.status === 'DONE').length / (project.project_tasks || []).length) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">
                          {(project.project_tasks || []).filter(t => t.status === 'TODO').length}
                        </p>
                        <p className="text-sm text-gray-500">To Do</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-yellow-600">
                          {(project.project_tasks || []).filter(t => t.status === 'IN_PROGRESS').length}
                        </p>
                        <p className="text-sm text-gray-500">In Progress</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-green-600">
                          {(project.project_tasks || []).filter(t => t.status === 'DONE').length}
                        </p>
                        <p className="text-sm text-gray-500">Completed</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tasks" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Project Tasks</CardTitle>
                  <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Task
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Add New Task</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p>Task creation form would go here</p>
                        <p className="text-sm text-gray-500">This would include fields for title, description, assignee, priority, due date, etc.</p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {(project.project_tasks || []).length > 0 ? (
                    <div className="space-y-4">
                      {(project.project_tasks || []).map((task) => (
                        <div key={task.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center">
                            <CheckCircleIcon 
                              className={`h-5 w-5 mr-3 ${task.status === 'DONE' ? 'text-green-500' : 'text-gray-300'}`} 
                              onClick={() => handleUpdateTaskStatus(task.id, task.status === 'DONE' ? 'TODO' : 'DONE')}
                            />
                            <div>
                              <h4 className="font-medium">{task.title}</h4>
                              <p className="text-sm text-gray-500">{task.description}</p>
                              <div className="flex items-center mt-1 space-x-2">
                                <span className="text-xs px-2 py-1 bg-gray-100 rounded">
                                  {task.priority}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {task.due_date ? `Due: ${format(new Date(task.due_date), 'MMM dd')}` : 'No due date'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {task.assigned_to_user && (
                              <div className="flex items-center">
                                <UserIcon className="h-4 w-4 mr-1 text-gray-500" />
                                <span className="text-sm">
                                  {task.assigned_to_user.firstName} {task.assigned_to_user.lastName}
                                </span>
                              </div>
                            )}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontalIcon className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleUpdateTaskStatus(task.id, task.status === 'DONE' ? 'TODO' : 'DONE')}>
                                  {task.status === 'DONE' ? 'Mark as Incomplete' : 'Mark as Complete'}
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => toast({title: 'Info', description: 'Task editing not implemented yet', variant: 'default'})}>
                                  Edit Task
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No tasks found for this project
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Project Documents</CardTitle>
                  <Dialog open={isDocumentDialogOpen} onOpenChange={setIsDocumentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Upload Document
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Upload Document</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <p>Document upload form would go here</p>
                        <p className="text-sm text-gray-500">This would include file upload functionality</p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {(project.project_documents || []).length > 0 ? (
                    <div className="space-y-3">
                      {(project.project_documents || []).map((document) => (
                        <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center">
                            <FileTextIcon className="h-5 w-5 mr-3 text-blue-500" />
                            <div>
                              <h4 className="font-medium">{document.file_name}</h4>
                              <p className="text-sm text-gray-500">
                                Uploaded by {document.uploaded_by_user?.firstName} {document.uploaded_by_user?.lastName} on {format(new Date(document.uploaded_at), 'MMM dd, yyyy')}
                              </p>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No documents found for this project
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="meetings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Meetings</CardTitle>
                </CardHeader>
                <CardContent>
                  {(project.project_meetings || []).length > 0 ? (
                    <div className="space-y-4">
                      {(project.project_meetings || []).map((meeting) => (
                        <div key={meeting.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between">
                            <h4 className="font-medium">{meeting.title}</h4>
                            <span className="text-sm text-gray-500">
                              {format(new Date(meeting.meeting_date), 'MMM dd, yyyy h:mm a')}
                            </span>
                          </div>
                          {meeting.meeting_link && (
                            <p className="text-sm text-blue-500 mt-1">
                              <a href={meeting.meeting_link} target="_blank" rel="noopener noreferrer">
                                Join Meeting
                              </a>
                            </p>
                          )}
                          {meeting.notes && (
                            <p className="text-sm text-gray-600 mt-2">{meeting.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No meetings scheduled for this project
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="todos" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Todos</CardTitle>
                </CardHeader>
                <CardContent>
                  {(project.project_todos || []).length > 0 ? (
                    <div className="space-y-3">
                      {(project.project_todos || []).map((todo) => (
                        <div key={todo.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center">
                            <CheckCircleIcon 
                              className={`h-5 w-5 mr-3 ${todo.is_completed ? 'text-green-500' : 'text-gray-300'}`} 
                              onClick={() => handleToggleTodo(todo.id, todo.is_completed)}
                            />
                            <span className={todo.is_completed ? 'line-through text-gray-500' : ''}>
                              {todo.title}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No todos found for this project
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="updates" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Project Updates</CardTitle>
                </CardHeader>
                <CardContent>
                  {(project.project_updates || []).length > 0 ? (
                    <div className="space-y-4">
                      {(project.project_updates || []).map((update) => (
                        <div key={update.id} className="p-4 border rounded-lg">
                          <div className="flex items-start">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <UserIcon className="h-4 w-4 mr-2 text-gray-500" />
                                <h4 className="font-medium">
                                  {update.employee?.firstName} {update.employee?.lastName}
                                </h4>
                                <span className="text-sm text-gray-500 ml-2">
                                  {format(new Date(update.created_at), 'MMM dd, yyyy h:mm a')}
                                </span>
                              </div>
                              <p className="mt-2 text-gray-700">{update.message}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No updates found for this project
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Project Members</CardTitle>
              <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add Project Member</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Select Employee</label>
                      <select 
                        className="w-full p-2 border rounded mt-1"
                        value={selectedEmployee}
                        onChange={(e) => setSelectedEmployee(e.target.value)}
                      >
                        <option value="">Select an employee</option>
                        {employees
                          .filter(employee => 
                            !project.project_members.some(member => member.employee_id === employee.id)
                          )
                          .map(employee => (
                            <option key={employee.id} value={employee.id}>
                              {employee.firstName} {employee.lastName} ({employee.email})
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Role</label>
                      <select 
                        className="w-full p-2 border rounded mt-1"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value as 'MEMBER' | 'LEAD')}
                      >
                        <option value="MEMBER">Member</option>
                        <option value="LEAD">Lead</option>
                      </select>
                    </div>
                    <Button 
                      onClick={async () => {
                        if (!selectedEmployee) {
                          toast({
                            title: "Error",
                            description: "Please select an employee",
                            variant: "destructive"
                          });
                          return;
                        }
                        
                        try {
                          await projectsApi.addMember(project.id, { 
                            employee_id: selectedEmployee, 
                            role: selectedRole 
                          });
                          toast({
                            title: "Success",
                            description: "Project member added successfully"
                          });
                          setIsMemberDialogOpen(false);
                          // Reset form values
                          setSelectedEmployee('');
                          setSelectedRole('MEMBER');
                          fetchProject(); // Refresh the project data
                        } catch (error: any) {
                          console.error('Error adding project member:', error);
                          
                          // Check if it's a duplicate entry error (status 409)
                          if (error.status === 409 || (error.message && error.message.includes('already a member'))) {
                            toast({
                              title: "Info",
                              description: "This employee is already assigned to this project",
                              variant: "default"
                            });
                          } else {
                            toast({
                              title: "Error",
                              description: "Failed to add project member",
                              variant: "destructive"
                            });
                          }
                        }
                      }}
                    >
                      Add to Project
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(project.project_members || []).map((member) => (
                  <div key={member.id} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <UserIcon className="h-5 w-5 mr-2 text-gray-500" />
                      <div>
                        <p className="font-medium">
                          {member.employee?.firstName} {member.employee?.lastName}
                        </p>
                        <div className="flex items-center space-x-2">
                          <p className="text-sm text-gray-500">{member.role}</p>
                          <span className="text-xs text-gray-400">•</span>
                          <p className="text-sm text-gray-600">{member.employee?.position}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Project Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Tasks</span>
                  <span className="font-medium">{(project.project_tasks || []).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed Tasks</span>
                  <span className="font-medium">
                    {(project.project_tasks || []).filter(t => t.status === 'DONE').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Documents</span>
                  <span className="font-medium">{(project.project_documents || []).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Members</span>
                  <span className="font-medium">{(project.project_members || []).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Updates</span>
                  <span className="font-medium">{(project.project_updates || []).length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailPage;