# Asset Details

## Route

- Path: `/assets/:fileId`
- Access: ADMIN
- Mode: View + Download

## Purpose

- Display metadata for one uploaded asset.
- Allow file download using the stored `storageKey`.

## API

- `GET /api/v1/files/:id` (page load)
- `GET /api/v1/files/download?path=<storageKey>` (download action)

## States

- Loading overlay during initial fetch
- Error panel for failed fetch
- Not found state when payload is empty
