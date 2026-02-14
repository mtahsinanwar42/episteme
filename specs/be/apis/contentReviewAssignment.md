# Review Assignments API

Base Path: **/api/v1/review-assignments**

## Assignment Status Enums

- `1` ASSIGNED
- `2` ACCEPTED
- `3` DECLINED
- `4` COMPLETED
- `5` CANCELLED
- `9` DELETED

## 1. Get All Review Assignments

**GET /**
Access: ADMIN

Query params:

- `page` (default `1`)
- `limit` (default `10`)

## 2. Get My Review Assignments

**GET /me**
Access: REVIEWER

Query params:

- `page` (default `1`)
- `limit` (default `10`)

## 3. Search Review Assignments

**GET /search**
Access: REVIEWER, ADMIN

Query params:

- `page` (default `1`)
- `limit` (default `10`)
- `paginate` (`true` by default; pass `false|0|no` to disable)
- `submissionId` (integer)
- `submissionTitle` (text)
- `submissionStatuses` (integer[])
- `submissionOwnerUsrIds` (integer[], ADMIN only)
- `conferenceId` (integer)
- `reviewerUsrIds` (integer[], ADMIN only)
- `assignmentStatuses` (integer[])
- `assignedByUsrIds` (integer[])
- `assignedDateFrom` (`YYYY-MM-DD`)
- `assignedDateTo` (`YYYY-MM-DD`)

Rules:

- `submissionStatuses` validated against content submission statuses.
- `assignmentStatuses` validated against review assignment statuses.
- REVIEWER cannot pass DELETED statuses.
- REVIEWER cannot use `submissionOwnerUsrIds`, `reviewerUsrIds`, or `assignedByUsrIds`.
- REVIEWER results exclude deleted assignments and deleted submissions.
- `assignedDateFrom` must be `<= assignedDateTo`.

## 4. Save Review Assignment

**POST /**
Access: ADMIN

Request body:

- `contentSubmissionId` (required integer)
- `reviewerUsrId` (required integer)
- `assignedByNotes` (optional string)

Example:

```json
{
  "contentSubmissionId": 13,
  "reviewerUsrId": 19,
  "assignedByNotes": "Please review this"
}
```

Rules:

- Submission must exist, be eligible, and not owned by selected reviewer.
- Reviewer must exist and have REVIEWER role.
- Duplicate assignment pair is rejected.

## 5. Update Review Assignment Status

**PUT /:id/status**
Access: ADMIN, REVIEWER

Request body:

- `status` (required integer)
- `statusUpdateNotes` (optional; persisted for ADMIN updates)

Rules:

- ADMIN can set: ASSIGNED, CANCELLED, DELETED.
- REVIEWER can set: ACCEPTED, DECLINED.
- Cannot update assignment already CANCELLED or DELETED.
- Submission must be in PENDING_APPROVAL/RETURNED and conference ACTIVE.
