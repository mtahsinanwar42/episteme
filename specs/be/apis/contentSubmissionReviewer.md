# Content Submission Reviewer API

Base Path: **/api/v1/submissions/:id/reviewers**

## 1. Get Submission Reviewers

**GET /**
Access: ADMIN

Path params:

- `id` (submission id)

Query params:

- `page` (default `1`)
- `limit` (default `10`)
- `paginate` (`true` by default; pass `false|0|no` to disable)

Response:

- Always: `success`, `total`, `data[]`
- When paginated: includes `page`, `limit`

Row shape (`data[]`):

- Reviewer identity: `id`, `email`, `firstName`, `lastName`, `phone`, `roles`, `status`, `institution`, `occupation`, `country`
- Assignment info: `assignmentId`, `assignmentStatus`, `assignmentStatusUpdateNotes`, `assignedAt`, `dueAt`, `assignedByUserId`, `assignedByNotes`
- Assigner identity: `assignedByEmail`, `assignedByFirstName`, `assignedByLastName`

Notes:

- Excludes assignments in DELETED status.
