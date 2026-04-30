/**
 * Feature flags for About pages.
 * Set any page to `false` to hide it from the navbar and disable its route.
 */
export const aboutPageFlags: Record<string, boolean> = {
  mission: true,
  ethics: true,
  sustainability: true,
  executive: false,
  policies: false,
  career: false,
  contact: true,
};
