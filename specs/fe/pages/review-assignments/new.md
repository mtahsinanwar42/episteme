# Review Assignments — New

## Route

- Path: `/review-assignments/new`
- Access: ADMIN
- Mode: Create

---

## Purpose

- Allow ADMIN to assign a submission to a reviewer.
- Capture optional notes for the reviewer during assignment.
- Create a new review assignment for a submission.

---

## API

### Create Review Assignment

- `POST /api/v1/review-assignments`
- Trigger: Form submission
- Request body: As defined in Review Assignment API spec

### Supporting Data (if applicable)

- Submissions list:
  - `GET /api/v1/submissions`
  - Purpose: Populate submission selection, PENDING APPROVAL + RETURNED ones.
- Reviewers list:
  - `GET /api/v1/users`
  - Purpose: Populate reviewer selection

> Query params tweaking needed.

---

## UI Requirements

- Layout: **form view**

### Fields

- Submission (select, required)
  - Represents `contentSubmissionId`
- Reviewer (select, required)
  - Represents `reviewerUsrId`
- Notes for Reviewer (text area, optional)
  - Represents `assignedByNotes`

**Actions**

- Primary: Assign
- Secondary: Cancel (navigate back to `/review-assignments`)

---

## Form Behavior

- All required fields must be provided before submission.
- Submit action triggers review assignment creation API.
- While submitting:
  - Disable submit action
  - Show loading indicator

---

## Post-Submit Behavior

### On Success

- Navigate to:
  - `/review-assignments`
- Show success message:
  - “Review assignment created successfully.”

### On Validation Error

- Show field-level validation messages (if provided by API).
- Preserve entered form values.

### On Error

- Show error message:
  - “Failed to create review assignment.”
- Allow retry.

---

## States

- Loading (initial load of submissions / reviewers)
- Loading (form submission)
- Error (API failure)
- Forbidden:
  - Non-ADMIN attempting to access this page

---

## Access Control Rules

- Only ADMIN can access this page.
- ADMIN can assign any submission to any reviewer.
- REVIEWER and USER must not see navigation entry or access this route.
