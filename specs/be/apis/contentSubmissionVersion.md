# Content Submission Versions API

Base Path: **/api/v1/submissions/:id/versions**

## 1. Get Submission Versions

**GET /**
Access: USER, REVIEWER, ADMIN

Path params:

- `id` (submission id)

Response:

- `success`
- `data[]` where each row includes:
  - `versionId`, `versionNo`, `createdAt`, `changeLog`
  - `uploader` object (`id`, `email`, `firstName`, `lastName`, `userType`)
  - `file` object (`id`, `name`, `storageKey`) when present

Notes:

- List endpoint returns versions uploaded by USER/ADMIN.
- REVIEWER upload versions are not returned by this listing query.

## 2. Save Submission Version

**POST /**
Access: USER, ADMIN, REVIEWER

Request body:

- `contentFilePath` (required string)
- `message` (optional string)

Example:

```json
{
  "contentFilePath": "storage/private/submissions/paper1.docx",
  "message": "Addressed reviewer notes"
}
```

Rules:

- Submission must exist and be in PENDING_APPROVAL or RETURNED.
- USER can upload only for owned submission.
- REVIEWER can upload only when assignment status is ACCEPTED and assignment due date is not passed.
- ADMIN can upload for accessible submission.

Side effects:

- USER upload updates submission current version and sets status to PENDING_APPROVAL.
- ADMIN upload sets submission status to RETURNED.
