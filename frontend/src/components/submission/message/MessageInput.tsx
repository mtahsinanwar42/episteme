import { useState } from "react";
import { Button } from "@/components/ui/button";

interface MessageInputProps {
  isSubmitting: boolean;
  isAllowedStatus: boolean;
  onSendMessage: (content: string) => void;
}

export function MessageInput({
  isSubmitting,
  isAllowedStatus,
  onSendMessage,
}: MessageInputProps) {
  const [messageInput, setMessageInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    onSendMessage(messageInput);
    setMessageInput("");
  };

  if (!isAllowedStatus) {
    return null;
  }

  return (
    <div className="border-t border-border bg-white dark:bg-slate-950 p-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type a message..."
          disabled={isSubmitting}
          rows={2}
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-accent focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 placeholder:text-slate-500 disabled:opacity-50"
        />
        <Button
          type="submit"
          disabled={!messageInput.trim() || isSubmitting}
          className="h-auto px-4"
        >
          {isSubmitting ? "Sending..." : "Send"}
        </Button>
      </form>
    </div>
  );
}
