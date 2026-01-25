# Users — Detail

## Route

- Path: `/users/:id`
- Access: ADMIN
- Mode: View + Update (form)

## Purpose

- Show a single user’s details.
- Allow ADMIN to update user fields according to API spec.

## API

- `GET /api/v1/users/:id` (page load)
- `PUT /api/v1/users/:id` (save changes)
- Optional (if status is updated separately in UI):
  - `PUT /api/v1/users/:id/status`
- File upload (if CV/photo are uploaded via file endpoint):
  - Use the project’s file upload endpoint/workflow to obtain `cvFilePath` and/or `photoFilePath`
- Can get countries list from `GET /api/v1/reference-data/countries` API

## Form Fields (updatable per API spec)

- Email — text
- Password — password
- First Name — text
- Last Name — text
- Phone — text
- Institution — text
- Occupation — text
- Country — single select
- Status — single select (integer, numeric-to-label mapping, can be found in utils/constants.js)
- Roles — multi select (string[])
- LinkedIn URL — text
- Profile Photo — file upload (sets `photoFilePath`)
- CV — file upload (sets `cvFilePath`)

## Behavior

- Show existing user data on load.
- Save updates triggers `PUT /api/v1/users/:id`.
- No delete action is required.
- Not found:
  - Invalid id / 404 shows Not Found state.

## States

- Loading (initial)
- Loading (save)
- Error (fetch or save)
- Not found (invalid id / 404)
- Success (save)
