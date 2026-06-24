import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"
import { CardHeader, CardTitle, CardDescription, CardContent } from "./card"

export interface EnterpriseCardProps extends Omit<HTMLMotionProps<"div">, "title"> {
  title?: React.ReactNode
  description?: React.ReactNode
  headerActions?: React.ReactNode
  variant?: "default" | "teal" | "glass"
}

export const EnterpriseCard = React.forwardRef<HTMLDivElement, EnterpriseCardProps>(
  ({ children, className, title, description, headerActions, variant = "default", ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: [0.2, 0, 0, 1] }}
        className={cn(
          "enterprise-card group/card relative overflow-hidden font-sans rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-950",
          variant === "teal" && "glass-panel-teal border-teal-500/20 bg-teal-500/5",
          variant === "glass" && "bg-white/5 backdrop-blur-3xl border-white/10",
          className
        )}
        {...props}
      >
        {/* Intelligent Shine Effect */}
        <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/[0.05] to-transparent skew-x-[-25deg] group-hover/card:left-[150%] transition-all duration-1000 ease-in-out pointer-events-none" />

        {(title || description || headerActions) && (
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-8 pb-4 relative z-10 bg-transparent border-none">
            <div className="space-y-1">
              {title && (
                <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400 group-hover/card:text-teal-400 transition-colors">
                  {title}
                </CardTitle>
              )}
              {description && (
                <CardDescription className="text-xs text-slate-400 dark:text-slate-300 font-bold leading-relaxed">
                  {description}
                </CardDescription>
              )}
            </div>
            {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
          </CardHeader>
        )}
        <CardContent className="p-8 pt-4 relative z-10 bg-transparent">{children}</CardContent>
      </motion.div>
    )
  }
)

EnterpriseCard.displayName = "EnterpriseCard"
