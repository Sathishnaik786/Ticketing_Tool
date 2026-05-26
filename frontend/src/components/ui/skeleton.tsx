import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-skeleton-shimmer rounded-xl bg-muted/40", className)} {...props} />;
}

export { Skeleton };
