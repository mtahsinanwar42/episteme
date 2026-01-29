# Content Submission Messages API

Base Path: **/api/v1/submissions/:id/messages**

---

## 1. Get Submission Messages

**GET /**
Access: USER/REVIEWER/ADMIN

### Path Variable

Required:

- id

## 2. Save Submission Message

**POST /**
Access: USER/ADMIN/REVIEWER
Notes: Can save PENDING_APPROVAL/RETURNED submission messages.

### Request Body:

Required:

- message (string)
- scope (string)

Optional:

- receiverUsrId (integer, required for ADMIN)

Example:

```json
{
  "message": "Hello Admin, I'll review next week!",
  "scope": "ADMIN_REVIEWER"
}
```
