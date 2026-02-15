# Review Assignments - All Assignments

## Route

- Path: `/review-assignments`
- Access: ADMIN
- Mode: View + update assignment status (via modal)

---

## Purpose

- Display all review assignments.
- Let ADMIN view assignment details and update assignment status.
- Let ADMIN navigate to submission detail pages.

---

## API

### Fetch Review Assignments

- `GET /api/v1/review-assignments`
- Trigger: initial load and pagination changes
- Query params used by FE: `page`, `limit`

### Update Review Assignment Status

- `PUT /api/v1/review-assignments/:id/status`
- Trigger: save action in Assignment Details modal
- Request body:
  - `status` (number, required)
  - `statusUpdateNotes` (string, optional)

---

## UI Requirements

- Layout: table view + modal
- Search:
  - Client-side table search input with placeholder `Filter assignments`

### Table Columns

- Submission Title
- Submission Status (badge)
- Conference
- Conference Status (badge)
- Reviewer (name + email)
- Assignment Status (badge)
- Assigned By (name + email)
- Assigned At (formatted datetime)
- Due At (formatted datetime)
- Submitter (name + email)
- Actions

### Row Actions

- View Submission: navigate to `/submissions/:submissionId`
- Assignment Details: open `Review Assignment Details` modal

---

## Assignment Details Modal (ADMIN)

### Read-Only Details

- Submission
- Submission Status
- Conference
- Conference Status
- Reviewer
- Assigned By
- Assigned At
- Due At
- Assignment Notes (shown only when `assignedByNotes` exists; displayed in italic style)
- Submitter
- Assignment Status
- Status Update Notes (shown only when `assignmentStatusUpdateNotes` is non-empty)

### Update Controls

- Controls appear only when `canUpdateStatus` is true.
- Fields:
  - `Select new status *` (single select)
  - `Status Update Notes` (text input, optional)
- Allowed statuses in select:
  - `ASSIGNED`
  - `CANCELLED`
  - `DELETED`

### Update Eligibility (`canUpdateStatus`)

- Assignment status is not `CANCELLED`, `OVERDUE`, or `DELETED`
- Submission status is `PENDING_APPROVAL` or `RETURNED`
- Conference status is `ACTIVE`

### Modal Actions

- If updatable:
  - `Cancel`
  - `Save` (disabled until a new status is selected)
- If not updatable:
  - `Close`

### Update Result

- On success:
  - Modal closes
  - Success toast: `Assignment status updated.`
  - Assignment lists are refreshed via query invalidation
- On error:
  - Error is logged to console

---

## Pagination Requirements

- Server pagination with `page` and `limit`
- Pagination component is shown only when:
  - not loading
  - no error
  - `total > 0`

---

## States

- Loading: loading overlay in table area
- Error: inline text `Error: <message>`
- Empty: text `No data available`
- Forbidden: non-ADMIN cannot access route

---

## Access Control Rules

- Only ADMIN can access this page.
- REVIEWER and USER must not access this route.
