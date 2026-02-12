import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { validateStoredToken } from "@/utils/tokenValidator";
import { setToken, setUser } from "@/stores/authSlice";
import { handleLogout as performLogout } from "@/utils/logoutHandler";
import { api } from "@/services/api";
import type { AppDispatch } from "@/stores/store";

/**
 * Hook to initialize authentication state on app mount
 * - Validates stored JWT token
 * - Restores user from persisted Redux store (already persisted by redux-persist)
 * - Logs out user if token is expired or invalid
 */
export const useAuthInitialization = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Set up the unauthorized callback for API interceptor
        api.setUnauthorizedCallback(() => {
          performLogout(dispatch);
        });

        // Validate stored token
        const tokenValidation = validateStoredToken();

        if (!tokenValidation.valid) {
          // Token is invalid or expired
          console.warn("Token is invalid or expired");
          await performLogout(dispatch);
          dispatch(setUser(null));
          return;
        }

        // Token is valid
        dispatch(setToken(tokenValidation.token));
        console.log("User authenticated and restored from store");
      } catch (error) {
        console.error("Authentication initialization error:", error);
        await performLogout(dispatch);
      }
    };

    initializeAuth();
  }, [dispatch]);
};
