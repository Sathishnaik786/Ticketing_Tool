import React, { useEffect, useState } from 'react';
import { apiCall } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, CheckCircle2, ClipboardCheck, Loader2, MessageSquare, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ApprovalAssignment {
  id: string;
  ticket_id: string;
  assigned_role: string | null;
  assigned_user_id: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ESCALATED';
  escalates_at: string;
  created_at: string;
}

export default function ApprovalsDashboardPage() {
  const [assignments, setAssignments] = useState<ApprovalAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const fetchPendingApprovals = async () => {
    try {
      const res = await apiCall('/v1/esm/approvals/pending', 'GET');
      if (res.success && res.data) {
        setAssignments(res.data);
      }
    } catch (err: any) {
      toast.error('Failed to load pending approvals: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const handleAction = async (assignmentId: string, action: 'APPROVED' | 'REJECTED') => {
    setSubmittingId(assignmentId);
    try {
      const res = await apiCall('/v1/esm/approvals/action', 'POST', {
        assignment_id: assignmentId,
        action,
        comments: comments[assignmentId] || ''
      });

      if (res.success) {
        toast.success(`Approval request successfully ${action.toLowerCase()}!`);
        // Remove from list
        setAssignments(prev => prev.filter(item => item.id !== assignmentId));
      } else {
        toast.error(res.message || 'Action failed');
      }
    } catch (err: any) {
      toast.error('Action failed: ' + err.message);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleCommentChange = (id: string, text: string) => {
    setComments(prev => ({
      ...prev,
      [id]: text
    }));
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 min-h-screen">
      {/* Header */}
      <div className="border-b border-border/40 pb-6">
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
          ESM Decision Portal
        </h1>
        <p className="text-muted-foreground text-lg mt-2">
          Review pending operational service request approval assignments.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <span className="text-muted-foreground text-sm font-medium">Loading your pending approvals...</span>
        </div>
      ) : assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed rounded-3xl p-8 bg-accent/5 max-w-2xl mx-auto">
          <CheckCircle className="h-12 w-12 text-green-500 animate-pulse" />
          <h3 className="mt-4 text-lg font-semibold">You're all caught up!</h3>
          <p className="text-muted-foreground text-sm max-w-xs mt-2">
            No pending approvals require your action at this time.
          </p>
        </div>
      ) : (
        <div className="space-y-6 max-w-3xl mx-auto">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground px-1">
            Pending Actions ({assignments.length})
          </h3>
          
          <div className="space-y-6">
            <AnimatePresence>
              {assignments.map((assignment) => (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm space-y-6"
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border/20 pb-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <ClipboardCheck className="h-5 w-5 text-primary" />
                        <span className="text-sm font-bold">Approval ID:</span>
                        <span className="font-mono text-xs text-muted-foreground">{assignment.id}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Assigned Role: <span className="font-bold text-foreground">{assignment.assigned_role || 'Personal'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-medium text-amber-500 bg-amber-500/10 px-2.5 py-1 rounded-full">
                      <AlertCircle className="h-3 w-3" />
                      <span>Escalates: {new Date(assignment.escalates_at).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-2">
                      <div className="font-semibold text-muted-foreground">Ticket ID References</div>
                      <div className="font-mono text-xs bg-accent/40 p-2.5 rounded-xl border border-border/40 max-w-[280px] truncate">
                        {assignment.ticket_id}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="font-semibold text-muted-foreground">Assigned Date</div>
                      <div className="text-foreground">
                        {new Date(assignment.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Comment Input */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Review Comments (Optional)</span>
                    </label>
                    <textarea
                      placeholder="Add reasoning for approval or rejection..."
                      value={comments[assignment.id] || ''}
                      onChange={(e) => handleCommentChange(assignment.id, e.target.value)}
                      className="w-full px-4 py-2 bg-background border border-input rounded-xl text-sm h-16 resize-none focus:ring-2 focus:ring-primary/40 focus:outline-none transition-all"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4">
                    <button
                      onClick={() => handleAction(assignment.id, 'APPROVED')}
                      disabled={submittingId !== null}
                      className="flex-1 py-2.5 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 shadow-lg shadow-green-600/15 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      {submittingId === assignment.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          <span>Approve Step</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleAction(assignment.id, 'REJECTED')}
                      disabled={submittingId !== null}
                      className="flex-1 py-2.5 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 shadow-lg shadow-red-600/15 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      {submittingId === assignment.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="h-4 w-4" />
                          <span>Reject Step</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
