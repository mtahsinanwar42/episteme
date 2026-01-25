# Trainings — Create

## Route

- Path: `/trainings/new`
- Access: ADMIN
- Mode: Create

## Purpose

- Allow ADMIN to create a new training.

## API

- `POST /api/v1/trainings` (create)
- File upload (if metadata is created via uploaded JSON/file):
  - Use the project’s file upload endpoint/workflow to obtain `metadataFilePath`

## Form Fields

- Title — text
- Status — single select (integer, numeric-to-label mapping, can be found in utils/constants.js)
- Metadata file — file upload (sets `metadataFilePath`)

## Behavior

- On success:
  - Show success message
  - Navigate to the created training detail page (`/trainings/:id`) or to `/trainings` (dev choice)
- On error:
  - Show backend validation/error message

## States

- Loading (submit)
- Error
- Success
