import * as React from 'react';
import { Sparkles, Send, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ComponentErrorBoundary } from '@/components/common/ComponentErrorBoundary';

export interface AiAssistPanelProps {
  ticketTitle: string;
  ticketDescription: string;
  onApplyResponse: (text: string) => void;
}

export function AiAssistPanel({ ticketTitle, ticketDescription, onApplyResponse }: AiAssistPanelProps) {
  // Generate a mock summary and sentiment based on keywords
  const summary = React.useMemo(() => {
    const text = ticketDescription.toLowerCase();
    if (text.includes('access') || text.includes('permission')) {
      return 'Requesting credential updates or system permissions clearance.';
    }
    if (text.includes('screen') || text.includes('hardware') || text.includes('monitor')) {
      return 'Operational hardware provisioning request.';
    }
    if (text.includes('slow') || text.includes('crash') || text.includes('error')) {
      return 'Technical debugging and system performance troubleshooting.';
    }
    return 'General service desk support inquiry.';
  }, [ticketDescription]);

  const sentiment = React.useMemo(() => {
    const text = (ticketTitle + ' ' + ticketDescription).toLowerCase();
    if (text.includes('urgent') || text.includes('broken') || text.includes('fail') || text.includes('angry')) {
      return { score: 'NEGATIVE (Frustrated)', color: 'text-rose-500 bg-rose-500/10' };
    }
    if (text.includes('please') || text.includes('thanks') || text.includes('appreciate')) {
      return { score: 'POSITIVE (Polite)', color: 'text-emerald-500 bg-emerald-500/10' };
    }
    return { score: 'NEUTRAL (Standard)', color: 'text-blue-500 bg-blue-500/10' };
  }, [ticketTitle, ticketDescription]);

  // Suggested responses
  const suggestions = React.useMemo(() => {
    const titleLower = ticketTitle.toLowerCase();
    if (titleLower.includes('access') || titleLower.includes('license')) {
      return [
        'Hi, I have reviewed your system access request and initiated the credential provisioning. You will receive an email shortly.',
        'Hello, to authorize this system license, please submit approvals from your direct supervisor.'
      ];
    }
    return [
      'Hello, thank you for contacting the service desk. We are actively reviewing your request and will follow up with an update soon.',
      'Hi there, could you please provide additional details or system logs to help us diagnose the issue?'
    ];
  }, [ticketTitle]);

  return (
    <ComponentErrorBoundary name="AI Co-Pilot Assist">
      <div className="rounded-2xl border border-blue-200/60 dark:border-blue-900/30 bg-blue-500/[0.02] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-[0.15em] text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
            <Sparkles className="h-4.5 w-4.5 text-blue-500 animate-pulse" />
            AI Co-Pilot Assist
          </h3>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sentiment.color}`}>
            {sentiment.score}
          </span>
        </div>

        {/* Summary */}
        <div className="space-y-1">
          <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500">Auto-Generated Summary</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">{summary}</p>
        </div>

        {/* Suggestions */}
        <div className="space-y-2 pt-2 border-t border-blue-500/10">
          <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-500">Suggested Smart Responses</h4>
          <div className="space-y-2">
            {suggestions.map((sug, i) => (
              <div key={i} className="p-3 bg-card border rounded-xl space-y-2 relative group hover:border-blue-500/20 transition-all">
                <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 pr-8">{sug}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onApplyResponse(sug);
                    toast.success('Suggested response applied to editor');
                  }}
                  className="absolute right-2 bottom-2 h-7 px-2 text-[10px] rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Send className="h-3 w-3 mr-1" />
                  Apply
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback ratings */}
        <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
          <span>Was this recommendation helpful?</span>
          <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-blue-500/5 rounded hover:text-primary"><ThumbsUp className="h-3.5 w-3.5" /></button>
            <button className="p-1 hover:bg-blue-500/5 rounded hover:text-rose-500"><ThumbsDown className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </div>
    </ComponentErrorBoundary>
  );
}
export default AiAssistPanel;

