import { queryClient } from "@/main";
import type { AppDispatch } from "@/stores/store";
import { logout } from "@/stores/authSlice";

/**
 * List of all private route API query keys that require authentication
 * These queries should be invalidated on logout
 */
const PRIVATE_API_QUERY_KEYS = [
  // User-related
  ["user"],
  ["users"],

  // Conferences
  ["conferences"],
  ["conference"],
  ["conferencePublications"],

  // Submissions
  ["submissions"],
  ["submission"],
  ["submissionVersions"],
  ["submissionMessages"],
  ["submissionReviews"],

  // Review Assignments
  ["reviewAssignments"],
  ["reviewAssignment"],

  // Posts
  ["posts"],
  ["post"],

  // Announcements and generic data
  ["files"],
  ["metadata"],
];

export const invalidatePrivateApiQueries = async () => {
  const invalidatePromises = PRIVATE_API_QUERY_KEYS.map((queryKey) =>
    queryClient.invalidateQueries({
      queryKey,
      exact: false, // Match query keys that start with these values
    }),
  );

  await Promise.all(invalidatePromises);
};

export const handleLogout = async (dispatch: AppDispatch) => {
  try {
    // Invalidate all private API queries
    await invalidatePrivateApiQueries();

    // Dispatch logout action to clear auth state
    dispatch(logout());
  } catch (error) {
    console.error("Error during logout:", error);
    // Still dispatch logout even if cache invalidation fails
    dispatch(logout());
  }
};
