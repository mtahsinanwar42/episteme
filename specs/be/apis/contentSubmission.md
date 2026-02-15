# Content Submission API

Base Path: **/api/v1/submissions**

## Status Enums

`CONTENT_SUBMISSION_STATUS`

- `0` DRAFT
- `1` PENDING_APPROVAL
- `2` RETURNED
- `3` APPROVED
- `4` REJECTED
- `9` DELETED

## 1. Get Submissions

**GET /**
Access: USER, ADMIN

Query params:

- `page` (default `1`)
- `limit` (default `10`)

Response:

- `success`, `page`, `limit`, `total`, `data[]`

Notes:

- USER sees own non-deleted submissions.
- ADMIN sees non-owned submissions.

## 2. Search Submissions

**GET /search**
Access: USER, ADMIN

Query params:

- `page` (default `1`)
- `limit` (default `10`)
- `paginate` (`true` by default; pass `false|0|no` to disable)
- `title` (text)
- `topics` (comma list or JSON array)
- `doi` (text)
- `conferenceId` (integer)
- `status` (comma list of integers)
- `ownerUsrIds` (comma list of integers, ADMIN only)
- `createdDateFrom` (`YYYY-MM-DD`)
- `createdDateTo` (`YYYY-MM-DD`)

Notes:

- USER cannot filter by `ownerUsrIds`.
- USER cannot include `DELETED` status.
- `createdDateFrom` must be `<= createdDateTo`.
- When `paginate=false`, response omits `page` and `limit`.

## 3. Save Submission

**POST /**
Access: USER

Request body:

- `title` (required)
- `abstract` (required)
- `conferenceId` (required)
- `topics` (required string[])
- `contentFilePath` (required)
- `message` (optional initial version change log)

Example:

```json
{
  "title": "Graph Theory Unleashed",
  "abstract": "...",
  "conferenceId": 5,
  "topics": ["Graph"],
  "contentFilePath": "storage/private/submissions/paper1.docx",
  "message": "Initial submission"
}
```

Response `data` shape is serialized and includes:

- `id`, `title`, `abstract`, `topics`, `status`, `createdAt`, `updatedAt`
- nested `version` (`id`, `changeLog`, `filePath`, `createdAt`, `versionNo`)

## 4. Get Submission by ID

**GET /:id**
Access: USER, REVIEWER, ADMIN

Returns `success` + `data` with fields such as:

- `submissionId`, `title`, `abstract`, `topics`, `doi`, `status`, `statusUpdateNotes`
- `currentContentSubmissionVersionId`, `createdAt`, `updatedAt`, `ownerUserId`
- conference fields: `conferenceId`, `conferenceTitle`, `conferenceSlug`, `conferenceStatus`
- ADMIN-only enrichments: `paymentStatus`, owner profile fields

## 5. Update Submission DOI

**PUT /:id/doi**
Access: ADMIN

Request body:

- `doi` (required text)

Notes:

- Allowed only when current submission status is APPROVED.

## 6. Update Submission Status

**PUT /:id/status**
Access: ADMIN

Request body:

- `status` (required integer)
- `statusUpdateNotes` (optional text)

Notes:

- Cannot update once submission is already APPROVED, REJECTED, or DELETED.
- Setting status to APPROVED/REJECTED auto-cancels ASSIGNED/ACCEPTED/OVERDUE review assignments.
- Setting status to DELETED also marks associated review assignments as DELETED.
