import { jwtDecode } from "jwt-decode";
import Axios from "axios";
import { logger } from "../utils/logger.js";
import { secureStorage } from "../utils/secureStorage.js";

/**
 * Get the current user's profile information using the stored user_id
 * This function uses a more reliable approach by using the user_id directly
 * instead of trying to decode it from the token
 */
const getCurrentUser = async (setProfile) => {
  try {
    // Try to get auth data from secure storage first
    const authData = secureStorage.getAuthData();

    if (authData && authData.user_id && authData.access_token) {
      logger.debug("Using auth data from secure storage");
      return await fetchUserProfile(authData.user_id, authData.access_token, setProfile);
    }

    // Fallback to localStorage for backward compatibility
    const userId = localStorage.getItem("user_id");
    const token = localStorage.getItem("access_token");

    // Check if we have the necessary data
    if (!userId) {
      logger.info("No user_id found in storage");

      // Try to get user_id from token as fallback
      if (token) {
        try {
          const decoded = jwtDecode(token);
          if (decoded && decoded.user_id) {
            logger.debug("Retrieved user_id from token:", decoded.user_id);
            // Save the user_id for future use
            localStorage.setItem("user_id", decoded.user_id);
            // Continue with the retrieved user_id
            return await fetchUserProfile(decoded.user_id, token, setProfile);
          }
        } catch (decodeError) {
          logger.error("Error decoding token:", decodeError.message);
          // Clear all storage data when token is invalid
          localStorage.clear();
          sessionStorage.clear();
        }
      }

      return null; // No user_id means no logged-in user
    }

    // We have a user_id, so fetch the profile
    return await fetchUserProfile(userId, token, setProfile);

  } catch (error) {
    logger.error("Error in getCurrentUser:", error.response?.data || error.message);
    return null;
  }
};

/**
 * Helper function to fetch user profile data
 */
const fetchUserProfile = async (userId, token, setProfile) => {
  try {

    // Set authorization header if token is available
    const headers = {};
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await Axios.get(
      `${import.meta.env.VITE_API_BASE_URL}/accountsapp/whoami/${userId}`,
      { headers }
    );

    if (response.data) {
      logger.apiResponse(`/accountsapp/whoami/${userId}`, response.data);

      // Update state if setProfile function is provided
      if (setProfile && typeof setProfile === 'function') {
        setProfile(response.data);
      }

      // Store user data in secure storage
      const authData = {
        access_token: token,
        user_id: userId,
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        email: response.data.email,
        role: response.data.role
      };
      secureStorage.setAuthData(authData);

      // Keep localStorage for backward compatibility (temporarily)
      if (response.data.first_name) localStorage.setItem("first_name", response.data.first_name);
      if (response.data.last_name) localStorage.setItem("last_name", response.data.last_name);
      if (response.data.email) localStorage.setItem("user_email", response.data.email);
      if (response.data.role) localStorage.setItem("user_role", response.data.role);

      return response.data;
    }

    return null;
  } catch (error) {
    logger.apiError(`/accountsapp/whoami/${userId}`, error);

    // If unauthorized (401) or not found (404), clear credentials
    if (error.response && (error.response.status === 401 || error.response.status === 404)) {
      logger.warn("Clearing invalid credentials");
      secureStorage.clearAuthData();
      localStorage.removeItem("access_token");
      localStorage.removeItem("user_id");
    }

    return null;
  }
};

export default getCurrentUser;




