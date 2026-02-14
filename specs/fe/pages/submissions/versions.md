# Submissions - Versions

## Route

- Route: `/submissions/:submissionId/versions`
- Access:
  - USER
  - REVIEWER
  - ADMIN
- Mode: View + conditional Create

## Purpose

- Display version history for a submission.
- Allow upload of a new version by ADMIN or submission owner USER.

## APIs

### Fetch Versions

- `GET /api/v1/submissions/:id/versions`
- Trigger: page load
- UI sorting: descending by `versionNo`

### Create New Version

- `POST /api/v1/submissions/:id/versions`
- Trigger: Add New Version modal submit

Request body:

```json
{
  "contentFilePath": "storage/private/submissions/...",
  "message": "optional change log"
}
```

## Table Columns

- Version No
- Change Log / Notes
- Uploader (name + email)
- File (download button + filename)
- Created At

## Upload Rules

Upload button shown only when all are true:

- Role is ADMIN, or role is USER and current user is submission owner
- Submission status is PENDING_APPROVAL or RETURNED

REVIEWER can view versions but cannot upload from this page.

## Modal

Fields:

- Submission File (required, uploaded first via file service)
- Change Log / Notes (optional)

Behavior:

- File upload failures show `Failed to upload submission file`
- Submit without uploaded file shows `Submission file is required`
- Success toast: `New version uploaded successfully.`

## Access Notes

Backend response for GET only includes versions uploaded by USER/ADMIN. Reviewer-uploaded versions are not included in this list endpoint.

## States

- Loading: table overlay while fetching
- Empty: `No versions available.`
- Error: API error text or fallback `Failed to load submission versions.`
