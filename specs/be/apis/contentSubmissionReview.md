# Content Submission Reviews API

Base Path: **/api/v1/submissions/:id/reviews**

## Recommendation Enums

- `1` ACCEPTED
- `2` REJECTED
- `3` NEEDS_REVISION

## 1. Get Submission Reviews

**GET /**
Access: REVIEWER, ADMIN

Path params:

- `id` (submission id)

Response:

- `success`
- `data[]` rows include:
  - `reviewId`, `createdAt`, `comment`, `recommendation`, `contentReviewAssignmentId`
  - `reviewer` (`id`, `email`, `firstName`, `lastName`)
  - `version` (`versionId`, `versionNo`, `createdAt`, `changeLog`, `file`)
  - `reviewerVersion` (same shape, nullable)

Visibility:

- REVIEWER receives only own reviews for that submission.
- ADMIN receives all reviews for that submission (except own submissions are excluded by access query).

## 2. Save Submission Review

**POST /**
Access: REVIEWER

Request body:

- `recommendation` (required integer enum)
- `comment` (optional nullable text)
- `reviewerContentSubmissionVersionId` (optional integer)

Example:

```json
{
  "recommendation": 1,
  "comment": "Looks good overall.",
  "reviewerContentSubmissionVersionId": 27
}
```

Rules:

- Submission must be in PENDING_APPROVAL or RETURNED.
- Reviewer must have ACCEPTED assignment for the submission and assignment due date must not be passed.
- If `reviewerContentSubmissionVersionId` is provided, it must reference a version uploaded by REVIEWER.

Side effect:

- Assignment status is updated to COMPLETED when review is created.
