import type { MessageGroup } from "@/models/submission";
import { MessageScope } from "@/models/submission";
import { ConversationItem } from "./ConversationItem";

interface ConversationListProps {
  messageGroups: Record<string | number, MessageGroup>;
  selectedUserId: string | number | null;
  onSelectConversation: (key: string | number) => void;
}

export function ConversationList({
  messageGroups,
  selectedUserId,
  onSelectConversation,
}: ConversationListProps) {
  return (
    <div className="rounded-lg border border-border overflow-hidden flex flex-col h-fit lg:h-[600px]">
      <div className="bg-accent px-4 py-3 border-b border-border">
        <h4 className="font-semibold text-sm">Conversations</h4>
      </div>
      <div className="overflow-y-auto">
        {Object.entries(messageGroups).map(([key, group]) => (
          <ConversationItem
            key={key}
            recipient={group.recipient}
            isSelected={selectedUserId === key}
            onClick={() => onSelectConversation(key)}
            role={group.scope === MessageScope.USER_ADMIN ? "user" : "reviewer"}
          />
        ))}

        {Object.keys(messageGroups).length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No conversations yet
          </div>
        )}
      </div>
    </div>
  );
}
