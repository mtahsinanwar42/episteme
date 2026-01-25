# Register

## Route

- Path: `/register`
- Access: Public
- Mode: Create account

## Purpose

- Allow a new user to create an account.

## APIs

- `POST /api/v1/auth/register`
- Trigger: Form submission
- Payload: As defined in Auth API spec

- Can get countries list from `GET /api/v1/reference-data/countries` API

## Form Fields

| Field        | Type                          | Required               |
| ------------ | ----------------------------- | ---------------------- |
| First Name   | Text                          | Yes                    |
| Last Name    | Text                          | Yes                    |
| Email        | Text                          | Yes                    |
| Password     | Password                      | Yes                    |
| Institution  | Text                          | Yes                    |
| Occupation   | Text                          | Yes                    |
| Country      | Single Select                 | Yes                    |
| Phone        | Text                          | No                     |
| LinkedIn URL | Text                          | No                     |
| Roles        | Multi-Select (User, Reviewer) | Yes, User pre-selected |

## UI Requirements

- Registration form with required and optional fields
- Primary action: Register
- Secondary link: Login → `/login`

## States

- Loading (on submit)
- Error (registration failed)
- On Success
  - for User, show account created message (can form proper messages on your own)
  - for Reviewer, show request submitted message (can form proper messages on your own)

- On Error, show backend validation/ error message.
