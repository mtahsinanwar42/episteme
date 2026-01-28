# Content Submission API

Base Path: **/api/v1/submissions**

---

## 1. Get Submissions

**GET /**
Access: USER/ADMIN

### Request Params

Optional:

- limit _(default to 10)_
- page _(default to 1)_

Example:

```perl
/api/v1/submissions?page=2&limit=10
```

## 2. Save Submission

**POST /**
Access: USER

### Request Body:

Required:

- title (string)
- conferenceId (integer)
- topics (string[])
- contentFilePath (string)

Optional:

- changeLog (string)

Example:

```json
{
  "title": "Graph Theory Unleashed",
  "conferenceId": 5,
  "topics": ["Graph"],
  "contentFilePath": "storage/private/submissions/paper1_b32e94f6_20260118T225541_911.docx",
  "message": "Please approve this for the conference 2026, I've really worked hard for it!."
}
```

## 3. Get Submission by ID

**GET /:id**
Access: USER/ADMIN/REVIEWER

### Path Variable

Required:

- id

## 4. Update Submission DOI

**PUT /:id/doi**
Access: ADMIN, for APPROVED submissions only.

### Request Body

Required:

- doi (text)

Example:

```json
{
  "doi": "XYZ"
}
```

## 5. Update Submission Status

**PUT /:id/status**
Access: ADMIN

### Request Body

Required:

- status (integer)

Optional:

- statusUpdateNotes (text)

Example:

```json
{
  "status": 1,
  "statusUpdateNotes": "Active"
}
```
