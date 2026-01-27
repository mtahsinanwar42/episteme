# Review Assignments — All Assignments

## Route

- Path: `/review-assignments`
- Access: ADMIN
- Mode: View + partial update (assignment status)

---

## Purpose

- Display a list of all review assignments across submissions.
- Allow ADMIN to monitor and manage reviewer assignment status.
- Allow ADMIN to navigate to submission detail pages.

---

## API

### Fetch Review Assignments

- `GET /api/v1/review-assignments`
- Trigger: Page load + pagination / filter / sort changes
- Query params: As defined in Reviewer Assignment API spec

### Update Assignment Status

- `PUT /api/v1/review-assignments/:id/status`
- Trigger: Assignment status update action
- Request body: As defined in Reviewer Assignment API spec

---

## UI Requirements

- Layout: **table view**
- Columns (minimum; dev may add more from API response):
  - Submission Title (text)
  - Submission Status (badge)
  - Conference (text)
  - Reviewer (name + email)
  - Assignment Status (badge)
  - Assignment Status Update Notes (Text)
  - Assigned By (name + email)
  - Assigned At (date/time)
  - Submitter (name + email)
  - **Action**: View
  - **Action**: Update Status

- **View** action navigates to:
  - `/submissions/:id`

---

## Assignment Status Update

- Provide a status update control (maybe a modal) per row:
  - Assignment Status — single select
    - Allowed values: as defined in Review Assignment API spec
  - Status Update Notes (Optional) - Text
    - Shown for ADMIN only
- Updating status triggers:
  - `PUT /api/v1/review-assignments/:id/status`

### Status Update Behavior

- While updating:
  - Disable the status control for that row
  - Show loading indicator
- On success:
  - Update the status badge in the table
  - Show success message: “Assignment status updated.”
- On error:
  - Revert to previous status
  - Show error message: “Failed to update assignment status.”

---

## Pagination Requirements

- Pagination is required (page / limit)
- Provide navigation controls:
  - previous / next
  - current page indicator

---

## Navigation Behavior

- Clicking **View** opens:
  - `/submissions/:id`

---

## States

- Loading (initial load)
- Loading (pagination / filter / sort change)
- Loading (assignment status update)
- Empty:
  - Message: “No review assignments found.”
- Error (API failure)
- Forbidden:
  - Non-ADMIN attempting to access this page

---

## Access Control Rules

- Only ADMIN can access this page.
- ADMIN can view and update all review assignments.
- REVIEWER and USER must not see navigation entry or access this route.
