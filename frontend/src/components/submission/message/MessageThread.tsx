import { useRef, useEffect } from "react";
import { Info } from "lucide-react";
import type { MessageGroup } from "@/models/submission";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";

interface MessageThreadProps {
  group: MessageGroup;
  currentUserId?: number;
  isSubmitting: boolean;
  isAllowedStatus: boolean;
  onSendMessage: (content: string) => void;
  sendError?: string | null;
  infoMessage?: string | null;
  disableSend?: boolean;
}

export function MessageThread({
  group,
  currentUserId,
  isSubmitting,
  isAllowedStatus,
  onSendMessage,
  sendError,
  infoMessage,
  disableSend,
}: MessageThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [group.messages]);

  return (
    <>
      {infoMessage && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-950/50 border-b border-blue-800/50 text-blue-300 text-xs">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>{infoMessage}</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto bg-linear-to-b from-slate-950 to-slate-900/50 p-4 flex flex-col gap-4">
        {group.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            No messages yet.
          </div>
        ) : (
          group.messages.map((message, idx) => {
            const isOwnMessage = message.sender?.id === currentUserId;
            const prevMessage = idx > 0 ? group.messages[idx - 1] : null;
            const showSenderName =
              !prevMessage || prevMessage.sender?.id !== message.sender?.id;

            return (
              <MessageBubble
                key={message.messageId ?? message.id}
                message={message}
                isOwnMessage={isOwnMessage}
                showSenderName={showSenderName}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {sendError && (
        <div className="px-4 py-2 bg-destructive/10 text-destructive text-sm border-t border-destructive/20">
          {sendError}
        </div>
      )}

      <MessageInput
        isSubmitting={isSubmitting}
        isAllowedStatus={isAllowedStatus && !disableSend}
        onSendMessage={onSendMessage}
      />
    </>
  );
}
