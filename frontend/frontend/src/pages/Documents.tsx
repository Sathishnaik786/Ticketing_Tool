import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DocumentForm } from '@/components/forms/DocumentForm';
import { CrudModal } from '@/components/modals/CrudModal';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { documentsApi } from '@/services/api';
import { Document as EmployeeDocument, DocumentType } from '@/types';

export default function Documents() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      // For now, fetch documents for the logged-in user's employee
      if (user?.employeeId) {
        const response = await documentsApi.getByEmployee(user.employeeId);
        setDocuments(response || []);
      }
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      const errorMessage = error.message || 'Failed to fetch documents';
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

  const handleUploadDocument = () => {
    setIsModalOpen(true);
  };

  const handleFormSubmit = async (data: { file: File; type: DocumentType; employeeId: string }) => {
    try {
      await documentsApi.upload(data.employeeId, data.file, data.type);
      toast({
        title: 'Success',
        description: 'Document uploaded successfully',
      });
      setIsModalOpen(false);
      fetchDocuments();
    } catch (error: unknown) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to upload document',
        variant: 'destructive',
      });
      throw error;
    }
  };

  if (authLoading) {
    return (
      <>
        <PageHeader title="Documents" description="Employee document management">
          <Button disabled><Upload className="h-4 w-4 mr-2" />Upload Document</Button>
        </PageHeader>
        <Card>
          <CardContent className="py-12 text-center">
            <p>Initializing session…</p>
          </CardContent>
        </Card>
      </>
    );
  }

  if (!user) {
    return (
      <>
        <PageHeader title="Documents" description="Employee document management">
          <Button><Upload className="h-4 w-4 mr-2" />Upload Document</Button>
        </PageHeader>
        <Card>
          <CardContent className="py-12 text-center">
            <p>Unauthorized</p>
          </CardContent>
        </Card>
      </>
    );
  }

  // Safe rendering patterns
  if (loading) {
    return (
      <>
        <PageHeader title="Documents" description="Employee document management">
          <Button onClick={handleUploadDocument} disabled><Upload className="h-4 w-4 mr-2" />Upload Document</Button>
        </PageHeader>
        <Card>
          <CardContent className="py-12 text-center">
            <p>Loading documents...</p>
          </CardContent>
        </Card>
      </>
    );
  }

  if (error) {
    return (
      <>
        <PageHeader title="Documents" description="Employee document management">
          <Button onClick={handleUploadDocument}><Upload className="h-4 w-4 mr-2" />Upload Document</Button>
        </PageHeader>
        <Card>
          <CardContent className="py-12 text-center text-red-500">
            <p>Error: {error}</p>
          </CardContent>
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Documents" description="Employee document management">
        <Button onClick={handleUploadDocument}><Upload className="h-4 w-4 mr-2" />Upload Document</Button>
      </PageHeader>
      
      <CrudModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title="Upload Document"
        size="lg"
      >
        <DocumentForm
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </CrudModal>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {documents && documents.length > 0 ? (
          documents.map((doc) => (
            <Card key={doc.id}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <FileText className="h-10 w-10 text-muted-foreground" />
                  <div>
                    <h3 className="font-medium">{doc.name}</h3>
                    <p className="text-sm text-muted-foreground">{doc.type}</p>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(doc.createdAt || '').toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No documents found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}