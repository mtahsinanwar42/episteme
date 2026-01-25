# me.md

# My Profile

## Route

- Path: `/me`
- Access: Authenticated (USER / REVIEWER / ADMIN)
- Mode: View + Update inline

## Purpose

- View and update personal profile information.

## API

- `GET /api/v1/auth/me` (page load)
- `PUT /api/v1/auth/me/details` (save changes)
- Payload: As defined in Auth API spec

- Can get countries list from `GET /api/v1/reference-data/countries` API

## Profile Fields

| Field         | Type          | Editable |
| ------------- | ------------- | -------- |
| First Name    | Text          | Yes      |
| Last Name     | Text          | Yes      |
| Email         | Text          | No       |
| Password      | Password      | No       |
| Phone         | Text          | Yes      |
| Institution   | Text          | Yes      |
| Occupation    | Text          | Yes      |
| Country       | Single Select | Yes      |
| LinkedIn URL  | Text          | Yes      |
| Profile Photo | File Upload   | Yes      |
| CV            | File Upload   | Yes      |

## Behavior

- Default view is read-only
- Inline editing enabled for editable fields
- Save updates only modified fields
- Link to change password → `/me/change-password`, on the right of the Password field
- For File upload fields, call `POST /api/v1/files/upload/:bucket` _(bucket is **profile_photos** for **Profile Photo**, and **cvs** for **CV**)_ with the file, then append the **storageKey** from the response to the respective fields

## States

- Loading (initial)
- Loading (save)
- Error
- Success
