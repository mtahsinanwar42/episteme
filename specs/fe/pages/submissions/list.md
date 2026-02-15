# Submissions List

## Route

- Path: `/submissions`
- Access: USER, ADMIN
- Mode: View

## Purpose

- Show paginated submission rows for the current role scope.
- Navigate to details container route per submission.

## API

- `GET /api/v1/submissions`
- Query params used by FE:
  - `page`, `limit`
  - optional `paginate`

## Navigation

- Row action -> `/submissions/:submissionId`

## Notes

- Full filtering/search behavior lives in `/submissions/search` route/page.
