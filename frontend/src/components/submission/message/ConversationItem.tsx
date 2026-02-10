import { cn } from "@/lib/utils";
import type { SubmissionReviewer } from "@/models/submission";

interface ConversationItemProps {
  recipient: SubmissionReviewer | null;
  isSelected: boolean;
  onClick: () => void;
}

export function ConversationItem({
  recipient,
  isSelected,
  onClick,
}: ConversationItemProps) {
  const recipientName =
    recipient && recipient.firstName && recipient.lastName
      ? `${recipient.firstName} ${recipient.lastName}`
      : recipient?.email || "Unknown";

  return (
    <div
      onClick={onClick}
      className={cn(
        "cursor-pointer w-full px-4 py-3 border-b border-border text-left hover:bg-slate-900/50 transition-colors text-sm",
        isSelected && "bg-accent/40 border-accent",
      )}
    >
      <div className="flex gap-2 items-center">
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0 text-xs font-semibold text-foreground">
          {recipientName?.charAt(0) ?? "?"}
        </div>
        <div>
          <div className="font-medium">{recipientName}</div>
          {recipient?.email && (
            <div className="text-xs text-muted-foreground mt-0.5">
              {recipient.email}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
