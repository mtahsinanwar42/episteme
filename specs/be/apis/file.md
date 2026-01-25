# File API

Base Path: **/api/v1/files**

---

## 1. Get Files

**GET /**
Access: ADMIN

### Request Params

Optional:

- select _(fields to be displayed)_
- sort _[e.g. (+|-)fieldName]_
- limit _(default to 10)_
- page _(default to 1)_
- paginate _(default to true)_

Example:

```perl
/api/v1/files?select=id,name,storageKey,createdAt&sort=-createdAt&paginate=false
```

---

## 2. Get File By ID

**GET /:id**
Access: Authenticated

### Path Variables

Required:

- id

## 3. Upload File

**GET /:bucket**  
Access: Authenticated

### Path Variables

Required:

- bucket

### Request Body

Required:

- file (file)

## 4. Download File

**GET /download**  
Access: Authenticated

### Request Params

Required:

- path

Example:

```perl
/api/v1/files/download?path=storage/public/assets/announcement_86118a3b_20260119T113104_274.json
```
