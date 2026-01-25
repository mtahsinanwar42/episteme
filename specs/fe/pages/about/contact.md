# about-contact.md

# About — Contact

## Route

- Path: `/about/contact`
- Access: Public
- Mode: View (read-only)

## Purpose

- Provide contact information and ways to reach the organization.

## Data Source

- Static content (frontend-managed). No API calls required.

## Page Content (developer-defined)

- Read-only contact details:
  - Email (text)
  - Phone (text, optional)
  - Address (text, optional)
  - Social links (optional)
- Optional contact form:
  - If included, it is UI-only for now (no backend API required) unless specified later
- 0–1 image (optional; e.g., map placeholder/banner)

## States

- Default (static render)
