**Auth:**

- POST /api/v1/auth/login PUBLIC
- POST /api/v1/auth/register PUBLIC
- POST /api/v1/auth/forgotPassword PUBLIC
- PUT /api/v1/auth/resetPassword/:token PUBLIC
- GET /api/v1/auth/me authenticated
- PUT /api/v1/auth/me/details authenticated
- PUT /api/v1/auth/me/password authenticated
- GET /api/v1/auth/logout authenticated

**User:**

- GET /api/v1/users ADMIN
- GET /api/v1/users/:id ADMIN
- POST /api/v1/users ADMIN
- PUT /api/v1/users/:id ADMIN
- PUT /api/v1/users/:id/status ADMIN

**Conference:**

- GET /api/v1/conferences public
- GET /api/v1/conferences/:id public
- POST /api/v1/conferences ADMIN
- PUT /api/v1/conferences/:id ADMIN

**Trainings:**

- GET /api/v1/trainings public
- GET /api/v1/trainings/:id public
- POST /api/v1/trainings ADMIN
- PUT /api/v1/trainings/:id ADMIN

**Announcements:**

- GET /api/v1/announcements public
- GET /api/v1/announcements/:id public
- POST /api/v1/announcements ADMIN
- PUT /api/v1/announcements/:id ADMIN

**Blogs:**

- GET /api/v1/blogs public
- GET /api/v1/blogs/:id public
- POST /api/v1/blogs ADMIN
- PUT /api/v1/blogs/:id ADMIN

**File:**

- GET /api/v1/files/:id authenticated + public/owner/reviewer/admin
- GET /api/v1/files/download authenticated + public/owner/reviewer/admin
- POST /api/v1/files/upload/:bucket authenticated

**ContentSubmission:**

- GET /api/v1/submissions authenticated, USER/REVIEWER sees his/her submissions, ADMIN sees all submissions
- GET /api/v1/submissions/:id authenticated
- POST /api/v1/submissions authenticated, for posting submission (+ first version)
- PUT /api/v1/submissions/:id/status authenticated + ADMIN. for updating the status

**ContentSubmissionVersion:**

- POST /api/v1/submissions/:id/versions, authenticated, USER/REVIEWER adds new his/her submission version + message, ADMIN adds a version in any submission.
- GET /api/v1/submissions/:id/versions

**ContentSubmissionMessage:**

- GET /api/v1/submissions/:id/messages authenticated
- POST /api/v1/submissions/:id/messages authenticated

**ContentSubmissionReview:**

- GET /api/v1/submissions/:id/reviews authenticated, REVIEWER/ADMIN
- POST /api/v1/submissions/:id/reviews authenticated, REVIEWER/ADMIN

**ContentReviewAssignment:**

- GET /api/v1/reviewer-assignments REVIEWER, REVIEWER -> Mine / ADMIN -> All
- PUT /api/v1/submissions/:submissionId/reviewers/me/status REVIEWER, updates current user review status. triggered when reviewer submits for review (along with creating new version). ? need two endpoints?
- GET /api/v1/submissions/:id/reviewers ADMIN, shows all assigned reviewers + status, useful for showing msg boxes, to the ADMIN.
- POST /api/v1/submissions/:id/reviewers ADMIN, assign an existing reviewer to the submission review.

**ContentReview:**

- POST /api/v1/submissions/:submissionId/reviews, REVIEWER

**TODOs:**

- POST /api/v1/users/reviewer/submissions/:id ADMIN, creates a new reviewer, assigns a paper to him, sends mail with email, email + password + paper link
