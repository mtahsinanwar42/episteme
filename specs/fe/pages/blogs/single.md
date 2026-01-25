# Blogs — Detail

## Route

- Path: `/blogs/:id`
- Access: Public (View) + ADMIN (View+Update inline)
- Mode: View + Update inline (ADMIN only)

## Purpose

- Show a single blog in detail.
- Render the blog content from its metadata file.
- Allow ADMIN to update blog fields inline.

## API

- `GET /api/v1/blogs/:id` (page load)
- `PUT /api/v1/blogs/:id` (ADMIN save changes)
- Metadata rendering:
  - Use `metadataFilePath` returned by the blog detail API
  - Fetch/render metadata content according to your project’s metadata rendering rules

## Page Fields

### Read-only for Public

- Title (text)
- Status (badge)
- Created At (date/time)
- Blog content (rendered from metadata file, if present)

### Editable for ADMIN (inline update)

- Title — text
- Status — single select (integer)
- Metadata file — file upload (updates `metadataFilePath`)

## Behavior

- ADMIN inline update:
  - Only show edit controls for ADMIN
  - Save triggers `PUT /api/v1/blogs/:id`

## States

- Loading (initial)
- Loading (save for ADMIN)
- Error (fetch or save)
- Not found (invalid id / 404)
- Success (save)
