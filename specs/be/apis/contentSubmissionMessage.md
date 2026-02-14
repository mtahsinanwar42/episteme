# Content Submission Messages API

Base Path: **/api/v1/submissions/:id/messages**

## Visibility Scopes

- `USER_ADMIN`
- `ADMIN_REVIEWER`

## 1. Get Submission Messages

**GET /**
Access: USER, REVIEWER, ADMIN

Path params:

- `id` (submission id)

Response:

- `success`
- `data[]` where each row includes:
  - `messageId`, `createdAt`, `visibilityScope`, `message`
  - `sender` (`id`, `email`, `firstName`, `lastName`, `userType`)
  - `receiver` (`id`, `email`, `firstName`, `lastName`) when present

## 2. Save Submission Message

**POST /**
Access: USER, REVIEWER, ADMIN

Request body:

- `message` (required string)
- `scope` (required, one of visibility scopes)
- `receiverUsrId` (required for ADMIN)

Example (reviewer to admin):

```json
{
  "message": "I will submit my review tomorrow.",
  "scope": "ADMIN_REVIEWER"
}
```

Rules:

- Submission must be in PENDING_APPROVAL or RETURNED.
- USER can only use `USER_ADMIN` scope and only on owned submission.
- REVIEWER can only use `ADMIN_REVIEWER` scope and only with ACCEPTED assignment.
- ADMIN must provide `receiverUsrId`:
  - if `scope=USER_ADMIN`, receiver must be submission owner
  - if `scope=ADMIN_REVIEWER`, receiver must be an ACCEPTED assigned reviewer
