# Submissions — Detail

## Route

- Path: `/submissions/:id`
- Access:
  - USER
  - REVIEWER
  - ADMIN
- Mode: View + partial update (status/statusUpdateNotes for ADMIN)

---

## Purpose

- Display detailed information about a submission.
- Provide access to related sections in Tabs: Versions, Messages, Reviews.
- Allow ADMIN to update submission status and statusUpdateNotes.
- Allow role-based interaction with submission-related data.

---

## API

### Fetch Submission Details

- `GET /api/v1/submissions/:id`
- Trigger: Page load
- Purpose: Fetch submission metadata and current state

### Status Update (ADMIN only)

- `PUT /api/v1/submissions/:id/status`
- Trigger: Status update action (maybe a modal)
- Request body: As defined in Submission API spec

---

## Page Structure

### Section 1: Submission Metadata

Display submission-level information in a read-only format (unless specified).

**Fields**

- Title (text)
- Topics (text, derived from string[])
- Conference (text)
- Status (badge)
- Status Update Notes (field shown if not null)
- Owner (name & email — ADMIN only)
- Created At (date/time)
- Updated At (date/time)

**Actions**

- Status Update (ADMIN only). Shown for submissions of PENDING_APPROVAL or RETURNED status
  - Opens status update control (inline or modal)
  - Triggers submission status update API
- DOI Update (ADMIN only). Shown for submissions of APPROVED status.
  - Opens DOI update control (inline/modal)
  - Triggers submission DOI update API

---

### Section 2: Submission Details (Tabbed View)

Provide a tabbed interface below the metadata section.

**Tabs**

- Versions (USER / REVIEWER / ADMIN)
- Messages (USER / REVIEWER / ADMIN)
- Reviews (REVIEWER/ADMIN)

> Tabs must be shown/hidden based on user role.

---

## Tab Behavior (High-Level)

### Versions Tab

- Displays submission versions.
- Supports uploading a new version.
- New version upload may be handled via modal.
- Detailed behavior defined in: `versions.md`

### Messages Tab

- Displays submission-related messages.
- Supports adding new messages.
- Detailed behavior defined in: `messages.md`

### Reviews Tab

- Visible to REVIEWER/ADMIN.
- Displays reviews and recommendations.
- Supports adding a new review.
- Detailed behavior defined in: `reviews.md`

---

## Navigation & Deep Linking

- Direct navigation to `/submissions/:id` must load:
  - Submission metadata
  - Default active tab (Versions)
- Tab selection will update URL
- Switching tabs does not reload the entire page.

---

## Access Control Rules

- USER:
  - Can view submission details for own submissions only.
  - Cannot update submission status.
- REVIEWER:
  - Can view submission details for assigned submissions only.
  - Can access Versions, Messages, and Reviews tabs.
- ADMIN:
  - Can view all submissions.
  - Can update submission status _(for PENDING_APPROVAL or RETURNED submissions)_.
  - Can update DOI _(for APPROVED submissions)_
  - Can view owner information.

---

## States

- Loading (initial page load)
- Loading (status update action)
- Error (submission not found or API failure)
- Forbidden (user does not have access to this submission)
