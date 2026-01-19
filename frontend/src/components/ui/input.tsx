import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "w-full ps-3 pe-3 py-2.5 text-heading text-sm rounded border border-accent focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 placeholder:text-body",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
