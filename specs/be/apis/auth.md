# Auth API

Base Path: **/api/v1/auth**

---

## 1. Login

**POST /login**
Access: Public

### Request Body

Required:

- email (string)
- password (string)

Example:

```json
{
  "email": "admin@episteme.org",
  "password": "admin"
}
```

Response (success):

- `success: true`
- `token` (JWT string)

---

## 2. Register

**POST /register**  
Access: Public

### Request Body

Required:

- firstName (string)
- lastName (string)
- email (string)
- password (string)
- institution (string)
- occupation (string)
- country (string)

Optional:

- phone (string)
- linkedinUrl (string)
- roles (string[])

Example:

```json
{
  "firstName": "Reviewer",
  "lastName": "3",
  "email": "reviewer.3@gmail.com",
  "password": "reviewer",
  "phone": "+31616849001",
  "institution": "Episteme University",
  "occupation": "Student",
  "country": "Bangladesh",
  "linkedinUrl": "https://www.linkedin.com/in/john-doe",
  "roles": ["USER"]
}
```

Response (success):

- `success: true`
- `token` (JWT string)

---

## 3. Get Current User

**GET /me**  
Access: Authenticated

### Request Body

None

---

## 4. Logout

**GET /logout**  
Access: Authenticated

Response:

- `success: true`
- `data: {}`

---

## 5. Update My Details

**PUT /me/details**
Access: Authenticated

### Request Body

All fields are optional. Only provided fields will be updated.

Optional:

- firstName (string)
- lastName (string)
- phone (string)
- institution (string)
- occupation (string)
- country (string)
- linkedinUrl (string)
- photoFilePath
- cvFilePath

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
  "cvFilePath": "storage/private/cvs/cv_m_tahsin_anwar_oct_2025_4b9e76d7_20260118T224158_601.pdf"
}
```

---

## 6. Update My Password

**PUT /me/password**  
Access: Authenticated

### Request Body

Required:

- currentPassword (string)
- newPassword (string)

Example:

```json
{
  "currentPassword": "admin",
  "newPassword": "admin"
}
```

Response (success):

- `success: true`
- `token` (rotated JWT)

---

## 7. Forgot Password

**POST /forgotPassword**  
Access: Public

### Request Body

Required:

- email (string)

Example:

```json
{
  "email": "admin@episteme.org"
}
```

---

## 8. Reset Password

**PUT /resetPassword/:resetToken**  
Access: Public

### Request Body

Required:

- password (string)

Example:

```json
{
  "password": "admin"
}
```

Response (success):

- `success: true`
- `token` (JWT)
