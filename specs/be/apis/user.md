# User API

Base Path: **/api/v1/users**

---

## 1. Get Users

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
/api/v1/users?select=id,firstName,lastName,email,createdAt&sort=-createdAt&limit=10&page=1&roles[contains]=ADMIN
```

---

## 2. Get User By ID

**GET /:id**
Access: ADMIN

### Path Variables

Required:

- id

## 3. Save User

**POST /users**  
Access: ADMIN

### Request Body

Required:

- email (string)
- password (string)
- firstName (string)
- lastName (string)
- phone (string)
- institution (string)
- occupation (string)
- country (string)
- status (integer)

Optional:

- roles (string[])
- cvFilePath
- photoFilePath
- linkedinUrl

Example:

```json
{
  "firstName": "Reviewer",
  "lastName": "3",
  "email": "userreviewer@episteme.org",
  "password": "admin",
  "phone": "+31616849001",
  "institution": "Episteme University",
  "occupation": "Student",
  "country": "Bangladesh",
  "linkedinUrl": "https://www.linkedin.com/in/john-doe",
  "photoFilePath": "storage/public/profile_photos/rm-ooti_portretten_24-010_81c60f13_20260118T224237_779.jpg",
  "cvFilePath": "storage/private/cvs/cv_m_tahsin_anwar_oct_2025_4b9e76d7_20260118T224158_601.pdf",
  "status": 1,
  "roles": ["ADMIN"]
}
```

## 4. Update User

**PUT /users/:id**  
Access: ADMIN

### Path Variables

Required:

- id

### Request Body

Optional:

- email (string)
- password (string)
- firstName (string)
- lastName (string)
- phone (string)
- institution (string)
- occupation (string)
- country (string)
- status (integer)
- statusUpdateNotes (text)
- roles (string[])
- cvFilePath
- photoFilePath
- linkedinUrl

Example:

```json
{
  "firstName": "Reviewer",
  "lastName": "3",
  "phone": "+31616849001",
  "institution": "Episteme University",
  "occupation": "Student",
  "country": "Bangladesh",
  "linkedinUrl": "https://www.linkedin.com/in/john-doe",
  "photoFilePath": "storage/public/profile_photos/rm-ooti_portretten_24-010_81c60f13_20260118T224237_779.jpg",
  "cvFilePath": "storage/private/cvs/cv_m_tahsin_anwar_oct_2025_4b9e76d7_20260118T224158_601.pdf",
  "status": 1,
  "statusUpdateNotes": "Activated"
  "roles": ["ADMIN"]
}
```

## 5. Update User Status

**PUT /users/:id/status**  
Access: ADMIN

### Path Variables

Required:

- id

### Request Body

Required:

- status (integer)

Optional:

- statusUpdateNotes (text)

Example:

```json
{
  "status": 9,
  "statusUpdateNotes": "Deleted"
}
```
