import React, { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import type { EventClickArg, EventContentArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EventDetailsModal, CalendarEventDetails } from "@/components/modals/EventDetailsModal";
import { calendarApi, type CalendarEventApiModel } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

type CalendarView = "dayGridMonth" | "timeGridWeek" | "timeGridDay";

export default function CalendarPage() {
  const calendarRef = useRef<FullCalendar | null>(null);
  const isMobile = useIsMobile();
  const [currentView, setCurrentView] = useState<CalendarView>(
    window.innerWidth < 768 ? "timeGridDay" : "dayGridMonth",
  );
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventDetails | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [events, setEvents] = useState<CalendarEventApiModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await calendarApi.getEvents();
        setEvents(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load calendar events", err);
        setError(err instanceof Error ? err.message : "Unable to load calendar events right now.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleToday = () => {
    const api = calendarRef.current?.getApi();
    api?.today();
  };

  const handleViewChange = (view: CalendarView) => {
    setCurrentView(view);
    const api = calendarRef.current?.getApi();
    api?.changeView(view);
  };

  const handleEventClick = (arg: EventClickArg) => {
    const found = events.find((e) => e.id === arg.event.id);
    if (!found) return;

    const start = new Date(found.start_time);
    const end = new Date(found.end_time);

    const details: CalendarEventDetails = {
      id: found.id,
      title: found.title,
      description: found.description,
      start,
      end,
      platform: found.platform,
      status: found.status === "APPROVED" || found.status === "PENDING" ? found.status : undefined,
      meetingLink: found.meet_link,
    };

    setSelectedEvent(details);
    setModalOpen(true);
  };

  const renderEventContent = (eventContent: EventContentArg) => {
    const { timeText, event } = eventContent;
    // Extract platform from event extendedProps if available
    const platform = event.extendedProps?.platform;
    
    return (
      <div className="flex flex-col rounded-md border border-gray-200 bg-white px-2 py-1 shadow-sm min-h-10">
        {timeText && (
          <span className="text-[11px] font-medium text-gray-500">{timeText}</span>
        )}
        <div className="flex items-center gap-1">
          {platform === 'GOOGLE_MEET' && (
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Google_Meet_text_logo_%282020%29.svg/1024px-Google_Meet_text_logo_%282020%29.svg.png" 
              alt="Google Meet" 
              className="h-3 w-3 object-contain"
            />
          )}
          {platform === 'TEAMS' && (
            <img 
              src="https://www.liblogo.com/img-logo/mi462m3e6-microsoft-teams-logo-microsoft-teams-logo-png-and-vector-logo-download.png" 
              alt="Microsoft Teams" 
              className="h-3 w-3 object-contain"
            />
          )}
          <span className="truncate text-xs font-semibold text-gray-900">
            {event.title}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 overflow-hidden">
      <PageHeader title="Calendar" description="View your upcoming meetings and events." />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="min-h-9 min-w-20" onClick={handleToday}>
            Today
          </Button>
        </div>
        <div className="flex justify-center md:justify-end">
          <div className="inline-flex overflow-hidden rounded-md border bg-white shadow-sm min-w-max">
            <Button
              variant={currentView === "dayGridMonth" ? "default" : "ghost"}
              size="sm"
              className="rounded-none px-3 min-h-9 min-w-16"
              onClick={() => handleViewChange("dayGridMonth")}
            >
              <span className="hidden sm:inline">Month</span>
              <span className="sm:hidden">M</span>
            </Button>
            <Button
              variant={currentView === "timeGridWeek" ? "default" : "ghost"}
              size="sm"
              className="rounded-none border-l px-3 min-h-9 min-w-16"
              onClick={() => handleViewChange("timeGridWeek")}
            >
              <span className="hidden sm:inline">Week</span>
              <span className="sm:hidden">W</span>
            </Button>
            <Button
              variant={currentView === "timeGridDay" ? "default" : "ghost"}
              size="sm"
              className="rounded-none border-l px-3 min-h-9 min-w-16"
              onClick={() => handleViewChange("timeGridDay")}
            >
              <span className="hidden sm:inline">Day</span>
              <span className="sm:hidden">D</span>
            </Button>
          </div>
        </div>
      </div>

      <Card className="border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md overflow-hidden">
        <CardContent className="p-0 overflow-hidden">
          <div className="p-4">
            {loading ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-80 w-full" />
              </div>
            ) : error ? (
              <div className="rounded-md border border-dashed border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            ) : events.length === 0 ? (
              <div className="rounded-md border border-dashed border-gray-200 bg-white/60 p-6 text-center text-sm text-gray-500">
                <div className="mx-auto mb-3 h-12 w-12 text-gray-400">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-full w-full">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                No calendar events yet. Approved meet-ups will appear here automatically.
              </div>
            ) : (
              <div className="-mx-4 overflow-x-auto pb-4 md:mx-0 md:pb-0">
                <div className="min-w-[300px] px-4 md:px-0">
                  <FullCalendar
                    ref={calendarRef}
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView={currentView}
                    headerToolbar={false}
                    height="auto"
                    events={events.map((e) => ({
                      id: e.id,
                      title: e.title,
                      start: e.start_time,
                      end: e.end_time,
                      extendedProps: {
                        platform: e.platform,
                      }
                    }))}
                    eventClick={handleEventClick}
                    dayMaxEvents={3}
                    eventContent={renderEventContent}
                    eventClassNames="!border-none !bg-transparent !p-0"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <EventDetailsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        event={selectedEvent}
      />
    </div>
  );
}



