import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isTicketingEnabled } from '@/config/features';

export function QuickCreateTicketButton() {
  if (!isTicketingEnabled) return null;

  return (
    <Button asChild size="sm" className="hidden sm:inline-flex gap-1.5 rounded-xl h-9">
      <Link to="/app/tickets/new">
        <Plus className="h-4 w-4" aria-hidden />
        Create Ticket
      </Link>
    </Button>
  );
}
