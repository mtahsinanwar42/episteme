import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!messageInput.trim() || isSubmitting) return;
      onSendMessage(messageInput);
      setMessageInput("");
    }
  };

  if (!isAllowedStatus) {
    return null;
  }

  return (
    <div className="border-t border-border bg-slate-950 p-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <textarea
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message... (Press Enter to send)"
          disabled={isSubmitting}
          rows={2}
          className="flex-1 px-3 py-2 text-sm text-foreground rounded-lg border border-accent bg-slate-900 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30 placeholder:text-slate-500 disabled:opacity-50"
        />
        <Button
          type="submit"
          disabled={!messageInput.trim() || isSubmitting}
          className="h-auto px-4"
        >
          {isSubmitting ? "Sending..." : <Send className="w-4 h-4" />}
        </Button>
      </form>
    </div>
  );
}
