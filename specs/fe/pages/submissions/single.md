# Submissions - Detail Container

## Route

- Path: `/submissions/:submissionId`
- Redirect: index route redirects to `/submissions/:submissionId/details`
- Access:
  - USER
  - REVIEWER
  - ADMIN

## Purpose

- Render shared submission context (header + metadata + left navigation).
- Provide nested subpages:
  - Details
  - Messages
  - Versions
  - Reviews
- Host modal actions:
  - Status Update (ADMIN)
  - DOI Update (ADMIN)
  - Assign Reviewer (ADMIN)
  - Review Assignment Status Update (REVIEWER view)

## Navigation Model

Sidebar links:

- Details: `/submissions/:submissionId/details`
- Messages: `/submissions/:submissionId/messages`
- Versions: `/submissions/:submissionId/versions`
- Reviews: `/submissions/:submissionId/reviews` (conditionally shown)

Reviews link visibility:

- ADMIN: always visible
- REVIEWER (non-owner): visible only when reviewer has an assignment for this submission

## Shared Data Fetch

### Fetch Submission Details

- `GET /api/v1/submissions/:submissionId`
- Trigger: initial page load

### Fetch Reviewer Assignment (reviewer non-owner only)

- `GET /api/v1/review-assignments/search?submissionId=<id>&paginate=false`
- Purpose:
  - Determine Reviews tab visibility for reviewer
  - Populate assignment status badge and details modal

## Header Actions

Header shows submission title, submission status badge, conference link+badge, topics, abstract.

Action menu appears only for ADMIN and submission status in:

- PENDING_APPROVAL
- RETURNED
- APPROVED

Menu items:

- Update Status: only when status is DRAFT/PENDING_APPROVAL/RETURNED (effective in UI: PENDING_APPROVAL or RETURNED)
- Update DOI: only when status is APPROVED
- Assign Reviewer: only when status is PENDING_APPROVAL or RETURNED

### Status Update Modal (ADMIN)

- API: `PUT /api/v1/submissions/:submissionId/status`
- Editable fields:
  - `status` (required)
  - `statusUpdateNotes` (optional)
- Available target statuses in UI:
  - PENDING_APPROVAL
  - RETURNED
  - APPROVED
  - REJECTED
  - DELETED
- Success toast: `Submission status updated successfully.`

### Assign Reviewer Modal (ADMIN)

- APIs:
  - `GET /api/v1/submissions/:submissionId/reviewers?paginate=false` (existing assignees)
  - `GET /api/v1/users?roles=REVIEWER&status=ACTIVE&paginate=false` (candidate reviewers)
  - `POST /api/v1/review-assignments` (new assignment)
- Reviewer selection excludes:
  - Already assigned reviewers
  - Submission owner
- Required `dueAt` is included in create payload and must be current/future date.
- Optional `assignedByNotes` is included in create payload.
- Success toast: `Reviewer assigned successfully.`

## Details Subpage

Path: `/submissions/:submissionId/details`

Displays:

- DOI (if present)
- Submission status badge
- Status update notes (if present)
- Payment status (ADMIN only)
- Created/Updated timestamps
- Owner information card (ADMIN only)

## Access Summary

- USER:
  - Can open own submissions.
  - Does not get admin actions.
- REVIEWER:
  - Can open assigned submissions.
  - Sees assignment badge + assignment details modal.
  - Reviewer status update actions are additionally blocked when assignment due date/time is passed.
- ADMIN:
  - Can open non-owned submissions.
  - Can access status/DOI/reviewer assignment actions by status rules.

## States

- Loading: full page overlay while submission is being fetched
- Error: error panel with API message
- Not Found: redirects to `/404-not-found` when payload is empty
