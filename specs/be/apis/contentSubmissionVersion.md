# Content Submission Versions API

Base Path: **/api/v1/submissions/:id/versions**

---

## 1. Get Submission Versions

**GET /**
Access: USER/REVIEWER/ADMIN

### Path Variable

Required:

- id

## 2. Save Submission Version

**POST /**
Access: USER/ADMIN/REVIEWER

### Request Body:

Required:

- contentFilePath (string)

Optional:

- message (string)

Example:

```json
{
  "contentFilePath": "storage/private/papers/paper1_b32e94f6_20260119T003737_499.docx",
  "message": "hello, I've done the changes accordingly!"
}
```
