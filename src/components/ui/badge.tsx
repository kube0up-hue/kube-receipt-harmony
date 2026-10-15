import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-display font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
        secondary:
          "border-border/60 bg-secondary/80 text-secondary-foreground hover:bg-secondary",
        destructive:
          "border-destructive/20 bg-destructive/10 text-destructive hover:bg-destructive/15",
        kube:
          "border-kube-red/30 bg-kube-red/10 text-kube-red hover:bg-kube-red/20",
        success:
          "border-success/30 bg-success/10 text-success hover:bg-success/20",
        warning:
          "border-warning/30 bg-warning/15 text-warning-foreground hover:bg-warning/25",
        outline:
          "border-border text-foreground hover:bg-muted/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
