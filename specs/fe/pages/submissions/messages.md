# Submissions - Messages

## Route

- Route: `/submissions/:submissionId/messages`
- Access:
  - USER
  - REVIEWER
  - ADMIN
- Mode: View + Create (status and role constrained)

## Purpose

- Provide role-scoped communication for a submission.
- Support these scopes:
  - `USER_ADMIN`
  - `ADMIN_REVIEWER`

## APIs

### Fetch Messages

- `GET /api/v1/submissions/:submissionId/messages`
- Trigger: page load
- UI sorting: ascending by `createdAt`

### Create Message

- `POST /api/v1/submissions/:submissionId/messages`
- Trigger: send message
- Allowed only when submission status is:
  - PENDING_APPROVAL
  - RETURNED

### Fetch Reviewers (ADMIN only)

- `GET /api/v1/submissions/:submissionId/reviewers?paginate=false`
- Purpose: admin recipient list and assignment metadata

### Fetch Reviewer Assignment (reviewer non-owner)

- `GET /api/v1/review-assignments/search?submissionId=<id>&paginate=false`
- Purpose: verify reviewer accepted assignment before enabling send

## Role Behavior

### USER

- Sees single thread with admin.
- Send payload:

```json
{
  "message": "<text>",
  "scope": "USER_ADMIN"
}
```

### REVIEWER (non-owner)

- Sees single thread with admin.
- Send is disabled unless reviewer assignment status is ACCEPTED and assignment due date/time is not passed.
- Send payload:

```json
{
  "message": "<text>",
  "scope": "ADMIN_REVIEWER"
}
```

### ADMIN

- Sees conversation list (submission owner + reviewers inferred from API/messages).
- For owner thread, send payload:

```json
{
  "message": "<text>",
  "scope": "USER_ADMIN",
  "receiverUsrId": "<ownerUserId>"
}
```

- For reviewer thread, send payload:

```json
{
  "message": "<text>",
  "scope": "ADMIN_REVIEWER",
  "receiverUsrId": "<reviewerUserId>"
}
```

- Sending to a reviewer is disabled unless that reviewer assignment status is ACCEPTED and assignment due date/time is not passed.

## Send Blocking Messages

- Submission status not eligible:
  - `Message creation is only available for submissions with status Pending Approval or Returned.`
- Reviewer assignment not accepted/overdue:
  - `You cannot send new messages unless the assignment status is Accepted and not overdue.`
  - `You cannot send new messages because this review assignment is overdue.`

## States

- Loading: messages/reviewers/assignments query in progress
- Empty thread: `No messages yet.`
- Admin with no selected conversation: `Select a conversation to view messages`
- Error on send: render mutation error text in message thread
