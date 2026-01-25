# Files — List

## Route

- Path: `/files`
- Access: ADMIN
- Mode: View (read-only)

## Purpose

- Display a paginated list of uploaded files with metadata.
- Allow ADMIN to navigate to create/upload a new file.
- Allow navigation to a file detail page.

## API

- `GET /api/v1/files`
- Trigger: Page load + pagination changes
- Query params: As defined in Files API spec

## UI Requirements

- Show a list of file metadata (layout: table)
- Each item displays (minimum):
  - Name (text)
  - Storage Key (text)
  - Created At (date/time)
- Each item provides navigation to: `/files/:id`

## Pagination Requirements

- Follow API spec pagination (`page`, `limit`)
- Provide navigation controls:
  - previous / next
  - current page indicator
- Default sort recommended: `-createdAt` (latest first)

## Admin Enhancements

- “Add New File” link/button → `/files/new`

## States

- Loading (initial and page changes)
- Empty (no results)
- Error (API failure)
