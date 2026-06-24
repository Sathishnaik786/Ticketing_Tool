import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { departmentsApi } from '@/services/api';
import { Department, DepartmentFormData } from '@/types';
import { Plus, Users, User, Edit, Trash2 } from 'lucide-react';
import { DepartmentForm } from '@/components/forms/DepartmentForm';
import { CrudModal } from '@/components/modals/CrudModal';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

const Departments = () => {
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  
  useEffect(() => {
    console.log('USER:', user);
    console.log('API DATA: Departments data:', departments);
    console.log('LOADING:', loading);
    console.log('ERROR:', error);
  }, [user, departments, loading, error]);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching departments...');
      
      const response = await departmentsApi.getAll();
      
      setDepartments(response || []);
    } catch (error: unknown) {
      console.error('Error fetching departments:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch departments';
      console.log('Error:', errorMessage);
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
    fetchDepartments();
  }, []);

  const handleCreateDepartment = () => {
    setEditingDepartment(null);
    setIsModalOpen(true);
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setIsModalOpen(true);
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    // Note: Delete functionality is not implemented in the API
    toast({
      title: 'Not Implemented',
      description: 'Department deletion is not currently supported',
      variant: 'destructive',
    });
  };

  const handleFormSubmit = async (data: DepartmentFormData) => {
    try {
      if (editingDepartment) {
        // Update existing department
        await departmentsApi.update(editingDepartment.id, data);
        toast({
          title: 'Success',
          description: 'Department updated successfully',
        });
      } else {
        // Create new department
        await departmentsApi.create(data);
        toast({
          title: 'Success',
          description: 'Department created successfully',
        });
      }
      setIsModalOpen(false);
      setEditingDepartment(null);
      fetchDepartments(); // Refresh the list
    } catch (error: unknown) {
      throw error;
    }
  };

  if (authLoading) {
    return (
      <div className="p-4">Initializing session…</div>
    );
  }

  if (!user) {
    return (
      <div className="p-4">Unauthorized</div>
    );
  }

  if (loading) {
    return (
      <>
        <PageHeader title="Departments" description="Manage organization departments">
          <Button disabled><Plus className="h-4 w-4 mr-2" />Add Department</Button>
        </PageHeader>
        <div className="p-4">Loading...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader title="Departments" description="Manage organization departments">
          <Button onClick={handleCreateDepartment}><Plus className="h-4 w-4 mr-2" />Add Department</Button>
        </PageHeader>
        <div className="p-4 text-red-500">
          Error: {error}
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Departments" description="Manage organization departments">
        <Button onClick={handleCreateDepartment}><Plus className="h-4 w-4 mr-2" />Add Department</Button>
      </PageHeader>
      
      <CrudModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={editingDepartment ? 'Edit Department' : 'Create Department'}
        size="lg"
      >
        <DepartmentForm
          department={editingDepartment || undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </CrudModal>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {departments.length > 0 ? (
          departments.map((dept) => (
            <Card key={dept.id} className="hover:shadow-card-hover transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  {dept.name}
                  <div className="ml-auto flex gap-1">
                    <Button variant="outline" size="sm" onClick={() => handleEditDepartment(dept)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteDepartment(dept.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">{dept.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1"><Users className="h-4 w-4" />{dept.employeeCount} employees</span>
                  {dept.manager && <span className="flex items-center gap-1"><User className="h-4 w-4" />{dept.manager.firstName}</span>}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No departments found</p>
          </div>
        )}
      </div>

      <div className="mt-4">
        <p className="text-sm text-muted-foreground text-center">
          Showing {departments.length} department{departments.length !== 1 ? 's' : ''}
        </p>
      </div>
    </>
  );
}

export default Departments;