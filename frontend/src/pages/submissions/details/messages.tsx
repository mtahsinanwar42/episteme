import { useCallback, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useSelector } from "react-redux";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import type { SubmissionOutletContext } from "@/pages/submissions/details";
import type { RootState } from "@/stores/store";
import { SubmissionStatus, MessageScope } from "@/models/submission";
import {
  useSubmissionMessages,
  useCreateSubmissionMessageMutation,
  useSubmissionReviewers,
} from "@/hooks/useSubmissions";
import {
  ConversationList,
  MessageThread,
  useMessageGroups,
} from "@/components/submission/message";

export default function SubmissionMessages() {
  const { submission, isAdmin } = useOutletContext<SubmissionOutletContext>();
  const currentUser = useSelector((state: RootState) => state?.auth?.user);

  const submissionId = submission.submissionId;

  const { data: messagesData, isLoading: messagesLoading } =
    useSubmissionMessages(submissionId);

  const { data: reviewersData, isLoading: reviewersLoading } =
    useSubmissionReviewers(submissionId, { enabled: isAdmin });

  const createMessageMutation = useCreateSubmissionMessageMutation(
    submissionId ?? "",
  );

  const [selectedUserId, setSelectedUserId] = useState<string | number | null>(
    null,
  );

  const isAllowedStatus =
    submission.status === SubmissionStatus.PENDING_APPROVAL ||
    submission.status === SubmissionStatus.RETURNED;

  const allMessages = messagesData?.data ?? [];
  const { messageGroups, userMessages } = useMessageGroups(
    isAdmin,
    allMessages,
    reviewersData?.data,
    submission,
    Number(currentUser?.id),
  );

  const handleSendMessage = useCallback(
    (content: string, recipientId?: string | number) => {
      if (!content.trim()) return;

      const reviewerMessageScope = userMessages.some(
        (m) => m.visibilityScope === MessageScope.ADMIN_REVIEWER,
      )
        ? MessageScope.ADMIN_REVIEWER
        : MessageScope.USER_ADMIN;

      const payload = isAdmin
        ? {
            message: content.trim(),
            scope:
              recipientId === "user"
                ? MessageScope.USER_ADMIN
                : MessageScope.ADMIN_REVIEWER,
            receiverUsrId:
              recipientId === "user" ? submission.ownerUserId : recipientId,
          }
        : {
            message: content.trim(),
            scope: reviewerMessageScope,
            receiverUsrId: undefined,
          };

      createMessageMutation.mutate(payload);
    },
    [isAdmin, createMessageMutation, submission, userMessages],
  );

  if (messagesLoading || reviewersLoading) {
    return (
      <div className="relative rounded-lg border border-border p-6 min-h-[400px]">
        <LoadingOverlay visible />
      </div>
    );
  }

  if (!isAllowedStatus && !messagesLoading) {
    return (
      <div className="rounded-lg border border-border p-6 bg-slate-900/20">
        <p className="text-sm text-muted-foreground">
          Messaging is only available for submissions with status
          PENDING_APPROVAL or RETURNED.
        </p>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <ConversationList
          messageGroups={messageGroups}
          selectedUserId={selectedUserId}
          onSelectConversation={setSelectedUserId}
        />

        <div className="rounded-lg border border-border overflow-hidden flex flex-col h-[600px]">
          {selectedUserId !== null && messageGroups[selectedUserId] ? (
            <MessageThread
              group={messageGroups[selectedUserId]}
              currentUserId={Number(currentUser?.id)}
              isSubmitting={createMessageMutation.isPending}
              isAllowedStatus={isAllowedStatus}
              onSendMessage={(content) =>
                handleSendMessage(content, selectedUserId)
              }
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a conversation to view messages
            </div>
          )}
        </div>
      </div>
    );
  }

  // USER/REVIEWER view: Single chat with admin
  const reviewerMessageScope = userMessages.some(
    (m) => m.visibilityScope === MessageScope.ADMIN_REVIEWER,
  )
    ? MessageScope.ADMIN_REVIEWER
    : MessageScope.USER_ADMIN;

  return (
    <div className="rounded-lg border border-border overflow-hidden flex flex-col h-[600px]">
      <MessageThread
        group={{
          recipient: { email: "Admin" },
          messages: userMessages,
          scope: reviewerMessageScope,
        }}
        currentUserId={Number(currentUser?.id)}
        isSubmitting={createMessageMutation.isPending}
        isAllowedStatus={isAllowedStatus}
        onSendMessage={(content) => handleSendMessage(content)}
      />
    </div>
  );
}
