# Review Assignments API

Base Path: **/api/v1/review-assignments**

---

## 1. Get All Review Assignments

**GET /**
Access: ADMIN

### Request Params

Optional:

- limit _(default to 10)_
- page _(default to 1)_

Example:

```perl
/api/v1/review-assignments?page=2&limit=10
```

## 2. Get My Review Assignments

**GET /me**
Access: REVIEWER

### Request Params

Optional:

- limit _(default to 10)_
- page _(default to 1)_

Example:

```perl
/api/v1/review-assignments/me?page=2&limit=10
```

## 3. Save Review Assignment

**POST /review-assignments**
Access: ADMIN

### Request Body

Required:

- contentSubmissionId (integer)
- reviewerUsrId (integer)

Optional:

- assignedByNotes (string)

Example:

```json
{
  "contentSubmissionId": 13,
  "reviewerUsrId": 19,
  "assignedByNotes": "Please review this"
}
```

## 4. Update Review Assignment Status

**PUT /:id/status**  
Access: ADMIN / REVIEWER

### Request Body

Required:

- status (integer)

Example:

```json
{
  "status": 1
}
```
