# Change Password

## Route

- Path: `/me/change-password`
- Access: Authenticated (USER / REVIEWER / ADMIN)
- Mode: Update

## Purpose

- Allow an authenticated user to change their password.

## API

- `PUT /api/v1/auth/me/password`
- Trigger: Form submission
- Payload: As defined in Auth API spec

## Form Fields

| Field                | Type     | Required |
| -------------------- | -------- | -------- |
| Current Password     | Password | Yes      |
| New Password         | Password | Yes      |
| Confirm New Password | Password | Yes      |

## Behavior

- Validation:
  - Add New Password === Confirm New Password validation
- On success:
  - Show success message
  - Navigate to `/me`
- On error:
  - Show backend error message

## States

- Loading
- Error
- Success
