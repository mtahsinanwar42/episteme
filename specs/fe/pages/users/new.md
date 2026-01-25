# Users — Create

## Route

- Path: `/users/new`
- Access: ADMIN
- Mode: Create

## Purpose

- Allow ADMIN to create a new user.

## API

- `POST /api/v1/users` (create)
- File upload (if CV/photo are uploaded via file endpoint):
  - Use the project’s file upload endpoint/workflow to obtain `cvFilePath` and/or `photoFilePath`
- Can get countries list from `GET /api/v1/reference-data/countries` API

## Form Fields

- First Name — text
- Last Name — text
- Email — text
- Password — password
- Phone — text
- Institution — text
- Occupation — text
- Country — single select
- Status — single select (integer, numeric-to-label mapping, can be found in utils/constants.js)
- Roles — multi select (string[])
- LinkedIn URL — text (optional)
- Profile Photo — file upload (sets `photoFilePath`, optional)
- CV — file upload (sets `cvFilePath`, optional)

## Behavior

- On success:
  - Show success message
  - Navigate to `/users`
- On error:
  - Show backend validation/error message

## States

- Loading (submit)
- Error
- Success
