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
- POST /api/v1/submissions authenticated
- PUT /api/v1/submissions/:id/status authenticated

**ContentSubmissionVersion:**

- POST /api/v1/submissions/:id/versions, authenticated, USER/REVIEWER adds new his/her submission version + message, ADMIN adds a version in any submission.
- GET /api/v1/submissions/:id/versions

**ContentSubmissionMessage:**

- GET /api/v1/submissions/:id/messages authenticated
- POST /api/v1/submissions/:id/messages authenticated

**ContentSubmissionReview:**

- GET /api/v1/submissions/:id/reviews authenticated, REVIEWER/ADMIN
- GET /api/v1/submissions/:id/reviewers ADMIN
- POST /api/v1/submissions/:id/reviews authenticated, REVIEWER

**ContentReviewAssignment:**

- GET /api/v1/review-assignments/me REVIEWER
- GET /api/v1/review-assignments ADMIN
- POST /api/v1/review-assignments ADMIN
- PUT /api/v1/review-assignments/:id/status REVIEWER/ADMIN

**TODOs:**

- POST /api/v1/submissions/:id/versions, authenticated

  - authenticate
  - For USER,
    -
  - For ADMIN,
  - For REVIEWER,

- POST /api/v1/submissions/:id/messages authenticated

  - only authenticate
  - For USER,

    - Check By ID + By Paid Submission + By OWNER_USR_ID + By NON-DELETED Active CONFERENCE + By Status PENDING APPROVAL, RETURNED
    - If all true, Add MSG as USER_ADMIN, receiver ID null

  - For REVIEWER,

    - Check By ID + By Paid Submission + By ASSIGNED_USR_ID (from CRA) + By NON-DELETED Active CONFERENCE + By Status PENDING APPROVAL, RETURNED
    - If all true, Add MSG as REVIEWER_ADMIN, receiver ID null

  - For ADMIN,
    - Check By ID + By Paid Submission + By NON-DELETED CONFERENCE + By Status PENDING APPROVAL, RETURNED
      - If all true, Add MSG as
      - USER_ADMIN (from payload), senderId the admin, receiverId the submission owner
      - REVIEWER_ADMIN (from payload), senderId the admin, receiverId the reviewer ID

- POST /api/v1/submissions/:id/reviews authenticated, REVIEWER

- Add Payment Events?

- POST /api/v1/users/reviewer/submissions/:id ADMIN, creates a new reviewer, assigns a paper to him, sends mail with email, email + password + paper link
