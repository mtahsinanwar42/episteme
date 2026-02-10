# Homepage

## Route

- Path: `/homepage`
- Access: Public
- Mode: View (read-only)

> `/` redirects to `/homepage`

---

## Purpose

- Serve as the primary landing page of the platform.
- Provide high-level visibility into conferences, announcements, trainings, blogs, and activities.
- Act as the main navigation entry point for all user roles via a role-aware header.
- Offer consistent footer access to social and contact links.

---

## Page Structure

### Header (Role-aware Navigation)

The header is always visible and adapts based on the authenticated user’s role.  
If unauthenticated, show a simplified version.

#### USER Header

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
- Search (Input with Button)
- Menu

---

#### REVIEWER Header

- About
- Conferences
- Trainings
- Announcements
- Blogs
- Activities
- Me
  - Profile
  - Logout
- Search (Input with Button)
- Menu

---

#### ADMIN Header

- About
- Users
  - New
  - All
- Submissions
  - New
  - All
- Review Assignments
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
- Assets
  - New
  - All
- Me
  - Profile
  - Logout
- Search (Input with Button)
- Menu

---

### Main Content Area

(Content selection and layout are **developer-defined**.)

Recommended sections (optional, can be reordered or omitted):

- Hero / Intro section
  - Platform title
  - Short description or tagline
- Highlights section
  - Recent or featured:
    - Conferences
    - Announcements
    - Trainings
- Informational sections
  - About summary
  - Call-to-action cards (e.g., “Submit a paper”, “Explore conferences”)
- Content previews
  - Latest blogs
  - Upcoming activities

> All homepage content is **read-only** and may be static or populated via existing public APIs (dev choice).

---

### Footer

#### Footer Links

- Facebook
- LinkedIn
- Contact Us

Footer is visible on all pages and remains static.

---

## API Usage

- No mandatory API calls required.
- Optional (developer choice):
  - Fetch recent/public data from existing public endpoints:
    - Conferences
    - Announcements
    - Trainings
    - Blogs
    - Activities

---

## Behavior

- Header adapts dynamically based on authentication and role.
- Clicking navigation items routes to corresponding pages.
- Logout clears session and redirects to `/homepage`.

---

## States

- Default (static render)
- Loading (only if optional dynamic content is fetched)
- Error (only for optional dynamic content; does not block page)

---

## Notes

- Homepage is intentionally flexible and content-light in spec.
- Visual hierarchy, layout, and styling decisions are left to the frontend developer.
- This page must not expose any admin-only controls in the content area.
