import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full ps-3 pe-3 py-2.5 text-heading text-sm rounded-lg border border-accent file:border-r-2 file:pr-1 file:border-gray-200 file:text-accent focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 placeholder:text-body",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
