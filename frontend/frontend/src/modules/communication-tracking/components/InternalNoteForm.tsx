import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface InternalNoteFormProps {
  onSubmit: (values: { message: string; subject?: string }) => void;
  isSubmitting?: boolean;
}

export function InternalNoteForm({ onSubmit, isSubmitting }: InternalNoteFormProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ message, subject: subject || undefined });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Add internal note">
      <div className="space-y-2">
        <Label htmlFor="note-subject">Subject (optional)</Label>
        <Input id="note-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="note-message">Internal note</Label>
        <Textarea id="note-message" required value={message} onChange={(e) => setMessage(e.target.value)} rows={4} />
      </div>
      <Button type="submit" disabled={isSubmitting || !message.trim()}>
        {isSubmitting ? 'Saving…' : 'Add internal note'}
      </Button>
    </form>
  );
}
