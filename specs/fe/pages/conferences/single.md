# Conferences — Detail

## Route

- Path: `/conferences/:id`
- Access: Public (View) + ADMIN (full update view)
- Mode: View (public) + Update (ADMIN)

## Purpose

- Show a single conference in detail publicly.
- Show published documents (publications) for the conference in a separate section.
- Allow ADMIN to manage/update the conference with a dedicated editable view and a primary Save action.

## API

- Public:
  - `GET /api/v1/conferences/:id` (page load)
  - `GET /api/v1/conferences/:id/publications` (Published Docs section)
- ADMIN:
  - `PUT /api/v1/conferences/:id` (primary Save)

- Metadata rendering:
  - Use `metadataFilePath` returned by the conference detail API
  - Fetch/render metadata content according to your project’s metadata rendering rules (if applicable)

## Page Fields

### Public View (read-only)

- Title (text)
- Status (badge)
- Start Date (date)
- End Date (date)
- Submission Start Date (date)
- Submission End Date (date)

### Published Docs Section (public)

- Section title: Published Docs (or Publications)
- Data source: `GET /api/v1/conferences/:id/publications`
- Display: publication cards

### ADMIN View (editable, primary Save)

- Title — text
- Slug — text
- Status — single select (integer)
- Start Date — date
- End Date — date
- Submission Start Date — date
- Submission End Date — date
- Metadata file — file upload (updates `metadataFilePath`)

## Behavior

- Public view is always accessible.
- Published Docs section is visible publicly and uses the publications API.
- ADMIN sees a dedicated management view:
  - Editable fields listed above
  - Primary Save button triggers `PUT /api/v1/conferences/:id`
- Not found:
  - Invalid id / 404 shows Not Found state.

## States

- Loading (initial)
- Loading (save for ADMIN)
- Error (fetch or save)
- Not found (invalid id / 404)
- Success (save)
