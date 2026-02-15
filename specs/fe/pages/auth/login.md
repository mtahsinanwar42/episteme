# login.md

# Login

## Route

- Path: `/login`
- Access: Public

## Purpose

- Authenticate a user and establish a session by the cookie `token`.

## API

- `POST /api/v1/auth/login`
- Trigger: Form submission
- Payload: As defined in Auth API spec

## Form Fields

| Field    | Type     | Required |
| -------- | -------- | -------- |
| Email    | Text     | Yes      |
| Password | Password | Yes      |

## Behavior

- On success:
  - Store authentication token
  - Redirect to `redirectUrl` query param (if provided and safe), otherwise `/`
  - Keep the **user** object in global storage, by calling `GET /api/v1/auth/me` on success of this request.
- On error:
  - Display backend error message

## States

- Loading (submit)
- Error
