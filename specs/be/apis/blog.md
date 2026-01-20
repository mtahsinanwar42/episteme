# Blogs API

Base Path: **/api/v1/blogs**

---

## 1. Get Blogs

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
/api/v1/blogs?select=id,title,status,createdAt&sort=-createdAt&limit=5&page=1
```

---

## 2. Get Blog By ID

**GET /:id**
Access: Public

### Path Variables

Required:

- id

## 3. Save Blog

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
  "title": "New Blog Announced!",
  "metadataFilePath": "storage/public/assets/training_c2fb788c_20260119T113052_398.json",
  "status": 1
}
```

## 4. Update Blog

**PUT /:id**  
Access: ADMIN

### Request Body

Optional:

- title (string)
- metadataFilePath (string)
- status (integer)

Example:

```json
{
  "title": "New Blog!",
  "metadataFilePath": "storage/public/assets/training_c2fb788c_20260119T113052_398.json",
  "status": 1
}
```
