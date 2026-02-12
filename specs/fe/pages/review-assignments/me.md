# Review Assignments - My Assignments

## Route

- Path: `/review-assignments/me`
- Access: REVIEWER
- Mode: View + update assignment status (Accept/Decline via modal)

---

## Purpose

- Display submissions assigned to the logged-in reviewer.
- Let REVIEWER view assignment details.
- Let REVIEWER navigate to submission detail pages.
- Let REVIEWER accept or decline assignment status when allowed.

---

## API

### Fetch My Review Assignments

- `GET /api/v1/review-assignments/me`
- Trigger: initial load and pagination changes
- Query params used by FE: `page`, `limit`

### Update Review Assignment Status

- `PUT /api/v1/review-assignments/:id/status`
- Trigger: Accept or Decline action in Assignment Details modal
- Request body:
  - `status` (number, required)

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
- Assigned By (name + email)
- Assignment Status (badge)
- Assigned At (formatted datetime)
- Submitter (name + email)
- Actions

### Row Actions

- View Submission: navigate to `/submissions/:submissionId`
- Assignment Details: open `Review Assignment Details` modal

---

## Assignment Details Modal (REVIEWER)

### Read-Only Details

- Submission
- Submission Status
- Conference
- Conference Status
- Assigned By
- Assigned At
- Assignment Notes (shown only when `assignedByNotes` exists; displayed in italic style)
- Submitter
- Assignment Status
- Status Update Notes (shown only when `assignmentStatusUpdateNotes` is non-empty)

### Update Eligibility (`canUpdateStatus`)

- Assignment status is one of: `ASSIGNED`, `ACCEPTED`, `DECLINED`
- Submission status is `PENDING_APPROVAL` or `RETURNED`
- Conference status is `ACTIVE`

### Modal Actions

- Always available: `Close`
- If `canUpdateStatus` is true:
  - `Decline` button is shown when current status is not `DECLINED`
  - `Accept` button is shown when current status is not `ACCEPTED`

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
- Forbidden: non-REVIEWER cannot access route

---

## Access Control Rules

- Only REVIEWER can access this page.
- REVIEWER sees only assignments linked to their account.
- ADMIN and USER must not access this route.
