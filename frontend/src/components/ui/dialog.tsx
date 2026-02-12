import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-2xl",
};

export function Dialog({
  open,
  onOpenChange,
  children,
  size = "md",
}: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => onOpenChange(false)}
      />
      <div
        className={cn(
          "relative z-50 border border-border bg-card rounded-lg shadow-lg w-full mx-4 max-h-[85vh] flex flex-col",
          sizeClasses[size],
        )}
      >
        {children}
      </div>
    </div>
  );
}

interface DialogContentProps {
  children: React.ReactNode;
  onClose?: () => void;
}

export function DialogContent({ children, onClose }: DialogContentProps) {
  return (
    <div className="relative flex flex-col overflow-hidden">
      {onClose && (
        <div
          onClick={onClose}
          className="cursor-pointer p-2 absolute right-2 top-2 hover:text-foreground/60"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </div>
      )}
      {children}
    </div>
  );
}

interface DialogHeaderProps {
  children: React.ReactNode;
}

export function DialogHeader({ children }: DialogHeaderProps) {
  return (
    <div className="px-4 py-2 shadow-sm bg-accent/5 shrink-0">{children}</div>
  );
}

interface DialogTitleProps {
  children: React.ReactNode;
}

export function DialogTitle({ children }: DialogTitleProps) {
  return <h2 className="text-accent text-lg">{children}</h2>;
}

interface DialogFooterProps {
  children: React.ReactNode;
}

export function DialogFooter({ children }: DialogFooterProps) {
  return (
    <div className="flex gap-2 justify-end px-6 pb-6 pt-4 shrink-0">
      {children}
    </div>
  );
}

interface DialogBodyProps {
  children: React.ReactNode;
}

export function DialogBody({ children }: DialogBodyProps) {
  return <div className="px-6 py-4 overflow-y-auto">{children}</div>;
}
