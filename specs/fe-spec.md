# Episteme – Frontend Functional Specification (v1.0)

**Product:** Episteme – Conference & Submission Platform  
**Audience:** Frontend Engineers  
**Scope:** UI, navigation, screens, UX behavior  
**Out of Scope:** Backend logic, APIs, database

---

## 1. User Roles

| Role     | Description            |
| -------- | ---------------------- |
| Public   | Not logged in          |
| User     | Registered author      |
| Reviewer | Reviewer               |
| Admin    | Platform administrator |

All UI and navigation must be **role-aware**.

---

## 2. Global Layout

All pages use:

- Header
- Page Content
- Footer

---

## 3. Header Navigation

### 3.1 Public

- About
- Submissions
- Conferences
- Trainings
- Announcements
- Blogs
- Activities
- Login
- Register
- Search, Menu

---

### 3.2 User

- About
- Submissions
  - New
  - My Submissions
- Conferences
- Trainings
- Announcements
- Blogs
- Activities
- Me
  - Profile
  - Logout
- Search, Menu

---

### 3.3 Reviewer

- About
- Submissions
  - New
  - My Submissions
  - Review Required
- Conferences
- Trainings
- Announcements
- Blogs
- Activities
- Me
  - Profile
  - Logout
- Search, Menu

---

### 3.4 Admin

- About
- Users
  - New
  - All
- Submissions
  - New
  - All
- Reviewer Assignments
- Conferences
  - New
  - All
- Trainings
  - New
  - All
- Announcements
  - New
  - All
- Blogs
  - New
  - All
- Activities
  - New
  - All
- Me
  - Profile
  - Logout
- Search, Menu

Navigation must:

- Highlight active route
- Be responsive
- Hide unauthorized links

---

## 4. Footer

- Facebook
- LinkedIn
- Contact Us

Always visible.

---

## 5. Static Pages (About)

| Role   | Route                 | Content             |
| ------ | --------------------- | ------------------- |
| Public | /about/mission        | Mission & Vision    |
| Public | /about/ethics         | Ethics              |
| Public | /about/sustainability | Sustainability      |
| Public | /about/executive      | Executive Committee |
| Public | /about/policies       | Policies            |
| Public | /about/career         | Career              |
| Public | /about/contact        | Contact             |
| Public | /search               | Global Search       |

---

## 6. Authentication

| Role                | Route             | Purpose                |
| ------------------- | ----------------- | ---------------------- |
| Public              | /login            | Login                  |
| Public              | /register         | Register               |
| Public              | /forgot-password  | Request password reset |
| Public              | /reset-password   | Reset password         |
| User/Reviewer/Admin | /profile          | My profile             |
| User/Reviewer/Admin | /profile/password | Change password        |

### 6.1. Form/Table Fields

| Route           | Required                                                                | Optional                                             |
| --------------- | ----------------------------------------------------------------------- | ---------------------------------------------------- |
| /login          | email, password                                                         |                                                      |
| /register       | firstName, lastName, email, password, institution, occupation, country  | phone, linkedinUrl, photoFilePath, cvFilePath, roles |
| /reset-password | password                                                                |
| /profile        | email (readOnly), firstName, lastName, institution, occupation, country | phone, linkedinUrl, photoFilePath, cvFilePath        |

---

## 7. Conferences

| Role          | Route            | Purpose                                     |
| ------------- | ---------------- | ------------------------------------------- |
| Public        | /conferences     | All conferences                             |
| Public, Admin | /conferences/:id | Single conference and its published content |
| Admin         | /conferences/new | Conference Creation                         |

### 7.1. Form/Table Fields

| Route            | Required                                                                                              | Optional                           |
| ---------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------- |
| /conferences     | title, startAt, endAt, status                                                                         | All conferences                    |
| /conferences/:id | title, slug (for update only), startAt, endAt, submissionPeriodStartAt, submissionPeriodEndAt, status | metadataFilePath (for update only) |
| /conferences/new | title, slug, startAt, endAt, submissionPeriodStartAt, submissionPeriodEndAt, status,metadataFilePath  |                                    |

---

## 8. Trainings

| Role                       | Route          | Purpose                  |
| -------------------------- | -------------- | ------------------------ |
| Public                     | /trainings     | All trainings            |
| Public, Admin (for Update) | /trainings/:id | Single training (update) |
| Admin                      | /trainings/new | Trainings Creation       |

### 8.1. Form/Table Fields

