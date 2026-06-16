import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { EmailStatus } from '../services/communicationTrackingService';

interface EmailLogFormProps {
  onSubmit: (values: {
    sender: string;
    recipient: string;
    cc?: string;
    subject: string;
    body: string;
    status: EmailStatus;
  }) => void;
  isSubmitting?: boolean;
}

export function EmailLogForm({ onSubmit, isSubmitting }: EmailLogFormProps) {
  const [sender, setSender] = useState('');
  const [recipient, setRecipient] = useState('');
  const [cc, setCc] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<EmailStatus>('SENT');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ sender, recipient, cc: cc || undefined, subject, body, status });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Log email">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="email-sender">Sender</Label>
          <Input id="email-sender" required value={sender} onChange={(e) => setSender(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email-recipient">Recipient</Label>
          <Input id="email-recipient" required value={recipient} onChange={(e) => setRecipient(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email-cc">CC</Label>
        <Input id="email-cc" value={cc} onChange={(e) => setCc(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email-subject">Subject</Label>
        <Input id="email-subject" required value={subject} onChange={(e) => setSubject(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email-status">Status</Label>
        <Select value={status} onValueChange={(v) => setStatus(v as EmailStatus)}>
          <SelectTrigger id="email-status"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="SENT">Sent</SelectItem>
            <SelectItem value="FAILED">Failed</SelectItem>
            <SelectItem value="RECEIVED">Received</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email-body">Body</Label>
        <Textarea id="email-body" required value={body} onChange={(e) => setBody(e.target.value)} rows={4} />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving…' : 'Log email'}
      </Button>
    </form>
  );
}
