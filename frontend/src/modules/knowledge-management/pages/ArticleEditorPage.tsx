import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateArticle, useKnowledgeCategories } from '../hooks/useKnowledgeManagement';

interface EditorForm {
  title: string;
  summary: string;
  content: string;
  category_id: string;
  tags: string;
}

export default function ArticleEditorPage() {
  const navigate = useNavigate();
  const createArticle = useCreateArticle();
  const { data: categories = [] } = useKnowledgeCategories();

  const { register, handleSubmit, setValue, watch } = useForm<EditorForm>({
    defaultValues: { title: '', summary: '', content: '', category_id: '', tags: '' },
  });

  const categoryId = watch('category_id');

  const onSubmit = async (values: EditorForm) => {
    const result = await createArticle.mutateAsync({
      category_id: values.category_id,
      title: values.title,
      summary: values.summary,
      content: values.content,
      tags: values.tags.split(',').map((t) => t.trim()).filter(Boolean),
      status: 'DRAFT',
    });
    const articleId = (result.data as { article: { id: string } }).article.id;
    navigate(`/app/articles/${articleId}`);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-3xl">
      <PageHeader
        title="Article Editor"
        description="Create a new knowledge base article draft."
        className="enterprise-panel mb-0"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="enterprise-panel space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register('title', { required: true })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="summary">Summary</Label>
          <Input id="summary" {...register('summary')} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content</Label>
          <Textarea id="content" rows={12} {...register('content', { required: true })} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={categoryId} onValueChange={(v) => setValue('category_id', v)}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input id="tags" placeholder="vpn, password, faq" {...register('tags')} />
        </div>

        <Button type="submit" disabled={createArticle.isPending}>
          {createArticle.isPending ? 'Saving…' : 'Save Draft'}
        </Button>
      </form>
    </div>
  );
}
