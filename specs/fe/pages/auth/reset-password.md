# Reset Password

## Route

- Path: `/reset-password/:resetToken`
- Access: Public
- Mode: Create new password

## Purpose

- Allow a user to reset their password using a reset token.

## API

- `PUT /api/v1/auth/resetPassword/:resetToken`
- Trigger: Form submission
- Payload: As defined in Auth API spec

## Form Fields

| Field                | Type     | Required |
| -------------------- | -------- | -------- |
| New Password         | Password | Yes      |
| Confirm New Password | Password | Yes      |

## Behavior

- Validation:
  - Add New Password === Confirm New Password validation
- On success:
  - Show success message
  - Redirect to `/login`
- On error:
  - Show backend error (invalid/expired token)

## States

- Loading
- Error
- Success
