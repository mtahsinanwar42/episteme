import { cn } from "@/lib/utils";
import { formatDateTime } from "@/utils/dateFormatter";
import type { SubmissionMessage } from "@/models/submission";

interface MessageBubbleProps {
  message: SubmissionMessage;
  isOwnMessage: boolean;
  showSenderName: boolean;
}

export function MessageBubble({
  message,
  isOwnMessage,
  showSenderName,
}: MessageBubbleProps) {
  const senderName = message.sender
    ? [message.sender.firstName, message.sender.lastName]
        .filter(Boolean)
        .join(" ")
    : "Unknown";

  return (
    <div
      className={cn(
        "flex gap-2 mb-1",
        isOwnMessage ? "justify-end" : "justify-start",
      )}
    >
      {/* Sender Avatar for left messages */}
      {!isOwnMessage && (
        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center shrink-0 text-xs font-semibold text-foreground">
          {message.sender?.firstName?.charAt(0) ?? "?"}
        </div>
      )}

      <div className="flex flex-col gap-1 max-w-xs">
        {/* Sender name - only show if not same as previous */}
        {showSenderName && (
          <div
            className={cn(
              "text-xs font-semibold px-3 py-0.5",
              isOwnMessage
                ? "text-end text-foreground/60"
                : "text-foreground/80",
            )}
          >
            {isOwnMessage ? "You" : senderName}
          </div>
        )}

        {/* Message Bubble */}
        <div
          className={cn(
            "px-4 py-2 rounded-2xl shadow-sm",
            isOwnMessage
              ? "bg-slate-800 border border-slate-700 rounded-bl-none text-foreground"
              : "bg-blue-600 text-white rounded-br-none",
          )}
        >
          <div className="text-sm whitespace-normal leading-relaxed">
            {message.message ?? message.content}
          </div>
          <div
            className={cn(
              "text-xs mt-1.5 font-medium",
              isOwnMessage ? "text-blue-100" : "text-foreground/80",
            )}
          >
            {formatDateTime(message.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
}
