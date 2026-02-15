# Assets List

## Route

- Path: `/assets`
- Access: ADMIN
- Mode: View (read-only)

## Purpose

- Show uploaded asset files (filtered to `storage/public/assets`).
- Support sorting, pagination, and quick text filtering.
- Navigate to asset details and asset creation/search pages.

## API

- `GET /api/v1/files`
- Trigger: page load, pagination, and table/search changes
- FE query profile:
  - `sort=-createdAt`
  - `paginate=true`
  - `storageKey[iLike]=storage/public/assets`
  - `page`, `limit`

## Navigation

- View details: `/assets/:fileId`
- New asset: `/assets/new`
- Advanced search: `/assets/search`
