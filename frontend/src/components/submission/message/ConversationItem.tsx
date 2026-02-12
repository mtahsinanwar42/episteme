import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { SubmissionReviewer } from "@/models/submission";

interface ConversationItemProps {
  recipient: SubmissionReviewer | null;
  isSelected: boolean;
  onClick: () => void;
  role?: "user" | "reviewer";
}

export function ConversationItem({
  recipient,
  isSelected,
  onClick,
  role,
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
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold text-foreground",
            role === "user" ? "bg-blue-700" : "bg-slate-700",
          )}
        >
          {recipientName?.charAt(0) ?? "?"}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{recipientName}</span>
            {role === "user" && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-500 text-blue-400 shrink-0">
                Author
              </Badge>
            )}
            {role === "reviewer" && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-500 text-emerald-400 shrink-0">
                Reviewer
              </Badge>
            )}
          </div>
          {recipient?.email && (
            <div className="text-xs text-muted-foreground mt-0.5 truncate">
              {recipient.email}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
