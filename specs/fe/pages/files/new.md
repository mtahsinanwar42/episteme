# New Asset

## Route

- Path: `/assets/new`
- Access: ADMIN
- Mode: Create

## Purpose

- Upload a single file to the `assets` bucket.
- Show success/failure feedback and return to assets listing.

## API

- `POST /api/v1/files/upload/assets`
- Multipart body:
  - `file` (required)

## UI Behavior

- Upload starts immediately after file selection.
- Success state displays uploaded file summary.
- `Close` action navigates to `/assets`.
