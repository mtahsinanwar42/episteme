# Conferences API

Base Path: **/api/v1/conferences**

---

## 1. Get Conferences

**GET /**
Access: Public

### Request Params

Optional:

- select _(fields to be displayed)_
- sort _[e.g. (+|-)fieldName]_
- limit _(default to 10)_
- page _(default to 1)_
- paginate _(default to true)_

Example:

```perl
/api/v1/conferences?paginate=false
```

---

## 2. Get Conferences By ID

**GET /:id**
Access: Public

### Path Variables

Required:

- id

## 3. Get Conference Publications By ID

**GET /:id/publications**
Access: Public

### Path Variables

Required:

- id

## 4. Save Conference

**POST /**  
Access: ADMIN

### Request Body

Required:

- title (string)
- slug (string)
- startAt (date)
- endAt (date)
- submissionPeriodStartAt (date)
- submissionPeriodEndAt (date)
- metadataFilePath (string)
- status (integer)

Example:

```json
{
  "title": "episteme conference",
  "slug": "episteme-2026",
  "startAt": "2026-05-10",
  "endAt": "2026-05-15",
  "submissionPeriodStartAt": "2026-04-15",
  "submissionPeriodEndAt": "2026-04-30",
  "metadataFilePath": "storage/public/assets/test_9f86d081_20260118T224545_301.json",
  "status": 1
}
```

## 5. Update Conference

**PUT /:id**  
Access: ADMIN
Notes: Cannot update DELETED/FINISHED conference.

### Request Body

Optional:

- title (string)
- slug (string)
- startAt (date)
- endAt (date)
- submissionPeriodStartAt (date)
- submissionPeriodEndAt (date)
- metadataFilePath (string)
- status (integer)

Example:

```json
{
  "title": "episteme conference",
  "slug": "episteme-2026",
  "startAt": "2026-05-10",
  "endAt": "2026-05-15",
  "submissionPeriodStartAt": "2026-04-15",
  "submissionPeriodEndAt": "2026-04-30",
  "metadataFilePath": "storage/public/assets/test_9f86d081_20260118T224545_301.json",
  "status": 1
}
```

## 5. Update Conference Status

**PUT /:id/status**  
Access: ADMIN
Notes: Cannot update DELETED/FINISHED conference.

### Request Body

Required:

- status (integer)

Example:

```json
{
  "status": 1
}
```
