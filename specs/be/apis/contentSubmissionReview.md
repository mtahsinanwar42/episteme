# Content Submission Reviews API

Base Path: **/api/v1/submissions/:id/reviews**

---

## 1. Get Submission Reviews

**GET /**
Access: REVIEWER/ADMIN

### Path Variable

Required:

- id

## 2. Save Submission Review

**POST /**
Access: REVIEWER
Notes: Can save PENDING_APPROVAL/RETURNED submission reviews.

### Request Body:

Required:

- recommendation (integer)

Optional:

- comment (text)
- reviewerContentSubmissionVersionId (integer)

Example:

```json
{
  "reviewerContentSubmissionVersionId": 27,
  "comment": "Looks good, but needs some refactoring",
  "recommendation": 1
}
```
