# Announcements — List

## Route

- Path: `/announcements`
- Access: Public
- Mode: View (read-only)

## Purpose

- Display a paginated list of announcements for public users.
- Allow navigation to an announcement detail page.
- Allow ADMIN to navigate to create a new announcement.

## API

- `GET /api/v1/announcements`
- Trigger: Page load + pagination changes

## UI Requirements

- Layout: **card-based list** (no table)
  - Multiple rows of cards allowed (responsive grid or stacked, dev choice)
- Each card displays (minimum):
  - Title (text)
  - Status (badge; numeric-to-label mapping, can be found in utils/constants.js)
  - Created At (date/time)
- Card click navigates to: `/announcements/:id`

## Pagination Requirements

- Pagination is required (page/limit)
- Provide navigation controls:
  - previous / next
  - current page indicator
- Default sort recommended: `-createdAt` (latest first)

## Admin Enhancements

- If role includes `ADMIN`, show:
  - “New Announcement” action button → `/announcements/new`

## States

- Loading (initial and page changes)
- Empty (no results)
- Error (API failure)
