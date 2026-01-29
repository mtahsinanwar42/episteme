# Review Assignments — My Assignments

## Route

- Path: `/review-assignments/me`
- Access: REVIEWER
- Mode: View (read-only) + partial update (accept/reject)

---

## Purpose

- Display a list of submissions assigned to the logged-in REVIEWER.
- Allow REVIEWER to navigate to the submission detail page

---

## API

- `GET /api/v1/review-assignments/me`
- Trigger: Page load + pagination changes
- Query params: As defined in Reviewer Assignment API spec

- `PUT /api/v1/review-assignments/:id/status` for Accepting/Rejecting the assignment

---

## UI Requirements

- Layout: **table view**
- Columns:
  - Submission Title (text)
  - Submission Status (badge)
  - Conference (text)
  - Assigned By (name + email)
  - Assignment Status (badge)
  - Assignment Status Update Notes (Text)
  - Assigned At (date/time)
  - Submitter (name + email)
  - **Action**: View, Accept, Decline

- View Action navigates to:
  - `/submissions/:id`

- Accept/Reject action will call the status update endpoint per spec. Applicable for ASSIGNED statuses only.

---

## Pagination Requirements

- Pagination is required (page / limit)
- Provide navigation controls:
  - previous / next
  - current page indicator

---

## Navigation Behavior

- Clicking **View Submission** opens:
  - `/submissions/:id`

---

## States

- Loading (initial load)
- Loading (pagination / filter / sort change)
- Empty:
  - Message: “No review assignments available.”
- Error (API failure)
- Forbidden:
  - Non-REVIEWER attempting to access this page

---

## Access Control Rules

- Only REVIEWER can access this page.
- REVIEWER sees only assignments linked to their account.
- ADMIN and USER must not see navigation entry or access this route.
