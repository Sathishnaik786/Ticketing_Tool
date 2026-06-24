import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-bold ring-offset-background transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] select-none",
  {
    variants: {
      variant: {
        default: "liquid-capsule-active",
        premium: "bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-indigo-500/20 transition-all border-none shadow-[0_4px_12px_rgba(79,70,229,0.2)] dark:shadow-[0_4px_12px_rgba(79,70,229,0.5)]",
        destructive: "bg-red-500 text-white hover:bg-red-600 shadow-sm border border-red-400/50",
        outline: "liquid-capsule",
        outlinePremium: "liquid-capsule border-blue-500/30 hover:border-blue-500/60 text-blue-600 dark:text-blue-400",
        secondary: "liquid-capsule",
        glass: "liquid-surface border border-white/20",
        ghost: "liquid-capsule-hover",
        link: "text-primary underline-offset-4 hover:underline decoration-primary/30",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
