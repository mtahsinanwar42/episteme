# Frontend API Integration (As Implemented)

## Backend Base URL

- Config source: `frontend/src/config/config.ts`
- HTTP client: `frontend/src/services/api.ts`
- Auth mode: Bearer token from cookie (`token`) for protected requests

## Active Service -> Backend Mapping

- `authService` -> `/auth/*`
- `userService` -> `/users/*`, `/reference-data/countries`
- `conferenceService` -> `/conferences/*`
- `trainingService` -> `/trainings/*`
- `announcementService` -> `/announcements/*`
- `blogService` -> `/blogs/*`
- `activityService` -> `/activities/*`
- `submissionService` -> `/submissions/*`, `/review-assignments/me`
- `reviewAssignmentService` -> `/review-assignments/*`
- `fileService` -> `/files/*` and static metadata file fetch (`/<storagePath>`)
- `miscService` -> `/reference-data/*`
- `contactService` -> `/contact-support`
- `notificationService` -> `/notifications/*`

## Important Notes

- Asset pages are routed under `/assets/*` and are backed by `/api/v1/files/*`.
- Route `/` is the homepage. There is no `/homepage` route.
- `postService` calls `/posts` endpoints, which are not implemented by this backend. Treat it as legacy/inactive unless a separate posts API is introduced.
