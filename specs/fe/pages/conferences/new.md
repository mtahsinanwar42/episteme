# Conferences — Create

## Route

- Path: `/conferences/new`
- Access: ADMIN
- Mode: Create

## Purpose

- Allow ADMIN to create a new conference.

## API

- `POST /api/v1/conferences` (create)
- File upload (if metadata is created via uploaded JSON/file):
  - Use the project’s file upload endpoint/workflow to obtain `metadataFilePath`

## Form Fields

- Title — text
- Slug — text
- Status — single select (integer, numeric-to-label mapping, can be found in utils/constants.js)
- Start Date — date
- End Date — date
- Submission Start Date — date
- Submission End Date — date
- Metadata file — file upload (sets `metadataFilePath`)

## Behavior

- On success:
  - Show success message
  - Navigate to `/conferences`
- On error:
  - Show backend validation/error message

## States

- Loading (submit)
- Error
- Success
