import * as React from "react";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const tableVariants = cva("w-full caption-bottom text-sm border-collapse", {
  variants: {
    density: {
      comfortable: "[&_td]:py-5 [&_th]:py-5",
      compact: "[&_td]:py-3 [&_th]:py-4",
      dense: "[&_td]:py-2 [&_th]:py-3",
    },
  },
  defaultVariants: {
    density: "comfortable",
  },
});

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement> & VariantProps<typeof tableVariants>
>(({ className, density, ...props }, ref) => (
  <div className="relative w-full overflow-auto scrollbar-premium rounded-[2rem] border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950/50 shadow-soft backdrop-blur-sm">
    <table
      ref={ref}
      className={cn(tableVariants({ density }), className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-xl sticky top-0 z-20 border-b border-slate-200 dark:border-white/10", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0 divide-y divide-slate-100 dark:divide-white/5", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      "border-t bg-slate-50/50 dark:bg-slate-900/50 font-bold [&>tr]:last:border-b-0 uppercase tracking-widest text-[10px]",
      className
    )}
    {...props}
  />
));
TableFooter.displayName = "TableFooter";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "transition-all duration-300 group hover:bg-slate-50 dark:hover:bg-white/[0.02] data-[state=selected]:bg-slate-100 dark:data-[state=selected]:bg-white/5",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "px-6 align-middle font-black text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] text-[10px] whitespace-nowrap transition-colors group-hover:text-primary",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-6 align-middle text-sm font-medium text-slate-700 dark:text-slate-300 transition-all duration-300 group-hover:translate-x-0.5",
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-[0.2em]", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
