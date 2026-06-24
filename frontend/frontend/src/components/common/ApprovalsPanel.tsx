import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, UserCircle2 } from "lucide-react";

export interface PendingMeetup {
  id: string;
  title: string;
  requestedBy: string;
  dateLabel: string;
  timeLabel: string;
}

interface ApprovalsPanelProps {
  items: PendingMeetup[];
  isLoading?: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const ApprovalsPanel: React.FC<ApprovalsPanelProps> = ({
  items,
  isLoading,
  onApprove,
  onReject,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 bg-white/60 p-4 text-sm text-gray-500">
        Loading pending meet-up requests...
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-lg border border-dashed border-gray-200 bg-white/60 p-4 text-sm text-gray-500">
        No pending meet-up requests right now.
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Pending meet-up approvals</h3>
        <Badge variant="warning" className="text-[11px]">
          {items.length} pending
        </Badge>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-col gap-2 rounded-md border border-gray-100 bg-gray-50/60 p-3 transition-colors hover:bg-gray-50"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-gray-900">{item.title}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
              <span className="inline-flex items-center gap-1">
                <UserCircle2 className="h-3.5 w-3.5" />
                {item.requestedBy}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {item.dateLabel}
              </span>
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {item.timeLabel}
              </span>
            </div>
            <div className="mt-1 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-300"
                onClick={() => onReject(item.id)}
              >
                Reject
              </Button>
              <Button
                size="sm"
                className="px-3"
                onClick={() => onApprove(item.id)}
              >
                Approve
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