| Route          | Required                      | Optional                      |
| -------------- | ----------------------------- | ----------------------------- |
| /trainings     | title,status                  |                               |
| /trainings/:id | title,status                  | metadataFilePath (for update) |
| /trainings/new | title,status,metadataFilePath |                               |

---

## 9. Announcements

| Role   | Route                     | Purpose                    |
| ------ | ------------------------- | -------------------------- |
| Public | /announcements            | All announcements          |
| Public | /announcements/:id        | Single announcement        |
| Admin  | /announcements/:id/update | Single announcement update |
| Admin  | /announcements/new        | Announcement Creation      |

### 9.1. Form/Table Fields

| Route              | Required                      | Optional                                           |
| ------------------ | ----------------------------- | -------------------------------------------------- |
| /announcements     | title                         |                                                    |
| /announcements/:id | title                         | status (for update), metadataFilePath (for update) |
| /announcements/new | title,status,metadataFilePath |                                                    |

## 10. Blogs

| Role   | Route             | Purpose            |
| ------ | ----------------- | ------------------ |
| Public | /blogs            | All blogs          |
| Public | /blogs/:id        | Single blog        |
| Admin  | /blogs/:id/update | Single blog update |
| Admin  | /blogs/new        | Blog Creation      |

### 10.1. Form/Table Fields

| Route      | Required                      | Optional                                          |
| ---------- | ----------------------------- | ------------------------------------------------- |
| /blogs     | title                         |                                                   |
| /blogs/:id | title                         | status (for update),metadataFilePath (for update) |
| /blogs/new | title,status,metadataFilePath |                                                   |

## 11. Activities

| Role   | Route           | Purpose             |
| ------ | --------------- | ------------------- |
| Public | /activities     | All activities      |
| Public | /activities/:id | Single activities   |
| Admin  | /activities/new | Activities Creation |

### 11.1. Form/Table Fields

| Route           | Required                      | Optional                                          |
| --------------- | ----------------------------- | ------------------------------------------------- |
| /activities     | title                         |                                                   |
| /activities/:id | title                         | status (for update),metadataFilePath (for update) |
| /activities/new | title,status,metadataFilePath |                                                   |

## 12. Users

| Role  | Route      | Purpose              |
| ----- | ---------- | -------------------- |
| Admin | /users     | View all users       |
| Admin | /users/new | Create new user      |
| Admin | /users/:id | View and update user |

### 12.1. Form/Table Fields

| Route      | Required                                                                                       | Optional                                      |
| ---------- | ---------------------------------------------------------------------------------------------- | --------------------------------------------- |
| /users     | email,institution,occupation,country,status                                                    |                                               |
| /users/new | firstName, lastName, email, password, institution, occupation, country,status,roles            | phone, linkedinUrl, photoFilePath, cvFilePath |
| /users/:id | firstName, lastName, email (readOnly), password, institution, occupation, country,status,roles | phone, linkedinUrl, photoFilePath, cvFilePath |

---

## 13. Submissions

| Role                  | Route                        | Purpose                                        |
| --------------------- | ---------------------------- | ---------------------------------------------- |
| User,Reviewer         | /submissions/me              | My submissions                                 |
| Reviewer              | /submissions/review-required | Submissions needing review                     |
| Admin                 | /submissions/all             | All submissions                                |
| User, Reviewer        | /submissions/new             | Create submission + 1st Version + message      |
| User, Reviewer, Admin | /submissions/:id             | View submission with versions, message, review |
| Admin                 | /submissions/:id             | Status Update Modal                            |
| User, Reviewer, Admin | /submissions/:id             | Create submission version, message             |

---

### 14. Reviews

| Role     | Route                   | Purpose                                               |
| -------- | ----------------------- | ----------------------------------------------------- |
| Reviewer | /submissions/:id/review | Create review, Create Version, Update reviewer status |

## 15. Reviewer Assignments

| Role  | Route                                               | Purpose                              |
| ----- | --------------------------------------------------- | ------------------------------------ |
| Admin | /submissions/reviewer-assignments                   | View all assignments & review status |
| Admin | /submissions/:submissionId/reviewer-assignments/new | Assign reviewer to submission        |

---

## 16. UI States

Every screen must support:

- Loading
- Empty
- Error
- Success toast
- Forbidden
- Not Found

---

## 17. Frontend Principles

- Role-aware UI
- URL-driven routing
- Each list page supports:
  - Pagination
  - Search
  - Click → details
- Reusable components (Tables, Modals, Forms)
- No business logic in UI

---

## 18. Design Philosophy

- Clean
- Professional
- Data-driven
