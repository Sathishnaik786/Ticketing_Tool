import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-[9px] font-black transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 tabular-nums uppercase tracking-[0.2em] shadow-sm",
  {
    variants: {
      variant: {
        default: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
        primary: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
        secondary: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20",
        success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
        warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
        destructive: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
        outline: "border-border text-foreground bg-transparent hover:bg-muted/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> { }

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
