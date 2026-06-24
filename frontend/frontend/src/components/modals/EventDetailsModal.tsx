import React from "react";
import { CalendarDays, Clock, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, type BadgeProps } from "@/components/ui/badge";

export interface CalendarEventDetails {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  platform?: "TEAMS" | "GOOGLE_MEET";
  status?: "APPROVED" | "PENDING";
  meetingLink?: string;
}

interface EventDetailsModalProps {
  open: boolean;
  onClose: () => void;
  event?: CalendarEventDetails | null;
}

export const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  open,
  onClose,
  event,
}) => {
  if (!open || !event) return null;

  const formattedDate = event.start.toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const formattedTime = `${event.start.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })} - ${event.end.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  const platformVariant: BadgeProps["variant"] | undefined =
    event.platform === "TEAMS"
      ? "primary"
      : event.platform === "GOOGLE_MEET"
      ? "secondary"
      : undefined;

  const statusVariant: BadgeProps["variant"] | undefined =
    event.status === "APPROVED"
      ? "success"
      : event.status === "PENDING"
      ? "warning"
      : undefined;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 w-full max-w-lg rounded-xl bg-white shadow-lg">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{event.title}</h2>
            {event.platform && (
              <div className="mt-2 flex items-center gap-2 text-xs">
                <div className="flex items-center gap-1">
                  {event.platform === 'GOOGLE_MEET' ? (
                    <>
                      <img 
                        src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Google_Meet_text_logo_%282020%29.svg/1024px-Google_Meet_text_logo_%282020%29.svg.png" 
                        alt="Google Meet" 
                        className="h-4 w-4 object-contain"
                      />
                      <span className="uppercase text-[10px]">Google Meet</span>
                    </>
                  ) : (
                    <>
                      <img 
                        src="https://www.liblogo.com/img-logo/mi462m3e6-microsoft-teams-logo-microsoft-teams-logo-png-and-vector-logo-download.png" 
                        alt="Microsoft Teams" 
                        className="h-4 w-4 object-contain"
                      />
                      <span className="uppercase text-[10px]">Teams</span>
                    </>
                  )}
                </div>
                {statusVariant && (
                  <Badge variant={statusVariant}>
                    {event.status === "APPROVED" ? "Approved" : "Pending"}
                  </Badge>
                )}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-sm text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          {event.description && (
            <p className="text-sm text-gray-700">{event.description}</p>
          )}

          <div className="space-y-2 rounded-lg bg-gray-50 px-4 py-3">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CalendarDays className="h-4 w-4 text-gray-500" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>{formattedTime}</span>
            </div>
          </div>

          {event.meetingLink && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Video className="h-4 w-4" />
              <span className="truncate">{event.meetingLink}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-gray-100 px-6 py-4">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button size="sm" disabled>
            Join Meeting
          </Button>
        </div>
      </div>
    </div>
  );
};



