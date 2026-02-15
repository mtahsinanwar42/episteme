import { useCallback, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useSelector } from "react-redux";
import { LoadingOverlay } from "@/components/common/LoadingOverlay";
import type { SubmissionOutletContext } from "@/pages/submissions/details";
import type { RootState } from "@/stores/store";
import { SubmissionStatus, MessageScope } from "@/models/submission";
import { ReviewAssignmentStatus } from "@/models/reviewAssignment";
import {
  useSubmissionMessages,
  useCreateSubmissionMessageMutation,
  useSubmissionReviewers,
} from "@/hooks/useSubmissions";
import { useSearchReviewAssignments } from "@/hooks/useReviewAssignments";
import {
  ConversationList,
  MessageThread,
  useMessageGroups,
} from "@/components/submission/message";
import { isDueAtNotPassed } from "@/utils/dateFormatter";

export default function SubmissionMessages() {
  const { submission, isAdmin, isReviewerNonOwner } =
    useOutletContext<SubmissionOutletContext>();
  const currentUser = useSelector((state: RootState) => state?.auth?.user);

  const submissionId = submission.submissionId;

  const { data: messagesData, isLoading: messagesLoading } =
    useSubmissionMessages(submissionId);

  const { data: reviewersData, isLoading: reviewersLoading } =
    useSubmissionReviewers(submissionId, {
      enabled: isAdmin,
      paginate: false,
    });
  const {
    data: reviewerAssignmentsData,
    isLoading: reviewerAssignmentsLoading,
  } = useSearchReviewAssignments(
    { submissionId: Number(submissionId), paginate: false },
    { enabled: isReviewerNonOwner && !!submissionId },
  );

  const createMessageMutation = useCreateSubmissionMessageMutation(
    submissionId ?? "",
  );

  const [selectedUserId, setSelectedUserId] = useState<string | number | null>(
    null,
  );

  const isMessageCreationDisabledByStatus =
    submission.status !== SubmissionStatus.PENDING_APPROVAL &&
    submission.status !== SubmissionStatus.RETURNED;

  const allMessages = messagesData?.data ?? [];
  const { messageGroups, userMessages } = useMessageGroups(
    isAdmin,
    allMessages,
    reviewersData?.data,
    submission,
    Number(currentUser?.id),
  );

  const sendErrorMessage = useMemo(() => {
    if (!createMessageMutation.isError) return null;
    const err = createMessageMutation.error;
    return err instanceof Error ? err.message : "Failed to send message";
  }, [createMessageMutation.isError, createMessageMutation.error]);

  const hasAcceptedReviewerAssignment = useMemo(() => {
    if (!isReviewerNonOwner) return false;
    return (reviewerAssignmentsData?.data ?? []).some(
      (assignment) =>
        Number(assignment.submissionId) === Number(submissionId) &&
        Number(assignment.assignmentStatus) === ReviewAssignmentStatus.ACCEPTED &&
        isDueAtNotPassed(assignment.dueAt),
    );
  }, [isReviewerNonOwner, reviewerAssignmentsData, submissionId]);

  // For ADMIN: check if the selected reviewer has accepted their assignment
  const getReviewerInfoMessage = useCallback(
    (userId: string | number | null): string | null => {
      if (!isAdmin || userId === null || userId === "user") return null;
      const reviewers = reviewersData?.data ?? [];
      const reviewer = reviewers.find((r) => String(r.id) === String(userId));
      if (!reviewer) return null;
      const status = Number(reviewer.assignmentStatus);
      if (status !== ReviewAssignmentStatus.ACCEPTED) {
        return "You cannot send new messages unless the assignment status is Accepted.";
      }
      if (!isDueAtNotPassed(reviewer.dueAt)) {
        return "You cannot send new messages because this review assignment is overdue.";
      }
      return null;
    },
    [isAdmin, reviewersData],
  );

  // For REVIEWER: check if they have accepted their assignment
  const reviewerSelfInfoMessage = useMemo(() => {
    if (!isReviewerNonOwner) return null;
    if (!hasAcceptedReviewerAssignment) {
      return "You cannot send new messages unless the assignment status is Accepted and not overdue.";
    }
    return null;
  }, [
    isReviewerNonOwner,
    hasAcceptedReviewerAssignment,
  ]);

  const isReviewerSendDisabled = useMemo(() => {
    return isReviewerNonOwner && !hasAcceptedReviewerAssignment;
  }, [isReviewerNonOwner, hasAcceptedReviewerAssignment]);

  const statusInfoMessage = useMemo(() => {
    if (!isMessageCreationDisabledByStatus) return null;
    return "Message creation is only available for submissions with status Pending Approval or Returned.";
  }, [isMessageCreationDisabledByStatus]);

  const reviewerMessageScope = useMemo(() => {
    if (isReviewerNonOwner) {
      return MessageScope.ADMIN_REVIEWER;
    }

    return userMessages.some((m) => m.visibilityScope === MessageScope.ADMIN_REVIEWER)
      ? MessageScope.ADMIN_REVIEWER
      : MessageScope.USER_ADMIN;
  }, [isReviewerNonOwner, userMessages]);

  const handleSendMessage = useCallback(
    (content: string, recipientId?: string | number) => {
      if (!content.trim()) return;
      if (isMessageCreationDisabledByStatus) return;
      if (isReviewerSendDisabled) return;

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
    [
      isAdmin,
      createMessageMutation,
      submission,
      reviewerMessageScope,
      isReviewerSendDisabled,
      isMessageCreationDisabledByStatus,
    ],
  );

  if (messagesLoading || reviewersLoading || reviewerAssignmentsLoading) {
    return (
      <div className="relative rounded-lg border border-border p-6 min-h-[400px]">
        <LoadingOverlay visible />
      </div>
    );
  }

  if (isAdmin) {
    const reviewerInfo = getReviewerInfoMessage(selectedUserId);
    const isReviewerNotAccepted =
      selectedUserId !== null &&
      selectedUserId !== "user" &&
      reviewerInfo !== null;

    return (
      <div className="rounded-lg shadow-small border border-border">
        <div className="p-4 gradient-card shadow-sm">
          <h3 className="font-semibold">Messages</h3>
        </div>
        <div className="p-6">
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
                  isAllowedStatus={!isMessageCreationDisabledByStatus}
                  onSendMessage={(content) =>
                    handleSendMessage(content, selectedUserId)
                  }
                  sendError={sendErrorMessage}
                  infoMessage={statusInfoMessage ?? reviewerInfo}
                  disableSend={
                    isMessageCreationDisabledByStatus || isReviewerNotAccepted
                  }
                />
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Select a conversation to view messages
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // USER/REVIEWER view: Single chat with admin
  return (
    <div className="rounded-lg shadow-small border border-border">
      <div className="p-4 gradient-card shadow-sm">
        <h3 className="font-semibold">Messages</h3>
      </div>
      <div className="rounded-lg border border-border overflow-hidden flex flex-col h-[600px] m-6">
        <MessageThread
          group={{
            recipient: { email: "Admin" },
            messages: userMessages,
            scope: reviewerMessageScope,
          }}
          currentUserId={Number(currentUser?.id)}
          isSubmitting={createMessageMutation.isPending}
          isAllowedStatus={!isMessageCreationDisabledByStatus}
          onSendMessage={(content) => handleSendMessage(content)}
          sendError={sendErrorMessage}
          infoMessage={statusInfoMessage ?? reviewerSelfInfoMessage}
          disableSend={isMessageCreationDisabledByStatus || isReviewerSendDisabled}
        />
      </div>
    </div>
  );
}
