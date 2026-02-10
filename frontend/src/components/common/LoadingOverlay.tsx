import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  visible: boolean;
}

export function LoadingOverlay({ visible }: LoadingOverlayProps) {
  if (!visible) return null;

  return (
    <div className="absolute inset-0 z-60 flex items-center justify-center rounded-[inherit] bg-background/60 backdrop-blur-sm">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
    </div>
  );
}
