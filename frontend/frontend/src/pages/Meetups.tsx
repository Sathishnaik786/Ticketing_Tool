import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Meetup, MeetupCard, type Meetup as MeetupType } from "@/components/common/MeetupCard";
import { CreateMeetupModal, MeetupFormValues, MeetupFormMode } from "@/components/modals/CreateMeetupModal";
import { ApprovalsPanel, PendingMeetup } from "@/components/common/ApprovalsPanel";
import { meetupsApi, type MeetupApiModel } from "@/services/api";
import { Skeleton } from "@/components/ui/skeleton";

export default function MeetupsPage() {
  const { user } = useAuth();
  const role = user?.role;

  const isAdminOrManager = role === "ADMIN" || role === "MANAGER";
  const primaryButtonLabel = isAdminOrManager ? "Create Meet" : "Request Meet";

  const [meetups, setMeetups] = useState<MeetupApiModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<MeetupFormMode>("request");
  const [submitting, setSubmitting] = useState(false);

  const loadMeetups = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await meetupsApi.getAll();
      setMeetups(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      console.error("Failed to load meetups", err);
      if (err instanceof Error) {
        setError(err.message || "Failed to load meet-ups");
      } else {
        setError("Failed to load meet-ups");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetups();
  }, []);

  const handleOpenModal = () => {
    setModalMode(isAdminOrManager ? "create" : "request");
    setModalOpen(true);
  };

  const handleSubmitMeetup = async (values: MeetupFormValues) => {
    try {
      setSubmitting(true);

      const payload = {
        title: values.title,
        description: values.description,
        type: values.type,
        platform: values.platform,
        link: values.link,
        date: values.date.toISOString(),
        startTime: values.startTime,
        endTime: values.endTime,
      };

      if (isAdminOrManager) {
        await meetupsApi.create(payload);
      } else {
        await meetupsApi.request(payload);
      }

      await loadMeetups();
      setModalOpen(false);
    } catch (err) {
      console.error("Failed to submit meetup", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await meetupsApi.approve(id, true);
      await loadMeetups();
    } catch (err) {
      console.error("Failed to approve meetup", err);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await meetupsApi.approve(id, false);
      await loadMeetups();
    } catch (err) {
      console.error("Failed to reject meetup", err);
    }
  };

  const handleJoinMeet = (originalMeetup: MeetupApiModel | undefined) => {
    if (!originalMeetup) {
      console.error('Original meetup not found');
      alert('Unable to join meet - meetup data not available');
      return;
    }
    console.log('Join Meet button clicked', originalMeetup);
    // Check for both possible field names that might come from the API
    const meetLink = originalMeetup.link || originalMeetup.meet_link;
    if (meetLink) {
      console.log('Opening meet link:', meetLink);
      // Open the meet link in a new tab
      window.open(meetLink, '_blank', 'noopener,noreferrer');
    } else {
      // If no link exists, show an error or notification
      console.error('No meet link available for this meetup', originalMeetup.id);
      alert('No meet link available for this meetup');
      // In a real app, you might want to show a toast notification here
    }
  };

  const approvedMeetups: Meetup[] = useMemo(
    () => {
      if (!Array.isArray(meetups)) return [];
      return meetups
        .filter((m) => m && m.status === "APPROVED")
        .map((m) => ({
          id: m.id,
          title: m.title,
          type: m.type,
          date: m.dateLabel || m.date || "",
          timeRange: m.timeLabel || `${m.startTime || ''} - ${m.endTime || ''}`,
          platform: m.platform,
          status: m.status,
          host: m.hostName,
          description: m.description,
        }));
    },
    [meetups],
  );

  const pendingMeetups: PendingMeetup[] = useMemo(
    () => {
      if (!Array.isArray(meetups)) return [];
      return meetups
        .filter((m) => m && m.status === "PENDING")
        .map((m) => ({
          id: m.id,
          title: m.title,
          requestedBy: m.requestedBy || m.requesterName || "Unknown",
          dateLabel:
            m.dateLabel ||
            (m.date ? format(new Date(m.date), "EEE, dd MMM yyyy") : ""),
          timeLabel: m.timeLabel || `${m.startTime || ''} - ${m.endTime || ''}`,
        }));
    },
    [meetups],
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="enterprise-panel flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <PageHeader
          title="Meet-ups"
          description="Coordinate and participate in upcoming organizational events & syncs."
          className="mb-0"
        />
        <div className="w-full lg:w-auto">
          <Button
            onClick={handleOpenModal}
            variant="premium"
            size="lg"
            className="w-full lg:px-10 rounded-2xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.03]"
            disabled={loading}
          >
            {loading ? "Initializing..." : primaryButtonLabel}
          </Button>
        </div>
      </div>

      {isAdminOrManager && (
        <ApprovalsPanel
          items={pendingMeetups}
          isLoading={loading}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      <div className="space-y-3">
        {loading && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, idx) => (
              <div
                key={idx}
                className="enterprise-card space-y-4"
              >
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-3/4 rounded-lg bg-muted/40" />
                  <Skeleton className="h-6 w-1/4 rounded-full bg-muted/30" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-1/2 bg-muted/20" />
                  <Skeleton className="h-4 w-1/3 bg-muted/20" />
                </div>
                <Skeleton className="h-10 w-full rounded-xl bg-muted/30 mt-4" />
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-dashed border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {!loading && !error && approvedMeetups.length === 0 && (
          <div className="enterprise-panel border-dashed border-primary/20 text-center py-20 flex flex-col items-center justify-center">
            <div className="mx-auto mb-6 h-20 w-20 rounded-3xl bg-primary/5 flex items-center justify-center text-primary/40">
              <CalendarIcon className="h-10 w-10" />
            </div>
            <h3 className="text-xl font-heading font-extrabold tracking-tight mb-2">No Active Meet-ups</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8 font-medium">
              Synchronize with your team by initiating a new event or requesting a slot.
            </p>
            <Button
              variant="outlinePremium"
              onClick={handleOpenModal}
              className="rounded-xl px-8"
            >
              {primaryButtonLabel}
            </Button>
          </div>
        )}

        {!loading && !error && approvedMeetups.length > 0 && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {approvedMeetups.map((meetup) => {
              const originalMeetup = meetups.find(m => m.id === meetup.id);
              return (
                <MeetupCard
                  key={meetup.id}
                  meetup={meetup}
                  onJoin={() => handleJoinMeet(originalMeetup)}
                />
              );
            })}
          </div>
        )}
      </div>

      <CreateMeetupModal
        open={modalOpen}
        mode={modalMode}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitMeetup}
        isSubmitting={submitting}
      />
    </div>
  );
}



