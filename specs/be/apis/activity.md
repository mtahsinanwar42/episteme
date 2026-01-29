# Announcements API

Base Path: **/api/v1/activities**

---

## 1. Get Activities

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
/api/v1/activities?select=id,title,status,createdAt&sort=-createdAt&limit=5&page=1
```

---

## 2. Get Activities By ID

**GET /:id**
Access: Public

### Path Variables

Required:

- id

## 3. Save Activity

**POST /**  
Access: ADMIN

### Request Body

Required:

- title (string)
- metadataFilePath (string)
- status (integer)

Example:

```json
{
  "title": "New Activity!",
  "metadataFilePath": "storage/public/assets/training_c2fb788c_20260119T113052_398.json",
  "status": 1
}
```

## 4. Update Activity

**PUT /:id**  
Access: ADMIN
Notes: Cannot update DELETED activity

### Request Body

Optional:

- title (string)
- metadataFilePath (string)
- status (integer)

Example:

```json
{
  "title": "New Activity !",
  "metadataFilePath": "storage/public/assets/training_c2fb788c_20260119T113052_398.json",
  "status": 1
}
```
