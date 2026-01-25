# Frontend Routing

## Public Routes

### Homepage

- `/` _(redirects to /homepage)_
- `/homepage`

### About

- `/about/mission`
- `/about/ethics`
- `/about/sustainability`
- `/about/executive`
- `/about/policies`
- `/about/career`
- `/about/contact`

### Auth

- `/login`
- `/register`
- `/forgot-password`
- `/reset-password/:resetToken` _(token comes from email link)_

### Public Content

- `/activities`
- `/activities/:id` _(View public; ADMIN can update fields inline)_

- `/announcements`
- `/announcements/:id` _(View public; ADMIN can update fields inline)_

- `/trainings`
- `/trainings/:id` _(View public; ADMIN can update fields inline)_

- `/blogs`
- `/blogs/:id` _(View public; ADMIN can update fields inline)_

- `/conferences`
- `/conferences/:id`
  - _(Publications section visible when conference is eligible for published output (e.g., ended/finished).)_
  - _(ADMIN can update conference fields inline.)_

---

## Authenticated Routes (USER / REVIEWER / ADMIN)

- `/me` _(View + Update inline)_
- `/me/change-password`

- `/submissions/:id`
- `/submissions/:id/versions`
- `/submissions/:id/messages`

---

## Role-Based Routes

### ADMIN

#### Files

- `/files`
- `/files/new`
- `/files/:id` _(metadata view; download action available)_

#### Content Management

- `/activities/new`
- `/blogs/new`
- `/trainings/new`
- `/announcements/new`

#### Conferences

- `/conferences/new`

#### Users

- `/users`
- `/users/new`
- `/users/:id` _(View+Update inline)_

#### Submissions

- `/submissions`
- `/submissions/:id/versions/new` _(or, modal)_
- `/submissions/:id/reviews`
- `/submissions/:id/reviewers`

#### Review Assignments

- `/review-assignments`
- `/review-assignments/new`

---

### REVIEWER

- `/review-assignments/me`
- `/submissions/:id/reviews`
- `/submissions/:id/reviews/new` _(or, modal)_

---

### USER

- `/submissions`
- `/submissions/new`
- `/submissions/:id/versions/new` _(or, modal)_

---

## Route Modes & Permissions Convention

- For each route, the UI can be:
  - View (read-only)
  - Create (form)
  - View + Update (inline) _(same route supports updates if user has permission)_

- If a user lacks permission:
  - Hide edit controls (read-only) + save/update button
  - Attempted actions return 403 and UI shows an error message

## Redirect Rules

- If an unauthenticated user opens an authenticated route:
  - Redirect to `/login`
  - After login, redirect back to the originally requested route (if supported)

- If a user lacks required role:
  - Show 403 page or redirect to a safe default page

---

## Utility Pages

- `/forbidden` _(403 page)_
- `/not-found` _(404 page)_

## Not Found

- Unknown routes → show 404 page
