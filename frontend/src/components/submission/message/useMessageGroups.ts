import { useMemo } from "react";
import { MessageScope } from "@/models/submission";
import type {
  SubmissionMessage,
  SubmissionReviewer,
  Submission,
  MessageGroups,
} from "@/models/submission";

export function useMessageGroups(
  isAdmin: boolean,
  allMessages: SubmissionMessage[],
  reviewersData: SubmissionReviewer[] | undefined,
  submission: Submission,
  currentUserId?: number,
) {
  const allReviewers = useMemo(() => {
    return reviewersData ?? [];
  }, [reviewersData]);

  // Combine reviewers from API and messages
  const messageReviewers = useMemo(() => {
    if (!isAdmin) return [];

    const reviewerMap = new Map<string | number, SubmissionReviewer>();

    // Add all reviewers from API (no status filter)
    allReviewers.forEach((reviewer) => {
      if (reviewer.id !== undefined && reviewer.id !== null) {
        reviewerMap.set(reviewer.id, reviewer);
      }
    });

    // Add reviewers found in messages that may not be in API response
    allMessages.forEach((message) => {
      if (message.visibilityScope !== MessageScope.ADMIN_REVIEWER) {
        return;
      }

      const sender = message.sender;
      const receiver = message.receiver;

      if (
        sender?.id !== undefined &&
        sender.id !== null &&
        sender.userType !== "ADMIN"
      ) {
        if (!reviewerMap.has(sender.id)) {
          reviewerMap.set(sender.id, {
            id: sender.id,
            email: sender.email,
            firstName: sender.firstName,
            lastName: sender.lastName,
          });
        }
      }

      if (
        receiver?.id !== undefined &&
        receiver.id !== null
      ) {
        if (!reviewerMap.has(receiver.id)) {
          reviewerMap.set(receiver.id, {
            id: receiver.id,
            email: receiver.email,
            firstName: receiver.firstName,
            lastName: receiver.lastName,
          });
        }
      }
    });

    return Array.from(reviewerMap.values());
  }, [isAdmin, allReviewers, allMessages]);

  // For ADMIN: Group messages by recipient
  const messageGroups = useMemo(() => {
    if (!isAdmin) return {};

    const groups: MessageGroups = {};

    // Add submission owner (USER_ADMIN scope)
    groups["user"] = {
      recipient: {
        id: submission.ownerUserId,
        email: submission.ownerEmail,
        firstName: submission.ownerFirstName,
        lastName: submission.ownerLastName,
      },
      messages: allMessages
        .filter((m) => m.visibilityScope === MessageScope.USER_ADMIN)
        .sort(
          (a, b) =>
            new Date(a.createdAt ?? 0).getTime() -
            new Date(b.createdAt ?? 0).getTime(),
        ),
      scope: MessageScope.USER_ADMIN,
    };

    // Add reviewers (ADMIN_REVIEWER scope)
    messageReviewers.forEach((reviewer) => {
      groups[reviewer.id ?? ""] = {
        recipient: reviewer,
        messages: allMessages
          .filter(
            (m) =>
              m.visibilityScope === MessageScope.ADMIN_REVIEWER &&
              (m.sender?.id === reviewer.id || m.receiver?.id === reviewer.id),
          )
          .sort(
            (a, b) =>
              new Date(a.createdAt ?? 0).getTime() -
              new Date(b.createdAt ?? 0).getTime(),
          ),
        scope: MessageScope.ADMIN_REVIEWER,
      };
    });

    return groups;
  }, [isAdmin, allMessages, messageReviewers, submission]);

  // For USER/REVIEWER: Filter messages with admin
  const userMessages = useMemo(() => {
    if (isAdmin) return [];
    return allMessages
      .filter((m) => {
        // Include USER_ADMIN messages (to/from owner)
        if (m.visibilityScope === MessageScope.USER_ADMIN) {
          return true;
        }
        // For reviewers, include ADMIN_REVIEWER messages where they are involved
        if (m.visibilityScope === MessageScope.ADMIN_REVIEWER) {
          return (
            m.sender?.id === currentUserId || m.receiver?.id === currentUserId
          );
        }
        return false;
      })
      .sort(
        (a, b) =>
          new Date(a.createdAt ?? 0).getTime() -
          new Date(b.createdAt ?? 0).getTime(),
      );
  }, [isAdmin, allMessages, currentUserId]);

  return { messageGroups, userMessages };
}
