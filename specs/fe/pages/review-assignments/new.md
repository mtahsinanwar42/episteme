# Review Assignments - New

## Route

- Path: `/review-assignments/new`
- Access: ADMIN
- Mode: Create

---

## Purpose

- Allow ADMIN to assign a submission to a reviewer.
- Capture optional notes for the reviewer during assignment.
- Capture required assignment due date.

---

## API

### Create Review Assignment

- `POST /api/v1/review-assignments`
- Trigger: form submission
- Request body:
  - `contentSubmissionId` (required)
  - `reviewerUsrId` (required)
  - `assignedByNotes` (optional)
  - `dueAt` (required date value)

### Supporting Data (if applicable)

- Submissions list:
  - `GET /api/v1/submissions`
  - Purpose: populate submission selection.
- Reviewers list:
  - `GET /api/v1/users`
  - Purpose: populate reviewer selection.

---

## UI Requirements

- Layout: form view

### Fields

- Submission (select, required)
  - Maps to `contentSubmissionId`
- Reviewer (select, required)
  - Maps to `reviewerUsrId`
- Due Date (required date input)
  - Maps to `dueAt`
  - Must be current date or future date
- Notes for Reviewer (text area, optional)
  - Maps to `assignedByNotes`

### Actions

- Primary: Assign
- Secondary: Cancel (navigate back to `/review-assignments`)

---

## Form Behavior

- Required fields must be provided before submission.
- `dueAt` validation blocks past dates.
- Submit action triggers review assignment creation API.
- While submitting:
  - Disable submit action.
  - Show loading indicator.

---

## Post-Submit Behavior

### On Success

- Navigate to:
  - `/review-assignments`
- Show success message:
  - `Review assignment created successfully.`

### On Validation Error

- Show field-level validation messages (if provided by API).
- Preserve entered form values.

### On Error

- Show error message:
  - `Failed to create review assignment.`
- Allow retry.

---

## States

- Loading (initial load of submissions/reviewers)
- Loading (form submission)
- Error (API failure)
- Forbidden:
  - non-ADMIN attempting to access this page

---

## Access Control Rules

- Only ADMIN can access this page.
- REVIEWER and USER must not see navigation entry or access this route.
