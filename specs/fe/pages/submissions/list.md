# Submissions — List

## Route

- Path: `/submissions`
- Access:
  - USER
  - ADMIN
- Mode: View (read-only)

---

## Purpose

- Display a paginated list of submissions.
- Allow navigation to submission detail page (/submissions/:id).
- Provide role-based visibility (USER / ADMIN).

---

## API

- `GET /api/v1/submissions`
- Trigger: Page load + pagination / sort / filter changes
- Query params: As defined in Submission API spec

---

## UI Requirements

- Layout: **table view**
- Columns (minimum; dev may add more from API response):
  - Title (text)
  - Topics (text, derived from string[])
  - Conference (text)
  - Status (badge)
  - Owner (name & email, for ADMIN role only)
  - Created At (date/time)
  - Updated At (date/time)
  - **Action**: View

- Row click or dedicated “View” action navigates to:
  - `/submissions/:id`

---

## Filters & Sorting

- Status filter
- Conference filter
- Topics filter
- Owner filter (ADMIN only)
- Default sort recommended:
  - Latest activity first (updated date, fallback to created date)

---

## Pagination Requirements

- Pagination is required (page / limit)
- Provide navigation controls:
  - previous / next
  - current page indicator

---

## States

- Loading (initial load)
- Loading (pagination / filter / sort change)
- Empty (no results)
  - USER: show message “You have no submissions yet.”
  - ADMIN: show message “No submissions found.”
- Error (API failure)
