# Conferences — List

## Route

- Path: `/conferences`
- Access: Public (View) + ADMIN (extra actions)
- Mode: View (read-only) + partial update (ADMIN only: status)

## Purpose

- Display a paginated list of conferences for public users.
- Allow navigation to a conference detail page.
- Allow ADMIN to update conference status from the list.

## API

- `GET /api/v1/conferences`
- Trigger: Page load + pagination changes
- Query params: As defined in Conferences API spec
- ADMIN action:
  - `PUT /api/v1/conferences/:id/status` (update status)

## UI Requirements

- Layout: **card-based list** (no table)
  - Multiple rows of cards allowed (responsive grid or stacked, dev choice)
- Each card displays (minimum):
  - Title (text)
  - Status (badge; numeric-to-label mapping, can be found in utils/constants.js)
  - Start Date (date)
  - End Date (date)
  - Submission Start Date (date)
  - Submission End Date (date)
  - Created At (date/time)
- Card click navigates to: `/conferences/:id`

## Admin Enhancements

- If role includes `ADMIN`, show an additional action area on each card:
  - Status update control — single select (integer, numeric-to-label mapping in utils/constants.js)
  - Save/Apply action triggers: `PUT /api/v1/conferences/:id/status`

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
- Loading (status update for ADMIN)
- Success (status update for ADMIN)
