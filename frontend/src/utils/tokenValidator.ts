import Cookies from "js-cookie";

interface DecodedToken {
  exp?: number;
  iat?: number;
  [key: string]: any;
}

/**
 * Decode JWT token (without verification - for client-side checking only)
 * Note: This only decodes the token, it doesn't verify the signature
 */
export const decodeToken = (token: string): DecodedToken | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return null;
    }

    const decoded = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    return decoded;
  } catch (error) {
    console.error("Failed to decode token:", error);
    return null;
  }
};

/**
 * Check if JWT token is expired
 * @param token - JWT token string
 * @returns true if token is expired, false otherwise
 */
export const isTokenExpired = (token: string): boolean => {
  const decoded = decodeToken(token);

  if (!decoded || !decoded.exp) {
    console.warn("Token does not have expiration information");
    return true;
  }

  const currentTimeInSeconds = Math.floor(Date.now() / 1000);
  return decoded.exp < currentTimeInSeconds;
};

/**
 * Get token expiration time
 * @param token - JWT token string
 * @returns expiration timestamp in milliseconds, or null if invalid
 */
export const getTokenExpirationTime = (token: string): number | null => {
  const decoded = decodeToken(token);

  if (!decoded || !decoded.exp) {
    return null;
  }

  return decoded.exp * 1000; // Convert to milliseconds
};

/**
 * Get time remaining until token expires (in seconds)
 * @param token - JWT token string
 * @returns remaining time in seconds, or -1 if token is expired
 */
export const getTimeUntilExpiration = (token: string): number => {
  const decoded = decodeToken(token);

  if (!decoded || !decoded.exp) {
    return -1;
  }

  const currentTimeInSeconds = Math.floor(Date.now() / 1000);
  const timeRemaining = decoded.exp - currentTimeInSeconds;

  return Math.max(timeRemaining, -1);
};

/**
 * Check if stored JWT token in cookies is valid
 * @returns { valid: boolean, token: string | null, expiresIn: number }
 */
export const validateStoredToken = (): {
  valid: boolean;
  token: string | null;
  expiresIn: number;
} => {
  const token = Cookies.get("token");

  if (!token) {
    return {
      valid: false,
      token: null,
      expiresIn: -1,
    };
  }

  const isExpired = isTokenExpired(token);
  const expiresIn = getTimeUntilExpiration(token);

  return {
    valid: !isExpired,
    token,
    expiresIn,
  };
};

/**
 * Get formatted expiration info
 * @param token - JWT token string
 * @returns human-readable expiration info
 */
export const getTokenExpirationInfo = (
  token: string,
): { expiresAt: string; expiresIn: string; isExpired: boolean } | null => {
  const expirationTime = getTokenExpirationTime(token);

  if (!expirationTime) {
    return null;
  }

  const isExpired = isTokenExpired(token);
  const expiresAt = new Date(expirationTime).toLocaleString();
  const timeRemaining = getTimeUntilExpiration(token);

  let expiresIn = "";
  if (isExpired) {
    expiresIn = "Expired";
  } else if (timeRemaining < 60) {
    expiresIn = `${timeRemaining} seconds`;
  } else if (timeRemaining < 3600) {
    expiresIn = `${Math.floor(timeRemaining / 60)} minutes`;
  } else if (timeRemaining < 86400) {
    expiresIn = `${Math.floor(timeRemaining / 3600)} hours`;
  } else {
    expiresIn = `${Math.floor(timeRemaining / 86400)} days`;
  }

  return {
    expiresAt,
    expiresIn,
    isExpired,
  };
};
