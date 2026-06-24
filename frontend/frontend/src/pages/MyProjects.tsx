import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  SearchIcon, 
  PlusIcon, 
  MoreHorizontalIcon,
  CalendarIcon,
  UserIcon,
  FileTextIcon,
  CheckCircleIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { projectsApi } from '@/services/api';
import { Project } from '@/types';
import ProjectStatusBadge from '@/components/common/ProjectStatusBadge';

const MyProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 10;
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch projects assigned to current user
  const fetchMyProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsApi.getMyProjects({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
      });
      setProjects(response.data);
      setTotalPages(response.meta.totalPages);
    } catch (error) {
      console.error('Error fetching my projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch your projects',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProjects();
  }, [currentPage, searchTerm]);

  const handleViewProject = (id: string) => {
    navigate(`/app/projects/${id}`);
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.project_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Projects</h1>
          <p className="text-gray-500">Projects you're assigned to</p>
        </div>
        <div className="relative">
          <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search projects..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assigned Projects</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Manager</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Team</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.length > 0 ? (
                    filteredProjects.map((project) => (
                      <TableRow key={project.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span className="font-semibold">{project.name}</span>
                            {project.description && (
                              <span className="text-sm text-gray-500 truncate max-w-xs">
                                {project.description}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-medium">
                            {project.project_type.replace('_', ' ')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <UserIcon className="h-4 w-4 mr-1.5" />
                            <span>
                              {project.manager?.firstName} {project.manager?.lastName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <ProjectStatusBadge status={project.status} />
                        </TableCell>
                        <TableCell>
                          {project.start_date ? format(new Date(project.start_date), 'MMM dd, yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {project.end_date ? format(new Date(project.end_date), 'MMM dd, yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          <div className="space-y-1">
                            {project.project_members
                              .filter(member => member.role === 'LEAD')
                              .map(lead => (
                                <div key={`lead-${lead.id}`} className="flex flex-wrap items-center text-xs sm:text-sm">
                                  <UserIcon className="h-3 w-3 mr-1 text-blue-500" />
                                  <span className="text-blue-600 font-medium truncate max-w-[80px] sm:max-w-[120px]">
                                    {lead.employee?.firstName} {lead.employee?.lastName}
                                  </span>
                                  <span className="ml-1 text-[0.6rem] sm:text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                                    Lead
                                  </span>
                                </div>
                              ))
                            }
                            {project.project_members
                              .filter(member => member.role === 'MEMBER')
                              .slice(0, 2) // Show only first 2 members to avoid overcrowding
                              .map(member => (
                                <div key={`member-${member.id}`} className="flex flex-wrap items-center text-xs sm:text-sm">
                                  <UserIcon className="h-3 w-3 mr-1 text-gray-500" />
                                  <span className="truncate max-w-[80px] sm:max-w-[120px]">
                                    {member.employee?.firstName} {member.employee?.lastName}
                                  </span>
                                </div>
                              ))
                            }
                            {project.project_members.filter(member => member.role === 'MEMBER').length > 2 && (
                              <div className="text-[0.6rem] sm:text-xs text-gray-500 mt-1">
                                +{project.project_members.filter(member => member.role === 'MEMBER').length - 2} more
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                            <span>
                              {(project.project_tasks || []).filter(t => t.status === 'DONE').length}/{project.project_tasks?.length || 0}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontalIcon className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewProject(project.id)}>
                                View Details
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                        No projects assigned to you
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="px-2">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default MyProjectsPage;