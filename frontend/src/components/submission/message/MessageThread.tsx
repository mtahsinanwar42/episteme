import { useRef, useEffect } from "react";
import type { MessageGroup } from "@/models/submission";
import { MessageBubble } from "./MessageBubble";
import { MessageInput } from "./MessageInput";

interface MessageThreadProps {
  group: MessageGroup;
  currentUserId?: number;
  isSubmitting: boolean;
  isAllowedStatus: boolean;
  onSendMessage: (content: string) => void;
}

export function MessageThread({
  group,
  currentUserId,
  isSubmitting,
  isAllowedStatus,
  onSendMessage,
}: MessageThreadProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [group.messages]);

  return (
    <>
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

      <MessageInput
        isSubmitting={isSubmitting}
        isAllowedStatus={isAllowedStatus}
        onSendMessage={onSendMessage}
      />
    </>
  );
}
