# Submissions — Versions

## Route

- Route: `/submissions/:id/versions`
- Access:
  - USER
  - REVIEWER
  - ADMIN
- Mode: View + Create (role-based, for submissions of PENDING_APPROVAL or RETURNED status)

---

## Purpose

- Display submission version history.
- Allow USER and ADMIN to upload new versions.
- Provide role-based visibility into submission versions.

---

## API

### Fetch Versions

- `GET /api/v1/submissions/:id/versions`
- Trigger: Page load
- Sort: Descending by version number (latest first)

### Create New Version (USER / ADMIN)

- `POST /api/v1/submissions/:id/versions`
- Applicable for submissions of PENDING_APPROVAL or RETURNED status
- Trigger: Add New Version action
- Request body: As defined in Submission Version API spec

---

## UI Requirements

### Versions List

- Layout: **table view**
- Default order: latest version first

**Columns:**

- Version No (number)
- Change Log / Notes (text)
- Uploader (name + email)
- File (file name with downloadable hyperlink)
- Created At (date/time)

---

## Role-Based Visibility

### USER

- Can view:
  - Own uploaded versions
  - ADMIN-uploaded versions
- Latest version appears first.
- Can upload a new version if the status is PENDING_APPROVAL or RETURNED.

---

### REVIEWER

- Can view:
  - USER-uploaded versions only
- Latest version appears first.
- Cannot upload new versions.

---

### ADMIN

- Can view:
  - USER-uploaded versions
  - ADMIN-uploaded versions
- Latest version appears first.
- Can upload a new version if the status is PENDING_APPROVAL or RETURNED.

---

## Add New Version (USER / ADMIN)

### Action

- Display **“Add New Version”** button below the versions list if the submission status is PENDING_APPROVAL or RETURNED.
- Button opens a modal for version creation.

### Modal Fields

- Submission File (required)
  - Single file upload
  - Accepted file types and max size:
    - As enforced by backend (`FILE_BUCKETS.submissions`)
- Change Log / Notes (optional, text area)

### Submit Behavior

- On submit:
  - Call `POST /api/v1/submissions/:id/versions`
- While submitting:
  - Disable submit action
  - Show loading indicator

### Post-Submit Behavior

- On success:
  - Close modal
  - Refresh versions list
  - Show success message: “New version uploaded successfully.”
- On validation error:
  - Show field-level errors (if provided by API)
  - Preserve entered values
- On error:
  - Show error message: “Failed to upload new version.”
  - Allow retry

---

## States

- Loading (initial versions load)
- Loading (version upload)
- Empty:
  - Message: “No versions available.”
- Error (API failure)
- Forbidden:
  - REVIEWER attempting to upload a version

---

## Access Control Rules

- USER:
  - Can view and upload versions for own submissions only.
- REVIEWER:
  - Can view versions for assigned submissions only.
  - Must not see upload controls.
- ADMIN:
  - Can view and upload versions for all submissions.
