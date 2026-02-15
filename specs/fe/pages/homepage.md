# Homepage

## Route

- Path: `/`
- Access: Public
- Mode: View (read-only)

## Purpose

- Landing page that renders hero + mission + featured blogs + featured activities.
- Shared entry point regardless of auth role.

## Composition

- `HeroSection`
- `HomeMission`
- `HomeBlogSection`
- `HomeActivitySection`

## API Usage

- No direct API calls in `pages/home/index.tsx`.
- Child sections fetch their own public content as needed.

## Navigation / Behavior

- Navbar brand links to `/`.
- Logout flow redirects to `/login` (not `/homepage`).
- About pages are shown/hidden by feature flags in `src/config/featureFlags.ts`.
