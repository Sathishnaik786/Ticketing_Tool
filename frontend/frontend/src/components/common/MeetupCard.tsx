import React from "react";
import { CalendarDays, Clock, Users, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type MeetupStatus = "APPROVED" | "PENDING" | "REJECTED" | "CANCELLED";
export type MeetupPlatform = "TEAMS" | "GOOGLE_MEET";

export interface Meetup {
  id: string;
  title: string;
  type: "STANDUP" | "TRAINING" | "ONE_ON_ONE" | "PLANNING" | string;
  date: string; // formatted date string
  timeRange: string; // formatted time range
  platform: MeetupPlatform;
  status: MeetupStatus;
  host?: string;
  description?: string;
}

interface MeetupCardProps {
  meetup: Meetup;
  onJoin?: (meetup: Meetup) => void;
}

export const MeetupCard: React.FC<MeetupCardProps> = ({ meetup, onJoin }) => {
  const platformVariant: BadgeProps["variant"] = meetup.platform === "TEAMS" ? "primary" : "secondary";
  const statusVariant: BadgeProps["variant"] = meetup.status === "APPROVED" ? "success" :
    meetup.status === "PENDING" ? "warning" : "destructive";

  return (
    <Card className="flex h-full flex-col border border-white/10 bg-card/60 backdrop-blur-md shadow-premium hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden group">
      <div className={cn(
        "h-1.5 w-full",
        meetup.platform === "TEAMS" ? "bg-indigo-500" : "bg-emerald-500"
      )} />

      <CardHeader className="pb-3 pt-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-1">
            <CardTitle className="truncate text-lg font-heading font-extrabold tracking-tight text-foreground">
              {meetup.title}
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="uppercase tracking-[0.1em] text-[9px] font-semibold bg-secondary/50 border-white/5">
                {meetup.type}
              </Badge>
              <Badge variant={statusVariant} className="text-[9px] font-medium uppercase tracking-wider">
                {meetup.status}
              </Badge>
            </div>
          </div>

          <div className="flex-shrink-0">
            {meetup.platform === 'GOOGLE_MEET' ? (
              <div className="p-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-inner">
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Google_Meet_text_logo_%282020%29.svg/1024px-Google_Meet_text_logo_%282020%29.svg.png"
                  alt="Google Meet"
                  className="h-4 w-auto object-contain"
                />
              </div>
            ) : (
              <div className="p-2 bg-indigo-500/10 rounded-xl border border-indigo-500/20 shadow-inner">
                <img
                  src="https://logos-world.net/wp-content/uploads/2021/04/Microsoft-Teams-Emblem.png"
                  alt="Microsoft Teams"
                  className="h-4 w-auto object-contain"
                />
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 pt-2">
        <div className="space-y-3 bg-secondary/20 p-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
            <CalendarDays className="h-4 w-4 text-primary/60" />
            <span className="tabular-nums">{meetup.date}</span>
          </div>
          <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
            <Clock className="h-4 w-4 text-primary/60" />
            <span className="tabular-nums">{meetup.timeRange}</span>
          </div>
          {meetup.host && (
            <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
              <Users className="h-4 w-4 text-primary/60" />
              <span className="truncate">Host: {meetup.host}</span>
            </div>
          )}
        </div>

        {meetup.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground/80 font-medium leading-relaxed px-1">
            {meetup.description}
          </p>
        )}

        <div className="mt-auto pt-2 flex items-center justify-end">
          <Button
            size="sm"
            variant={meetup.status === "APPROVED" ? "premium" : "outline"}
            className="px-6 rounded-xl font-semibold transition-all hover:scale-105"
            onClick={() => {
              console.log('Join button clicked in MeetupCard', meetup);
              onJoin?.(meetup);
            }}
            disabled={meetup.status !== "APPROVED"}
          >
            {meetup.status === "APPROVED" ? "Join Meet" : "Unavailable"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};



