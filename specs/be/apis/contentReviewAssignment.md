# Review Assignments API

Base Path: **/api/v1/review-assignments**

---

## 1. Get All Review Assignments

**GET /**
Access: ADMIN

### Request Params

Optional:

- limit _(default to 10)_
- page _(default to 1)_

Example:

```perl
/api/v1/review-assignments?page=2&limit=10
```

## 2. Get My Review Assignments

**GET /me**
Access: REVIEWER

### Request Params

Optional:

- limit _(default to 10)_
- page _(default to 1)_

Example:

```perl
/api/v1/review-assignments/me?page=2&limit=10
```

## 3. Search Review Assignments

**GET /search**
Access: REVIEWER/ADMIN

### Request Params

Optional:

- page _(default to 1)_
- limit _(default to 10)_
- submissionTitle (text)
- submissionStatuses (integer[])
- submissionOwnerUsrIds (integer[]), ADMIN only
- conferenceId (integer)
- reviewerUsrIds (integer[]), ADMIN only
- assignmentStatuses (integer[])
- assignedByUsrIds (integer[])
- assignedDateFrom (date in YYYY-MM-DD)
- assignedDateTo (date in YYYY-MM-DD)

Notes:

- `submissionStatuses` values are validated against `CONTENT_SUBMISSION_STATUS`.
- `assignmentStatuses` values are validated against `REVIEW_ASSIGNMENT_STATUS`.
- REVIEWER cannot pass `DELETED` for `submissionStatuses` or `assignmentStatuses`.
- REVIEWER is always filtered by logged-in reviewer user id.
- REVIEWER always excludes deleted assignments and deleted submissions.
- `submissionOwnerUsrIds`, `reviewerUsrIds` use `IN (...)` matching in SQL.

Example:

```perl
/api/v1/review-assignments/search?page=1&limit=10&submissionTitle=graph&submissionStatuses=1,2&assignmentStatuses=1,2&conferenceId=5&assignedByUsrIds=3,5&assignedDateFrom=2026-06-01&assignedDateTo=2026-06-30
```

## 4. Save Review Assignment

**POST /review-assignments**
Access: ADMIN

### Request Body

Required:

- contentSubmissionId (integer)
- reviewerUsrId (integer)

Optional:

- assignedByNotes (string)

Example:

```json
{
  "contentSubmissionId": 13,
  "reviewerUsrId": 19,
  "assignedByNotes": "Please review this"
}
```

## 5. Update Review Assignment Status

**PUT /:id/status**  
Access: ADMIN / REVIEWER
Notes: Cannot update CANCELLED/DELETED assignment.

### Request Body

Required:

- status (integer)

Optional:

- statusUpdateNotes (text), shown for ADMIN only

Example:

```json
{
  "status": 1,
  "statusUpdateNotes": "Accepted" // ADMIN only
}
```
