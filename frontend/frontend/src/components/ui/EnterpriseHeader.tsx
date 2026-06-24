import * as React from "react"
import { cn } from "@/lib/utils"

export interface EnterpriseHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: string
  badge?: string
  actions?: React.ReactNode
  isCinematic?: boolean
}

export const EnterpriseHeader = React.forwardRef<HTMLDivElement, EnterpriseHeaderProps>(
  ({ className, title, description, badge, actions, isCinematic = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex flex-col md:flex-row md:items-end justify-between gap-10 mb-20 font-sans", className)}
        {...props}
      >
        <div className="space-y-6">
          {badge && (
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-2xl bg-teal-500/10 text-teal-400 text-[10px] font-black uppercase tracking-[0.4em] border border-teal-500/20 shadow-sm shadow-teal-500/10">
              <div className="h-1.5 w-1.5 rounded-full bg-teal-500 animate-pulse" />
              {badge}
            </div>
          )}
          <div className="space-y-2">
            <h1
              className={cn(
                "font-display font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-[0.85]",
                isCinematic ? "enterprise-heading" : "text-7xl"
              )}
            >
              {isCinematic ? <span className="text-gradient-teal">{title}</span> : title}
            </h1>
            {description && (
              <p className="text-slate-600 dark:text-slate-400 font-bold max-w-2xl text-xl tracking-tight leading-relaxed">
                {description}
              </p>
            )}
          </div>
        </div>
        {actions && <div className="flex items-center gap-4 pt-6 md:pt-0">{actions}</div>}
      </div>
    )
  }
)

EnterpriseHeader.displayName = "EnterpriseHeader"
