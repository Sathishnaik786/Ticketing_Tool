import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  CalendarIcon, 
  UserIcon, 
  UsersIcon, 
  FileTextIcon, 
  CheckCircleIcon,
  MoreVerticalIcon
} from 'lucide-react';
import { Project } from '@/types';
import ProjectStatusBadge from './ProjectStatusBadge';
import { format } from 'date-fns';

interface ProjectCardProps {
  project: Project;
  onEdit?: (project: Project) => void;
  onDelete?: (id: string) => void;
  onViewDetails?: (id: string) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ 
  project, 
  onEdit, 
  onDelete, 
  onViewDetails 
}) => {
  const handleViewDetails = () => {
    if (onViewDetails) {
      onViewDetails(project.id);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg truncate">{project.name}</CardTitle>
            <div className="mt-2 flex items-center gap-2">
              <ProjectStatusBadge status={project.status} />
              <Badge variant="secondary" className="text-xs">
                {project.project_type.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewDetails}
            className="h-8 w-8 p-0"
          >
            <MoreVerticalIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {project.description && (
            <p className="text-sm text-gray-600 line-clamp-2">
              {project.description}
            </p>
          )}
          
          <div className="flex items-center text-sm text-gray-500">
            <UserIcon className="h-4 w-4 mr-1.5" />
            <span className="truncate">
              {project.manager?.firstName} {project.manager?.lastName}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="flex items-center text-sm text-gray-500">
              <CalendarIcon className="h-4 w-4 mr-1.5" />
              <span>
                {project.start_date ? format(new Date(project.start_date), 'MMM dd, yyyy') : 'N/A'}
              </span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <CalendarIcon className="h-4 w-4 mr-1.5" />
              <span>
                {project.end_date ? format(new Date(project.end_date), 'MMM dd, yyyy') : 'N/A'}
              </span>
            </div>
          </div>
          
          <div className="pt-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Members</span>
              <span className="font-medium">{project.project_members.length}</span>
            </div>
            <div className="flex items-center mt-2">
              <div className="flex -space-x-2">
                {project.project_members.slice(0, 3).map((member, index) => (
                  <Avatar key={member.id} className="h-8 w-8 border-2 border-background">
                    <AvatarImage 
                      src={member.employee?.avatar || ''} 
                      alt={member.employee?.firstName || 'Member'} 
                    />
                    <AvatarFallback>
                      {member.employee?.firstName?.charAt(0)}
                      {member.employee?.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                ))}
              </div>
              {project.project_members.length > 3 && (
                <span className="ml-2 text-sm text-gray-500">
                  +{project.project_members.length - 3} more
                </span>
              )}
            </div>
          </div>
          
          <div className="pt-2 flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <FileTextIcon className="h-4 w-4 mr-1" />
                <span>{project.project_documents.length}</span>
              </div>
              <div className="flex items-center">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                <span>
                  {project.project_tasks.filter(t => t.status === 'DONE').length}/{project.project_tasks.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectCard;