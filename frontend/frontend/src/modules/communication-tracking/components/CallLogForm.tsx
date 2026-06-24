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
import type { CallOutcome } from '../services/communicationTrackingService';

interface CallLogFormProps {
  onSubmit: (values: {
    customer_name?: string;
    phone_number?: string;
    call_start_at: string;
    call_end_at?: string;
    call_summary?: string;
    outcome: CallOutcome;
  }) => void;
  isSubmitting?: boolean;
}

export function CallLogForm({ onSubmit, isSubmitting }: CallLogFormProps) {
  const [customerName, setCustomerName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [callStart, setCallStart] = useState('');
  const [callEnd, setCallEnd] = useState('');
  const [summary, setSummary] = useState('');
  const [outcome, setOutcome] = useState<CallOutcome>('CONNECTED');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      customer_name: customerName || undefined,
      phone_number: phoneNumber || undefined,
      call_start_at: new Date(callStart).toISOString(),
      call_end_at: callEnd ? new Date(callEnd).toISOString() : undefined,
      call_summary: summary || undefined,
      outcome,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" aria-label="Log phone call">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="customer-name">Customer name</Label>
          <Input id="customer-name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone-number">Phone number</Label>
          <Input id="phone-number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="call-start">Call start</Label>
          <Input id="call-start" type="datetime-local" required value={callStart} onChange={(e) => setCallStart(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="call-end">Call end</Label>
          <Input id="call-end" type="datetime-local" value={callEnd} onChange={(e) => setCallEnd(e.target.value)} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="outcome">Outcome</Label>
        <Select value={outcome} onValueChange={(v) => setOutcome(v as CallOutcome)}>
          <SelectTrigger id="outcome"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="NO_ANSWER">No answer</SelectItem>
            <SelectItem value="CONNECTED">Connected</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="FOLLOWUP_REQUIRED">Follow-up required</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="call-summary">Summary</Label>
        <Textarea id="call-summary" value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} />
      </div>
      <Button type="submit" disabled={isSubmitting || !callStart}>
        {isSubmitting ? 'Saving…' : 'Log call'}
      </Button>
    </form>
  );
}
