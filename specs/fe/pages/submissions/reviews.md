# Submissions — Reviews

## Route

- Route: `/submissions/:id/reviews`
- Access:
  - REVIEWER
  - ADMIN
- Mode:
  - REVIEWER: View + Create (for submissions of PENDING_APPROVAL or RETURNED status)
  - ADMIN: View (read-only)

---

## Purpose

- Display reviews associated with a submission.
- Allow REVIEWER to submit a review for a submission.
- Allow ADMIN to view all reviewer feedback and recommendations.

---

## API

### Fetch Reviews

- `GET /api/v1/submissions/:id/reviews`
- Trigger: Page load
- Sort: Descending by `createdAt` (latest first)

### Create Review (REVIEWER only)

- `POST /api/v1/submissions/:id/reviews`
- Trigger: Add Review action
- Request body: As defined in Review API spec
- Applicable for submissions of PENDING_APPROVAL or RETURNED status

### Create Reviewer Version (conditional)

- `POST /api/v1/submissions/:id/versions`
- Trigger: Review submission when reviewer uploads a reviewed file
- Purpose: Create reviewer version before creating review

---

## UI Requirements

### Reviews List

- Layout: **table view**
- Default order: latest review first

---

## Role-Based Behavior

### REVIEWER

#### Reviews List

- Display only reviews created by the logged-in reviewer.

**Columns:**

- Reviewed Version
  - File name with downloadable hyperlink
- Reviewed Version Created At (date/time)
- Reviewer Version (file link, optional)
- Reviewer Version Created At (date/time, optional)
- Reviewer Version Change Log / Notes
- Recommendation
- Comments

---

#### Add New Review

- Display **“Add Review”** button below the reviews list.
- Action opens a modal for review submission.

##### Modal Fields

- Submission File (optional)
  - Single file upload
  - Accepted types and max size: as enforced by backend
- Change Log / Notes (optional)
- Recommendation (required)
- Comments (optional)

##### Submit Behavior

- If **Submission File** and/or **Change Log / Notes** are provided:
  1. Call `POST /api/v1/submissions/:id/versions`
  2. Capture `reviewerContentSubmissionVersionId` from response
- Then:
  - Call `POST /api/v1/submissions/:id/reviews`
  - Include `reviewerContentSubmissionVersionId` if a reviewer version was created

##### Post-Submit Behavior

- On success:
  - Close modal
  - Refresh reviews list
  - Show success message: “Review submitted successfully.”
- On validation error:
  - Show field-level errors (if provided by API)
  - Preserve entered values
- On error:
  - Show error message: “Failed to submit review.”
  - Allow retry

---

### ADMIN

#### Reviews List

- Display reviews submitted by all reviewers.

**Columns (minimum; dev may add more from API response):**

- Reviewer (name + email)
- Reviewed Version
  - File name with downloadable hyperlink
- Reviewed Version Created At (date/time)
- Reviewer Version (file link, optional)
- Reviewer Version Created At (date/time, optional)
- Reviewer Version Change Log / Notes
- Recommendation
- Comments

- Reviews are read-only for ADMIN.

---

## States

- Loading (initial reviews load)
- Loading (review submission)
- Empty:
  - Message: “No reviews available.”
- Error (API failure)
- Forbidden:
  - USER attempting to access Reviews tab
  - ADMIN attempting to add a review

---

## Access Control Rules

- REVIEWER:
  - Can view and submit reviews only for assigned submissions.
  - Can see only their own reviews.
- ADMIN:
  - Can view all reviews.
  - Must not see controls to add or edit reviews.
