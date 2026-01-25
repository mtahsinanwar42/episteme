# Announcements — Create

## Route

- Path: `/announcements/new`
- Access: ADMIN
- Mode: Create

## Purpose

- Allow ADMIN to create a new announcement.

## API

- `POST /api/v1/announcements` (create)
- File upload (if metadata is created via uploaded JSON/file):
  - Use the project’s file upload endpoint/workflow to obtain `metadataFilePath`

## Form Fields

- Title — text
- Status — single select (integer, numeric-to-label mapping, can be found in utils/constants.js)
- Metadata file — file upload (sets `metadataFilePath`)

## Behavior

- On success:
  - Show success message
  - Navigate to `/announcements`
- On error:
  - Show backend validation/error message

## States

- Loading (submit)
- Error
- Success
