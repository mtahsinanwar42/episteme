# Submissions - Reviews

## Route

- Route: `/submissions/:submissionId/reviews`
- Access:
  - REVIEWER
  - ADMIN
- Mode:
  - REVIEWER: View + Create (strictly conditional)
  - ADMIN: View only

## Purpose

- Show review records for a submission.
- Allow assigned reviewer to submit one review per current submission version.

## APIs

### Fetch Review Assignments (reviewer only)

- `GET /api/v1/review-assignments/search?submissionId=<id>&paginate=false`
- Used to determine reviewer access and add-review eligibility.

### Fetch Reviews

- `GET /api/v1/submissions/:id/reviews`
- Trigger: when page has access
- UI sorting: descending by `createdAt`

### Create Reviewer Version (optional)

- `POST /api/v1/submissions/:id/versions`
- Called only when reviewer uploads a file.

### Create Review

- `POST /api/v1/submissions/:id/reviews`

Request body:

```json
{
  "recommendation": 1,
  "comment": "optional",
  "reviewerContentSubmissionVersionId": 123
}
```

## Reviewer Eligibility to Add Review

Add Review button is visible only when all are true:

- Reviewer is non-owner and has assignment for this submission
- Assignment status is ACCEPTED and assignment due date/time is not passed
- Submission status is PENDING_APPROVAL or RETURNED
- Reviewer has not already submitted a review for `submission.currentContentSubmissionVersionId`

Info messages shown when blocked:

- `Review submission is only available for submissions with status Pending Approval or Returned.`
- `You cannot submit a review unless the assignment status is Accepted and not overdue.`
- `You already submitted a review for the current submission version. Add Review will be available after a new version is uploaded.`

## Table Columns

ADMIN columns:

- Reviewer (name + email)
- Reviewed Version (download)
- Reviewer Version (download, optional)
- Recommendation
- Actions (open review details modal)

REVIEWER columns:

- Reviewed Version (download)
- Reviewer Version (download, optional)
- Recommendation
- Actions (open review details modal)

## Add Review Modal

Fields:

- Recommendation (required)
- Comments (optional)
- Submission File (optional)
- Change Log / Notes (optional)

Validation:

- Recommendation required
- If Change Log / Notes is provided, reviewer file upload must exist

Behavior:

1. If file uploaded, create reviewer version first and capture `versionId` or `id` from response.
2. Submit review payload.
3. Refetch reviewer assignment data.
4. Show success toast: `Review submitted successfully.`

## Access Outcomes

- USER reaching this page: redirected to `/submissions/:submissionId/details`
- REVIEWER without assignment: in-page message `You do not have access to view reviews for this submission.`

## States

- Loading: reviews and reviewer assignment queries
- Empty: `No reviews available.`
- Error: API error text or fallback `Failed to load submission reviews.`
