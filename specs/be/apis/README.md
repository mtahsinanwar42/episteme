# Backend API Spec (As Implemented)

Base prefix: `/api/v1`

## Route Groups

- `auth` -> `/auth`
- `files` -> `/files`
- `reference data` -> `/reference-data`
- `contact support` -> `/contact-support`
- `users` -> `/users`
- `conferences` -> `/conferences`
- `trainings` -> `/trainings`
- `blogs` -> `/blogs`
- `activities` -> `/activities`
- `announcements` -> `/announcements`
- `submissions` -> `/submissions`
- `review assignments` -> `/review-assignments`
- `notifications` -> `/notifications`

## Notes

- This folder is the canonical API documentation for the current codebase.
- Auth model is JWT bearer token in `Authorization` header for protected routes.
- Most list endpoints support standard advanced query params (`select`, `sort`, `page`, `limit`, `paginate`, filter operators).
- For response/error shape details, refer to each API file and backend middleware/services.
