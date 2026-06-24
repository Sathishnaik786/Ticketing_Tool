import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function FloatingCreateTicket() {
  const navigate = useNavigate();

  return (
    <Button
      onClick={() => navigate('/app/tickets/new')}
      className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/20 hover:scale-105 transition-transform flex items-center justify-center border border-blue-500/10 md:h-auto md:w-auto md:px-4 md:py-2 md:rounded-2xl gap-2"
      aria-label="Create new service desk ticket"
    >
      <Plus className="h-5 w-5 shrink-0" />
      <span className="hidden md:inline text-xs font-black uppercase tracking-wider">
        New Ticket
      </span>
    </Button>
  );
}
export default FloatingCreateTicket;
