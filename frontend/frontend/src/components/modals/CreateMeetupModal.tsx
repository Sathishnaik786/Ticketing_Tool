import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  Layout,
  Type,
  AlignLeft,
  Link as LinkIcon,
  Sparkles,
  Search
} from "lucide-react";
import { cn } from "@/lib/utils";

export type MeetupFormMode = "create" | "request";

export interface MeetupFormValues {
  title: string;
  description: string;
  type: string;
  platform: "TEAMS" | "GOOGLE_MEET";
  link: string;
  date: Date;
  startTime: string;
  endTime: string;
}

interface CreateMeetupModalProps {
  open: boolean;
  mode: MeetupFormMode;
  onClose: () => void;
  onSubmit: (values: MeetupFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
}

const defaultValues: MeetupFormValues = {
  title: "",
  description: "",
  type: "STANDUP",
  platform: "TEAMS",
  link: "",
  date: new Date(),
  startTime: "10:00",
  endTime: "10:30",
};

export const CreateMeetupModal: React.FC<CreateMeetupModalProps> = ({
  open,
  mode,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const [values, setValues] = useState<MeetupFormValues>(defaultValues);

  const handleChange = <K extends keyof MeetupFormValues>(field: K, value: MeetupFormValues[K]) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(values);
  };

  const titleLabel = mode === "create" ? "Create Meet" : "Request Meet";
  const descriptionLabel =
    mode === "create"
      ? "Set up a new team meet-up for your organization."
      : "Request a new meet-up for your team or manager to review.";

  return (
    <Dialog open={open} onOpenChange={(open) => !isSubmitting && !open && onClose()}>
      <DialogContent className="max-w-full sm:max-w-2xl max-h-[95vh] overflow-y-auto sm:rounded-[2rem] p-0 border border-white/10 bg-card/60 backdrop-blur-3xl shadow-premium animate-in zoom-in-95">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-600 via-primary to-emerald-500" />

        <DialogHeader className="p-6 sm:p-8 pb-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            </div>
            <DialogTitle className="text-2xl font-heading font-extrabold tracking-tight">
              {titleLabel}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm font-medium text-muted-foreground leading-relaxed">
            {descriptionLabel}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 pt-0 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                <Type className="h-3 w-3" /> Meeting Title
              </label>
              <Input
                value={values.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="e.g. Sprint Planning, Weekly Standup"
                required
                className="h-12 bg-background/50 border-white/10 focus:ring-primary rounded-xl font-medium"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                <AlignLeft className="h-3 w-3" /> Context & Agenda
              </label>
              <Textarea
                value={values.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="What is this meet-up about?"
                rows={3}
                className="bg-background/50 border-white/10 focus:ring-primary rounded-xl font-medium resize-none"
              />
            </div>
          </div>

          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                <Layout className="h-3 w-3" /> Category
              </label>
              <Select
                value={values.type}
                onValueChange={(v) => handleChange("type", v)}
              >
                <SelectTrigger className="h-12 bg-background/50 border-white/10 rounded-xl font-medium">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-white/10">
                  <SelectItem value="STANDUP">Standup</SelectItem>
                  <SelectItem value="TRAINING">Training</SelectItem>
                  <SelectItem value="ONE_ON_ONE">1:1</SelectItem>
                  <SelectItem value="PLANNING">Planning</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                <Video className="h-3 w-3" /> Platform
              </label>
              <Select
                value={values.platform}
                onValueChange={(v) =>
                  handleChange("platform", v as "TEAMS" | "GOOGLE_MEET")
                }
              >
                <SelectTrigger className="h-12 bg-background/50 border-white/10 rounded-xl font-medium">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-white/10">
                  <SelectItem value="TEAMS">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-indigo-500/10 rounded-md">
                        <img
                          src="https://www.liblogo.com/img-logo/mi462m3e6-microsoft-teams-logo-microsoft-teams-logo-png-and-vector-logo-download.png"
                          alt=""
                          className="h-3 w-3 object-contain"
                        />
                      </div>
                      <span className="font-medium">Microsoft Teams</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="GOOGLE_MEET">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-emerald-500/10 rounded-md">
                        <img
                          src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Google_Meet_text_logo_%282020%29.svg/1024px-Google_Meet_text_logo_%282020%29.svg.png"
                          alt=""
                          className="h-3 w-3 object-contain"
                        />
                      </div>
                      <span className="font-medium">Google Meet</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
              <LinkIcon className="h-3 w-3" /> Access Link
            </label>
            <Input
              value={values.link}
              onChange={(e) => handleChange("link", e.target.value)}
              placeholder="Paste your digital meeting link here"
              className="h-12 bg-background/50 border-white/10 focus:ring-primary rounded-xl font-medium"
            />
          </div>

          <div className="grid gap-8 grid-cols-1 lg:grid-cols-[1fr_auto_1fr] items-start p-6 bg-secondary/20 rounded-[2rem] border border-white/5">
            <div className="space-y-3">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                <CalendarIcon className="h-3 w-3" /> Select Day
              </label>
              <div className="flex justify-center sm:justify-start">
                <div className="bg-background/80 backdrop-blur-md rounded-2xl border border-white/10 p-2 shadow-inner inline-block">
                  <Calendar
                    mode="single"
                    selected={values.date}
                    onSelect={(date) => date && handleChange("date", date)}
                    className="p-0"
                  />
                </div>
              </div>
            </div>

            <div className="hidden lg:block w-px h-full bg-border/20 self-stretch mx-2" />

            <div className="flex-1 space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[0.2em] flex items-center gap-2">
                  <Clock className="h-3 w-3" /> Timing Configuration
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-muted-foreground/60 uppercase">
                      From
                    </label>
                    <Input
                      type="time"
                      value={values.startTime}
                      onChange={(e) => handleChange("startTime", e.target.value)}
                      required
                      className="h-11 bg-background/50 border-white/10 rounded-xl font-semibold tabular-nums"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-muted-foreground/60 uppercase">
                      To
                    </label>
                    <Input
                      type="time"
                      value={values.endTime}
                      onChange={(e) => handleChange("endTime", e.target.value)}
                      required
                      className="h-11 bg-background/50 border-white/10 rounded-xl font-semibold tabular-nums"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-center gap-4 transition-all hover:bg-primary/10">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <CalendarIcon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-semibold text-primary uppercase tracking-wider mb-0.5">Summary</p>
                  <p className="text-sm font-bold text-foreground tabular-nums">
                    {format(values.date, "MMM dd, yyyy")}
                  </p>
                  <p className="text-xs font-medium text-muted-foreground tabular-nums mt-0.5">
                    {values.startTime} • {values.endTime}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outlinePremium"
              onClick={onClose}
              disabled={!!isSubmitting}
              className="h-12 px-8 rounded-2xl order-2 sm:order-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!!isSubmitting}
              variant="premium"
              className="h-12 px-10 rounded-2xl order-1 sm:order-2 shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95"
            >
              {isSubmitting ? "Processing..." : titleLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};


