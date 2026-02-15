# Frontend Routing

Canonical route config source: `frontend/src/routeConfig.tsx`

## Core Public Routes

- `/`
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password/:resetToken`
- `/about/mission` (feature-flagged)
- `/about/ethics` (feature-flagged)
- `/about/sustainability` (feature-flagged)
- `/about/executive` (feature-flagged)
- `/about/policies` (feature-flagged)
- `/about/career` (feature-flagged)
- `/about/contact` (feature-flagged)
- `/activities`
- `/activities/search`
- `/activities/:activityId`
- `/announcements`
- `/announcements/search`
- `/announcements/:announcementId`
- `/blogs`
- `/blogs/search`
- `/blogs/:blogId`
- `/trainings`
- `/trainings/search`
- `/trainings/:trainingId`
- `/conferences`
- `/conferences/search`
- `/conferences/:conferenceId`

## Authenticated Profile Routes

- `/profile`
- `/profile/update-password`

## Submission Routes

- `/submissions` (USER, ADMIN)
- `/submissions/new` (USER)
- `/submissions/search` (USER, ADMIN)
- `/submissions/:submissionId` (USER, REVIEWER, ADMIN)
- `/submissions/:submissionId/details` (USER, REVIEWER, ADMIN)
- `/submissions/:submissionId/messages` (USER, REVIEWER, ADMIN)
- `/submissions/:submissionId/versions` (USER, REVIEWER, ADMIN)
- `/submissions/:submissionId/reviews` (REVIEWER, ADMIN)

Notes:

- `/submissions/:submissionId` redirects to `/submissions/:submissionId/details`.
- Status Update, Assign Reviewer, DOI Update, Add Version, and Add Review are modal actions from detail subpages, not standalone routes.

## Review Assignment Routes

- `/review-assignments` (ADMIN)
- `/review-assignments/search` (ADMIN, REVIEWER)
- `/review-assignments/me` (REVIEWER)

## Admin Management Routes

- `/users`
- `/users/new`
- `/users/search`
- `/users/:userId`
- `/assets`
- `/assets/new`
- `/assets/search`
- `/assets/:fileId`
- `/activities/new`
- `/activities/edit/:activityId`
- `/trainings/new`
- `/trainings/edit/:trainingId`
- `/announcements/new`
- `/announcements/edit/:announcementId`
- `/blogs/new`
- `/blogs/edit/:blogId`
- `/conferences/new`
- `/conferences/edit/:conferenceId`

## Utility Routes

- `/unauthorized`
- `/404-not-found`
- `*` -> redirects to `/404-not-found`

## Notes

- Homepage route is `/` (there is no `/homepage` route).
- API usage by route/page is documented in `specs/fe/api-integration.md` and `specs/fe/pages/*`.
