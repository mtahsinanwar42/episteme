import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold truncate transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-green-800 text-foreground hover:bg-green-800/80",
        secondary:
          "border-transparent bg-yellow-400 text-background hover:bg-yellow-500",
        destructive:
          "border-transparent bg-red-800 text-white hover:bg-red-800/80",
        outline: "bg-transparent text-foreground shadow-sm border-slate-600",
        disabled: "border-gray-300 bg-gray-200 text-gray-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge };
