# Files — Upload (Assets Only)

## Route

- Path: `/files/new`
- Access: ADMIN
- Mode: Create (upload)

## Purpose

- Allow ADMIN to upload a file to the **assets** bucket only.
- After upload, show success and navigate to the file list /files

## API

- File upload endpoint: As defined in File API spec (bucket-based upload): `POST /api/v1/files/upload/assets`
- Constraint:
  - **Only bucket=assets is allowed from the frontend**
  - The upload request must always target the assets bucket (no user-selectable bucket)

## Form Fields

- File — file upload (required)

## Behavior

- Upload target:
  - bucket is fixed to `assets` (frontend-defined)
- On success:
  - Show success message including original file name
  - Navigate Back to `/files` (dev choice)
- On error:
  - Show backend error message

## States

- Loading (upload)
- Error
- Success
