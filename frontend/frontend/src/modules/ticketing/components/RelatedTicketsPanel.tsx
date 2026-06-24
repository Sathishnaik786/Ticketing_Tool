import * as React from 'react';
import { Link } from 'react-router-dom';
import { Link2, Plus, AlertCircle, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface Relation {
  ticketNumber: string;
  type: 'parent' | 'child' | 'duplicate' | 'blocked_by' | 'blocks';
}

interface RelatedTicketsPanelProps {
  ticketId: string;
}

export function RelatedTicketsPanel({ ticketId }: RelatedTicketsPanelProps) {
  const [relations, setRelations] = React.useState<Relation[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [targetNumber, setTargetNumber] = React.useState('');
  const [relationType, setRelationType] = React.useState<'parent' | 'child' | 'duplicate' | 'blocked_by' | 'blocks'>('child');

  React.useEffect(() => {
    // Load relations from localStorage for demo persistence
    const key = `ticketra_relations_${ticketId}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      setRelations(JSON.parse(stored));
    } else {
      // Mock initial data based on ticketId for premium realism
      const initial: Relation[] = [
        { ticketNumber: 'TKT-1040', type: 'parent' },
        { ticketNumber: 'TKT-1045', type: 'blocked_by' },
      ];
      setRelations(initial);
      localStorage.setItem(key, JSON.stringify(initial));
    }
  }, [ticketId]);

  const handleAddRelation = () => {
    if (!targetNumber.trim()) return;
    const num = targetNumber.toUpperCase().trim();
    if (!num.startsWith('TKT-')) {
      toast.error('Ticket number must follow format TKT-XXXX');
      return;
    }

    const nextRelations = [...relations, { ticketNumber: num, type: relationType }];
    setRelations(nextRelations);
    localStorage.setItem(`ticketra_relations_${ticketId}`, JSON.stringify(nextRelations));
    setTargetNumber('');
    setIsOpen(false);
    toast.success(`Relation linked: this ticket ${relationType.replace('_', ' ')} ${num}`);
  };

  const getRelationBadgeColor = (type: string) => {
    switch (type) {
      case 'parent':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'blocked_by':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'blocks':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <div className="flex justify-between items-center pb-2 border-b border-border">
        <h3 className="font-semibold text-sm flex items-center gap-1.5">
          <Link2 className="h-4 w-4 text-primary" />
          Linked Tickets
        </h3>
        <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)} className="h-7 w-7 p-0" title="Add ticket relation">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {relations.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">No linked tickets. Click + to add relations.</p>
      ) : (
        <div className="space-y-2">
          {relations.map((rel, idx) => (
            <div key={idx} className="flex justify-between items-center bg-muted/20 p-2 rounded-lg border border-border/50 text-xs">
              <div className="flex items-center gap-1.5 min-w-0">
                <Badge className={`text-[10px] py-0 px-1 border capitalize ${getRelationBadgeColor(rel.type)}`}>
                  {rel.type.replace('_', ' ')}
                </Badge>
                <span className="font-mono font-semibold text-primary">{rel.ticketNumber}</span>
              </div>
              <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 cursor-pointer hover:underline">
                View <ExternalLink className="h-2.5 w-2.5" />
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Add relation modal */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Ticket Relation</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Relation Type</label>
              <Select value={relationType} onValueChange={(val: any) => setRelationType(val)}>
                <SelectTrigger>
                  <SelectValue placeholder="Relation type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="parent">Is child of (Parent)</SelectItem>
                  <SelectItem value="child">Is parent of (Child)</SelectItem>
                  <SelectItem value="duplicate">Is duplicate of</SelectItem>
                  <SelectItem value="blocked_by">Is blocked by</SelectItem>
                  <SelectItem value="blocks">Blocks</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase">Ticket Number</label>
              <Input
                placeholder="e.g. TKT-1041"
                value={targetNumber}
                onChange={(e) => setTargetNumber(e.target.value)}
                aria-label="Ticket number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddRelation} disabled={!targetNumber.trim()}>
              Link Ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
