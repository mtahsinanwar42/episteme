# Users — List

## Route

- Path: `/users`
- Access: ADMIN
- Mode: View (read-only) + partial update (status)

## Purpose

- Display a paginated list of users for ADMIN.
- Allow navigation to user detail page.
- Allow ADMIN to update user status from the list.

## API

- `GET /api/v1/users`
- Trigger: Page load + pagination/sort/filter changes
- Query params: As defined in User API spec
- Status update action:
  - `PUT /api/v1/users/:id/status`

## UI Requirements

- Layout: **table view**
- Columns (minimum; dev may add more from API response):
  - ID (text/number)
  - First Name (text)
  - Last Name (text)
  - Email (text)
  - Roles (text, derived from string[])
  - Status (badge)
  - Created At (date/time)
  - Updated At (date/time)
  - **Action**: Status update
- Row click or dedicated link navigates to: `/users/:id`

## Status Update (Action Column)

- Provide a status update control per row:
  - Status — single select (integer, numeric-to-label mapping, can be found in utils/constants.js)
  - Update action triggers: `PUT /api/v1/users/:id/status`

## Pagination Requirements

- Pagination is required (page/limit)
- Provide navigation controls:
  - previous / next
  - current page indicator
- Default sort recommended: `-createdAt` (latest first)

## States

- Loading (initial and page changes)
- Empty (no results)
- Error (API failure)
- Loading (status update)
- Success (status update)
