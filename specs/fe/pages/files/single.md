# Files — Detail

## Route

- Path: `/files/:id`
- Access: Authenticated (as per API spec)
  - Note: Page is linked from ADMIN-only `/files`, so it is effectively ADMIN-facing unless navigation is expanded.
- Mode: View (read-only)

## Purpose

- Show a single file’s metadata.
- Provide a way to download the file if applicable.

## API

- `GET /api/v1/files/:id` (page load)
- Download (optional, if exposed in UI):
  - `GET /api/v1/files/download?path=<storageKey>` (uses `storageKey` from file metadata)

## Page Fields (read-only)

- Name (text)
- Storage Key (text)
- Created At (date/time)
- Additional metadata fields if returned by backend

## Behavior

- No edit/update actions on this page.
- If file download is shown:
  - Use `storageKey` as the `path` query param for the download endpoint.

## States

- Loading (initial)
- Error (fetch)
- Not found (invalid id / 404)
