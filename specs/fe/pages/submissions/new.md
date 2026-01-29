# Submissions — New

## Route

- Path: `/submissions/new`
- Access: USER
- Mode: Create

---

## Purpose

- Allow USER to create a new submission.
- Collect required metadata and initial submission file.
- Associate the submission with a conference.

---

## API

### Create Submission

- `POST /api/v1/submissions`
- Trigger: Form submission
- Request body: As defined in Submission API spec

### Supporting Data (if applicable)

- Conference list:
  - `GET /api/v1/conferences`
  - Trigger: Page load
  - Purpose: Populate conference selection

- Topics list:
  - `GET /api/v1/reference-data/topics`
  - Trigger: Page load
  - Purpose: Populate topics selection

---

## UI Requirements

- Layout: **form view**

### Fields

**Submission Metadata**

- Title (text, required)
- Topics (multi-select, derived from string[])
- Conference (select, required)
- Submission file (single file, required)
  - Accepted types and size: as enforced by backend (see constants.js, FILE_BUCKETS.submissions)
- Message (Optional)

**Actions**

- Primary: Submit
- Secondary: Cancel (navigate back to `/submissions`)

---

## Form Behavior

- All required fields must be provided before submission.
- Submit button disabled until all required fields provided.
- Submit action triggers submission creation API.
- While submitting:
  - Disable Submit button
  - Show loading indicator

---

## Post-Submit Behavior

### On Success

- Navigate to newly created submission detail page:
  - `/submissions/:id`
- Show success message:
  - “Submission created successfully.”

### On Validation Error

- Show validation messages (if provided by API).
- Preserve entered form values.

### On Error

- Show error message:
  - "Failed to create submission"
- Stay on the form.

---

## Access Control Rules

- Only USER can access this page.
- ADMIN and REVIEWER must not see navigation entry or access this route.

---

## States

- Loading (initial load, e.g., conference list)
- Loading (form submission)
- Error (API failure)
