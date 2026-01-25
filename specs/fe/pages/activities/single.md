# Activities — Detail

## Route

- Path: `/activities/:id`
- Access: Public (View) + ADMIN (View+Update inline)
- Mode: View + Update inline (ADMIN only)

## Purpose

- Show a single activity in detail.
- Render the activity content from its metadata file.
- Allow ADMIN to update activity fields inline.

## API

- `GET /api/v1/activities/:id` (page load)
- `PUT /api/v1/activities/:id` (ADMIN save changes)
- Metadata rendering:
  - Use `metadataFilePath` returned by the activity detail API
  - Fetch/render metadata content according to your project’s metadata rendering rules

## Page Fields

### Read-only for Public

- Title (text)
- Status (badge)
- Created At (date/time)
- Activity content (rendered from metadata file, if present)

### Editable for ADMIN (inline update)

- Title — text
- Status — single select (integer)
- Metadata file — file upload (updates `metadataFilePath`)

## Behavior

- ADMIN inline update:
  - Only show edit controls for ADMIN
  - Save triggers `PUT /api/v1/activities/:id`

## States

- Loading (initial)
- Loading (save for ADMIN)
- Error (fetch or save)
- Not found (inva
